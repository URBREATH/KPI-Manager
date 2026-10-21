import {formulaEngineService} from '../services/formulaEngineService';
import {createResponseDto, FormulaDto, KpiDto, ResponseDTO} from '@he_hurbreath/kpi-models-support-main';
import axios, {AxiosResponse} from "axios";
import {KPIM_INDICATORS_MANAGER_API_URL, KPI_ID} from "../utils/constants";
import {NextFunction, Request, Response} from 'express';

async function getKpiById(): Promise<AxiosResponse> {
    return axios.get(KPIM_INDICATORS_MANAGER_API_URL + `/api/v1/kpi/${KPI_ID}`)
}
export async function evaluateFormulaController(): Promise<any> {
    if (KPI_ID) {
        const getKpiByIdResult: ResponseDTO = (await getKpiById()).data;
        const kpi: KpiDto = getKpiByIdResult.data as KpiDto;
        const kpiName: string = kpi.name;
        let formulaToEvaluate: any = {
            expression: kpi.formula.expression,
            details: kpi.definition.selected
        }

        if (!kpi.formula) {
            throw new Error("jobDto Scheduler not enabled")
        }

        return await formulaEngineService(formulaToEvaluate, kpiName);
    }
}


export async function previewFormulaController(req: Request, res: Response, next: NextFunction) : Promise<any>{
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json( createResponseDto("Error creating Job", 400, {"error": "Missing formula to preview"}));
    }
    const formulaToEvaluate: FormulaDto = req.body;
    try {
    const result: ResponseDTO = await formulaEngineService(formulaToEvaluate);
    res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}
