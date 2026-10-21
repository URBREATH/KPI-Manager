import {
    createResponseDto,
    FormulaDto,
    Measure
} from "@he_hurbreath/kpi-models-support-main";
import {
    KPI_ID, SERVER_MODE
} from "../utils/constants";
import * as $log from '../modules/Logger';
import {
    invokeListenersManagerService,
    invokeMeasureConnectorsService, invokeMeasureManagerService, updateLastValueIndicatorsManager
} from "./apiService";
import {processDataForLatexFormula} from "./kpiManipulation";
import {distributeTaskMessage} from "./messageService";

function extractAndStringifySourceIds(dataSource: Measure[]): string {
    let sourceIds: string[] = dataSource.map((measure) => measure.source.id_PK);
    return JSON.stringify(sourceIds).replace("[", "").replace("]", "").replace(/"/g, "");
}

function extractNamesFromFormula(details: any[]): { measures: string[], kpis: string[] } {
    const measures: string[] = [];
    const kpis: string[] = [];

    details.forEach(details => {
        if (details.type === "measure") {
            measures.push(details.name);
        } else if (details.type === "kpi") {
            kpis.push(details.name);
        }
    });

    return { measures, kpis };
}

export async function formulaEngineService(formulaToEvaluate: FormulaDto, kpiName?: string){
    try {
        let fetchKpisListenersManager: TaskData[] = [];
        let taskDataArray: TaskData[] = [];
        const expression: string = formulaToEvaluate.expression;
        const measureDetails: Measure[] = await invokeMeasureManagerService(formulaToEvaluate.details);
        const sourceIds: string = extractAndStringifySourceIds(measureDetails);
        const extractedNames = extractNamesFromFormula(formulaToEvaluate.details);
        if (sourceIds.length >= 1) {
            const resultInvokeMeasureConnectorsService: number[][] = (await invokeMeasureConnectorsService(sourceIds)).data.data;
            taskDataArray = resultInvokeMeasureConnectorsService.map((array) => ({
                data: array
            }));
        }
        if (extractedNames.kpis.length >= 1) {
            fetchKpisListenersManager = await invokeListenersManagerService(extractedNames.kpis);
        }
        const dataProcessed: number = await processDataForLatexFormula(taskDataArray, extractedNames, expression, fetchKpisListenersManager);
        if (Number.isNaN(dataProcessed)) return createResponseDto("Error in formula evaluation", 400, {result: dataProcessed});
        if (SERVER_MODE === "true") {
            return createResponseDto("Formula preview executed", 200, {result: dataProcessed});
        }
        await distributeTaskMessage(dataProcessed, kpiName);
        $log.info("formulaEngineService", `Updating the lastValue calculated: ${dataProcessed} into the KPI with the id: ${KPI_ID} `)
        await updateLastValueIndicatorsManager(dataProcessed);
        return createResponseDto("Formula preview executed", 200, {result: dataProcessed});
    }catch(error){
        $log.error("formulaEngineService", `Error in formula evaluation - ${error}`);
        return createResponseDto("Error in formula evaluation", 200, {error: error.message});
    }
}


