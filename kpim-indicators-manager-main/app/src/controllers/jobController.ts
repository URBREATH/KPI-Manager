import { Request, Response, NextFunction } from "express";
import {formulaPreviewService} from "../services/jobService";
import {createCronJobService, deleteCronJobService, executionStateCronJobService} from "../services/cronJobService";
import {FormulaDto, KpiDto, ResponseDTO} from "@he_hurbreath/kpi-models-support-main";
import {generateUniqueCronJobName, parseBoolean} from "../utils/cronJobUtils";


export async function previewFormulaController(req: Request, res: Response, next: NextFunction) {
    let payload: FormulaDto = req.body;
    try {
        let result: ResponseDTO = await formulaPreviewService(payload);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function createCronJobController(req: Request, res: Response, next: NextFunction){
    let payload: KpiDto = req.body;
    const cronJobName: string = generateUniqueCronJobName();
    try {
        let result: ResponseDTO = await createCronJobService(payload, cronJobName);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function deleteCronJobController(req: Request, res: Response, next: NextFunction){
    const jobId = req.params.id;
    try {
        let result: ResponseDTO = await deleteCronJobService(jobId);
        return res.status(result.status).json(result);
    }catch (error){
        next(error);
    }
}

export async function executionStateCronJobController(req: Request, res: Response, next: NextFunction){
    const cronJobId: string = req.params.id;
    const suspend: string = req.query.suspend as string;

    const suspendBoolean: boolean | undefined = parseBoolean(suspend);

    if (suspendBoolean === undefined) return res.status(400).json({message: "Invalid value for suspend parameter: "});

    try {
        let result: ResponseDTO = await executionStateCronJobService(cronJobId, suspendBoolean);
        return res.status(result.status).json(result);
    }catch (error){
        next(error);
    }
}
