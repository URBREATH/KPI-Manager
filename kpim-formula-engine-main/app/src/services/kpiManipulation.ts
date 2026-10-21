import {mean, sum, variance} from "mathjs";
import {mode, standardDeviation} from "simple-statistics";
import {mapKpiToTaskSpecs, mapToTaskSpecs} from "../utils/mappingUtils";
import {medianCalculation} from "../utils/operationUtils";
import {Operation, OPERATION_MAPPING} from "../models/enum/enum";
import * as $log from "../modules/Logger";

const { evaluateExpression } = require("./computeEngineClient")

export function normalizeNullValues(taskDataArray: TaskData[]) {
    return taskDataArray.map((taskData) => {
        const dataArray = Array.isArray(taskData.data) ? taskData.data : [taskData.data];
        return {
            data: dataArray.map((value) => value === null ? 0 : value)
        };
    });
}

function findAndReplaceOperation(expression: string): string {
    for (const [key, value] of Object.entries(OPERATION_MAPPING)) {
        const regex = new RegExp(key, 'g'); // Create a global regular expression
        expression = expression.replace(regex, value);
    }
    return expression;
}

function buildTaskObject(extractedNames: any, measureConnectorsResult: TaskData[], kpiConnectorsResult: TaskData[] ): Task {
    let task: Task = {taskKpi: [], taskMeasure: []};
    let taskSpecsMeasure: taskSpecs[];
    let taskSpecsKpis: taskSpecs[];
    if (measureConnectorsResult){
        const measureConnectorsTaskData: TaskData[] = normalizeNullValues(measureConnectorsResult);
        taskSpecsMeasure = mapToTaskSpecs(measureConnectorsTaskData);
        for (let element in taskSpecsMeasure) {
            taskSpecsMeasure[element].name = extractedNames.measures[element];
        }
        task.taskMeasure = taskSpecsMeasure;

    }
    if (kpiConnectorsResult) {
         taskSpecsKpis = mapKpiToTaskSpecs(kpiConnectorsResult);
        for (let element in taskSpecsKpis) {
            taskSpecsKpis[element].name = extractedNames.kpis[element];
        }
        task.taskKpi = taskSpecsKpis;
    }
    return task
}

export async function processDataForLatexFormula(fetchMeasureConnectorsFromRedis: TaskData[], extractedNames: any, expression: string, kpiConnectorsResult: TaskData[]): Promise<number> {
    const taskIstance: Task = buildTaskObject(extractedNames, fetchMeasureConnectorsFromRedis, kpiConnectorsResult);
    const expressionMapped = findAndReplaceOperation(expression);
    let processedLatexExpressionResult: string = processLatexExpression(expressionMapped, taskIstance);
    processedLatexExpressionResult = processedLatexExpressionResult.replace(/\\(\s|$)/g, '');
    processedLatexExpressionResult = processedLatexExpressionResult.replace(/(?<!\\)(frac|sqrt|sum|cdot)/g, '\\$1');
    return await evaluateExpression(processedLatexExpressionResult);
}

export function applyOperation(data: number[], operation: string): number {
    switch (operation) {
        case "avg":
            return mean(data)
        case "sum":
            return sum(data)
        case "max":
            return Math.max(...data)
        case "min":
            return Math.min(...data)
        case "median":
            return medianCalculation(data)
        case "mode":
            return mode(data)
        case "variance":
            return Number(variance(data));
        case "stddev":
            return standardDeviation(data);
        default:
            throw new Error("Invalid operation");
    }
}

function extractOperations(expression: string): ParsedResult {
    let cleanedExpression = expression.replace(/\\left|\\right/g, '');

    const regex: RegExp = /(\w+)\s*\(\s*([^()]+?)\s*\)/g;
    const operations: ParsedOperation[] = [];
    let match: RegExpExecArray | null;
    let newExpression:string = cleanedExpression;

    while ((match = regex.exec(newExpression)) !== null) {
        let operation = match[1];
        let argument = match[2];

        if (!(operation.toLowerCase() in Operation)) {
            continue;
        }

        operations.push({
            operation: operation,
            argument: argument
        });

        newExpression = newExpression.replace(match[0], `#${operations.length - 1}#`);
    }
    $log.info('kpiManipulation', `Operations extracted: ${operations}`)
    $log.info('kpiManipulation', `New expression: ${newExpression}`)

    return {
        operations,
        newExpression
    };
}

function getMeasureValues(task: Task, measureName: string): number[] | null {
    for (const taskSpec of task.taskMeasure) {
        if (taskSpec.name === measureName) {
            return taskSpec.partialValues;
        }
    }
    for (const taskSpec of task.taskKpi) {
        if (taskSpec.name === measureName) {
            return taskSpec.partialValues;
        }
    }
    return null;
}


function substituteResults(expression: string, operations: ParsedOperation[], results: number[]): string {
    let newExpression = expression;
    operations.forEach((op, index) => {
        newExpression = newExpression.replace(`#${index}#`, results[index].toString());
    });
    return newExpression;
}


export function processLatexExpression(latexExpression: string, task: Task): string {
    let parsedResult: ParsedResult = extractOperations(latexExpression);

    while (parsedResult.operations.length > 0) {
        const results: number[] = parsedResult.operations.map(op => {
            const data: number[] | null = getMeasureValues(task, op.argument);
            if (!data) throw new Error(`Argument not found: ${op.argument}`);
            return applyOperation(data, op.operation);
        });
        const updatedExpression = substituteResults(parsedResult.newExpression, parsedResult.operations, results);
        parsedResult = extractOperations(updatedExpression);
    }
    parsedResult.newExpression = parsedResult.newExpression.replace(/\b\w+\b/g, (match) => {
        const aggregatedValue: number | null = getAggregatedValue(task, match);
        return aggregatedValue !== null ? aggregatedValue.toString() : match;
    });
    parsedResult.newExpression = parsedResult.newExpression.replace(/\\/g, '');
    return parsedResult.newExpression;
}


function getAggregatedValue(task: Task, measureName: string): number | null {
    for (let taskSpec of task.taskMeasure) {
        if (taskSpec.name === measureName) {
            return taskSpec.aggregatedValue;
        }
    }
    for (let taskSpec of task.taskKpi) {
        if (taskSpec.name === measureName) {
            return taskSpec.aggregatedValue;
        }
    }
    return null;
}





