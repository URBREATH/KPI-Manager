type Task = {
    taskKpi: taskSpecs[],
    taskMeasure: taskSpecs[]
}


type taskSpecs = {
    name: string,
    partialValues: number[],
    aggregatedValue: number
}

type operationMapping = Record<string, string>


interface ParsedOperation {
    operation: string;
    argument: string;
}

interface ParsedResult {
    operations: ParsedOperation[];
    newExpression: string;
}


interface PayloadInflux {
    originatorId: string,
    ts: number,
    measurement: string,
    data: {
        result: number
    }
}

interface TaskData {
    data: number[]
}
