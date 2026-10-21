export const OPERATION_MAPPING: operationMapping = {
    "\\mu": "\\avg",
    "\\Sigma": "\\sum",
    "\\med": "\\median",
    "\\Mo": "\\mode",
    "\\sigma": "\\stddev"
};


export enum Operation {
    avg = "avg",
    sum = "sum",
    max = "max",
    min = "min",
    median = "median",
    mode = "mode",
    variance = "variance",
    stddev = "stddev"
}
