import { Request, Response } from 'express';
import axios from 'axios';
import {
    KPIM_INDICATORS_MANAGER_API_URL,
    KPIM_FORMULA_ENGINE_URL,
    KPIM_LISTENERS_MANAGER_API_URL,
    KPIM_MEASURE_MANAGER_API_URL, KPIM_CONNECTORS_MANAGER_URL,
    KPIM_PUBLISHER_MANAGER_URL, GUI_BASE_URL
} from '../utils/constants';
import {handleApiRequest} from "../services/httpClient";
import {getUserList} from "../services/KeycloakService";
const subPath = '/api/v1';

export async function handleKpiRequest(req: Request, res: Response) {
        const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi`;
        let queryEndpoint = '';
        if (req.body.kpiIds){
            queryEndpoint = '/compare/unit-measures';
        }
        const finalUrl = baseUrl + queryEndpoint;
        return await handleApiRequest(req, res, finalUrl);
}

export async function handleKpiPublicLinkRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi/public-link`;
    return await handleApiRequest(req, res, baseUrl, (data: any) => {
        const token = data?.data?.token;
        if (!token) return data;
        const frontendBaseUrl = GUI_BASE_URL.replace(/\/+$/, '');
        return {
            ...data,
            data: {
                ...data.data,
                publicUrl: `${frontendBaseUrl}/public/kpi/${token}`
            }
        };
    });
}

export async function handleSaveOrionPublicationRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi/orion-publication`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleClearOrionPublicationRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi/orion-publication`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handlePublicKpiRequest(req: Request, res: Response) {
    const url = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/public/kpi/${encodeURIComponent(req.params.token)}`;
    try {
        const result = await axios.get(url, { timeout: 20000 });
        res.setHeader('Cache-Control', 'no-store');
        return res.status(result.status).json(result.data);
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const data = error?.response?.data || { error: error?.message || 'Unknown error' };
        return res.status(status).json(data);
    }
}

export async function handlePublicKpisRequest(req: Request, res: Response) {
    const url = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/public/kpi`;
    try {
        const result = await axios.get(url, { timeout: 20000 });
        res.setHeader('Cache-Control', 'no-store');
        const responseData = result.data;
        if (Array.isArray(responseData?.data)) {
            const frontendBaseUrl = GUI_BASE_URL.replace(/\/+$/, '');
            responseData.data = responseData.data.map((kpi: any) => {
                const token = kpi.publicUrl?.match(/\/public\/kpi\/([^/?#]+)/)?.[1];
                return token
                    ? { ...kpi, publicUrl: `${frontendBaseUrl}/public/kpi/${token}` }
                    : kpi;
            });
        }
        return res.status(result.status).json(responseData);
    } catch (error: any) {
        const status = error?.response?.status || 500;
        const data = error?.response?.data || { error: error?.message || 'Unknown error' };
        return res.status(status).json(data);
    }
}

export async function handleJobRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/cronjob`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleMeasureRequest(req: Request, res: Response) {
    const baseUrl: string = `${KPIM_MEASURE_MANAGER_API_URL}${subPath}/measures`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function getMeasureTypes(req: Request, res: Response){
   const baseUrl: string = `${KPIM_MEASURE_MANAGER_API_URL}${subPath}/measure-types`;
   return await handleApiRequest(req, res, baseUrl);
}

export async function getUnitMeasure(req: Request, res: Response){
    const baseUrl: string = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/unit-measures`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleCloneKpi(req: Request, res: Response){
    const baseUrl: string = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi/clone`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleCloneMeasure(req: Request, res: Response){
    const baseUrl: string = `${KPIM_MEASURE_MANAGER_API_URL}${subPath}/measures/clone`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleHistoricalDataRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_LISTENERS_MANAGER_API_URL}${subPath}/historical-data/query`;
    let queryEndpoint = '/all';
    if (req.query.start && req.query.stop && req.query.lastValue) {
        queryEndpoint = '/date-range';
    }
    const finalUrl = baseUrl + queryEndpoint;
    return await handleApiRequest(req, res, finalUrl);
}

export async function handleFormulaPreview(req: Request, res: Response) {
    const baseUrl = `${KPIM_FORMULA_ENGINE_URL}${subPath}/formula/preview`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleMeasurePreview(req: Request, res: Response) {
    const baseUrl = `${KPIM_CONNECTORS_MANAGER_URL}${subPath}/measures/fetch`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function getUserListController(req: Request, res: Response) {
    const getUserListResult = await getUserList(req.params.tenantId);
    return res.status(200).json(getUserListResult);
}

export async function handleKpiShareRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_INDICATORS_MANAGER_API_URL}${subPath}/kpi/${req.params.id}/share`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleMeasureShareRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_MEASURE_MANAGER_API_URL}${subPath}/measures/${req.params.id}/share`;
    return await handleApiRequest(req, res, baseUrl);
}


export async function handleKpiPublishRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_PUBLISHER_MANAGER_URL}${subPath}/kpi/publish`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleOrionKpiStatusRequest(req: Request, res: Response) {
    try {
        const result = await axios.get(
            `${KPIM_PUBLISHER_MANAGER_URL}${subPath}/kpi/orion/${encodeURIComponent(req.params.id)}/status`,
            { timeout: 15000 }
        );
        return res.status(result.status).json(result.data);
    } catch (error: any) {
        const status = error?.response?.status || 502;
        return res.status(status).json(error?.response?.data || { message: error?.message || 'Orion status check failed' });
    }
}

export async function handleDeleteOrionKpiRequest(req: Request, res: Response) {
    try {
        const result = await axios.delete(
            `${KPIM_PUBLISHER_MANAGER_URL}${subPath}/kpi/orion/${encodeURIComponent(req.params.id)}`,
            { timeout: 15000 }
        );
        return res.status(result.status).json(result.data);
    } catch (error: any) {
        const status = error?.response?.status || 502;
        return res.status(status).json(error?.response?.data || { message: error?.message || 'Orion entity deletion failed' });
    }
}

export async function handleDatasetPublishRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_PUBLISHER_MANAGER_URL}${subPath}/dataset/publish`;
    return await handleApiRequest(req, res, baseUrl);
}

export async function handleFrostServerPublishRequest(req: Request, res: Response) {
    const baseUrl = `${KPIM_PUBLISHER_MANAGER_URL}${subPath}/frostserver/publish`;
    return await handleApiRequest(req, res, baseUrl);
}


