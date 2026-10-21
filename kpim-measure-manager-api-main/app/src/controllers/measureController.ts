import {Request, Response, NextFunction} from "express";
import {
    getMeasures,
    deleteMeasure,
    getMeasureById,
    updateMeasureById,
    createMeasure,
    getOneSourceById, removeIdsForClone, addEditorsToMeasureService
} from "../services/measureService";
import {MeasureDto, MeasureType, ResponseDTO, SourceDto, UserDto} from "@he_hurbreath/kpi-models-support-main";
import {extractUserInfo} from "../services/entityPermissionService";
import * as $log from '../modules/Logger';
export async function getMeasuresController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    try {
        let result = await getMeasures(user)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function addEditorsToMeasureController(req: Request, res: Response, next: NextFunction) {
    const user: UserDto = extractUserInfo(req.headers);
    const measureId: string = req.params.id;
    const editorsId: string[] = req.body.editorIds;
    try {
        let result = await addEditorsToMeasureService(measureId, editorsId, user);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error)
    }
}

export async function deleteMeasuresController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    try {
        let result = await deleteMeasure(req.params.id, user);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error)
    }
}

export async function getOneMeasureController(req: Request, res: Response, next: NextFunction) {
    try {
        let result = await getMeasureById(req.params.id)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function cloneMeasureController(req: Request, res: Response, next: NextFunction) {
    const measureToClone: MeasureDto = req.body;
    let user: UserDto = extractUserInfo(req.headers);
    try {
        const measureToCloneClean = removeIdsForClone(measureToClone);
        const createMeasureResult = await createMeasure(measureToCloneClean, user)
        return res.status(createMeasureResult.status).json(createMeasureResult);
    } catch (error) {
        next(error);
    }
}

export async function updateMeasureController(req: Request, res: Response, next: NextFunction) {
    let user: UserDto = extractUserInfo(req.headers);
    try {
        let result = await updateMeasureById(req.params.id, req.body, user)
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function getMeasureTypeController(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(Object.keys(MeasureType));
}


export async function createMeasureController(req: Request, res: Response, next: NextFunction) {
    let measureDto: MeasureDto = req.body;
    let user: UserDto = extractUserInfo(req.headers);
    if(user['X-User-Contexts'])
    $log.info("user", user['X-User-Contexts']);
    try {
        const result: ResponseDTO | undefined = await createMeasure(measureDto, user);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}


export async function getOneSourceByIdController(req: Request, res: Response, next: NextFunction) {
    try {
        let result: SourceDto = await getOneSourceById(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
