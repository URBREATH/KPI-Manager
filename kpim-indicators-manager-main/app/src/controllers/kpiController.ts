import { Request, Response, NextFunction } from "express";
import {
    getKpi,
    createKpi,
    deleteKpi,
    getKpiById,
    createPublicKpiLink,
    revokePublicKpiLink,
    getPublicKpiByToken,
    getPublicKpis,
    saveOrionPublication,
    clearOrionPublication,
    updateKpiById,
    cloneKpi,
    updateLastValueKpi, iterativeUpdateStatus, shareKpiService, addViewersToKpiService, compareUnitMeasureService
} from "../services/kpiService";
import {KpiDto, ResponseDTO, unitMeasure, UserDto} from "@he_hurbreath/kpi-models-support-main";
import * as $log from '../modules/Logger';
import {extractUserInfo} from "../services/entityPermissionService";
import { GUI_BASE_URL } from "../utils/constants";

export async function getKpiController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    try {
        let result = await getKpi(user)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function createKpiController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    $log.info(`kpiController`, `user found:` + JSON.stringify(user))

    try {
        $log.info("createKpiController", "Creating KPI");
        let result = await createKpi(req.body, user)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function deleteKpiController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);

    try {
        let result = await deleteKpi(req.params.id, user);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error)
    }
}

export async function getOneKpiController(req: Request, res: Response, next: NextFunction) {

    try {
        let result = await getKpiById(req.params.id)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function createPublicKpiLinkController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await createPublicKpiLink(req.params.id, extractUserInfo(req.headers));
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function revokePublicKpiLinkController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await revokePublicKpiLink(req.params.id, extractUserInfo(req.headers));
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPublicKpiController(req: Request, res: Response, next: NextFunction) {
    const token = req.params.token;
    if (!/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(404).json({ message: 'Public KPI not found', data: {}, status: 404 });
    }
    try {
        const result = await getPublicKpiByToken(token);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPublicKpisController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await getPublicKpis();
        res.setHeader('Cache-Control', 'no-store');
        if (Array.isArray(result.data)) {
            const frontendBaseUrl = GUI_BASE_URL.replace(/\/+$/, '');
            result.data = result.data.map((kpi: any) => {
                const { publicToken, ...publicKpi } = kpi;
                return {
                    ...publicKpi,
                        publicUrl: publicToken ? `${frontendBaseUrl}/public/kpi/${publicToken}` : undefined
                };
            });
        }
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function saveOrionPublicationController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await saveOrionPublication(
            req.params.id,
            req.body?.entityId,
            req.body?.entityUrl,
            extractUserInfo(req.headers)
        );
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function clearOrionPublicationController(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await clearOrionPublication(req.params.id, extractUserInfo(req.headers));
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function updateKpiController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    try {
        let result: ResponseDTO = await updateKpiById(req.params.id, req.body, user)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}


export async function getUnitMeasuresController(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(Object.keys(unitMeasure));
}

export async function cloneKpiController(req: Request, res: Response, next: NextFunction) {
    const kpiDto: KpiDto = req.body;
    try {
        let result = await cloneKpi(kpiDto)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function updateLastValueKpiController(req: Request, res: Response, next: NextFunction) {
    const kpiId: string = req.params.id;
    const value: number = req.body.value;
    try {
        let result = await updateLastValueKpi(kpiId, value);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function handleMeasureOrKpiDeletion(req: Request, res: Response, next: NextFunction) {
    const deleteId = req.params.id;
    try {
       const result: ResponseDTO =  await iterativeUpdateStatus([deleteId]);
       return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function shareKpiController(req: Request, res: Response, next: NextFunction) {
    const user: UserDto = extractUserInfo(req.headers);
    const kpiId: string = req.params.id;
    const editorIds: string[] = req.body.editorIds;
    const viewerIds: string[] = req.body.viewerIds;
    try {
        let result = await shareKpiService(kpiId, editorIds, viewerIds, user);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error)
    }
}

export async function compareKpiController(req: Request, res: Response, next: NextFunction) {
    const kpiIds: string[] = req.body.kpiIds;
    try {
        let result = await compareUnitMeasureService(kpiIds);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}
