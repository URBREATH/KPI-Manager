import {AxiosResponse} from "axios";
import {Measure} from "@he_hurbreath/kpi-models-support-main";

export function mapKpiToTaskSpecs(kpiConnectors: TaskData[]): taskSpecs[]{
    let task: taskSpecs[] = [];
    for (let element of kpiConnectors) {
        task.push({
            name: "",
            partialValues: element.data,
            aggregatedValue: 0
        })
    }
    return task;
}

export function mapToTaskSpecs(input: TaskData[]): taskSpecs[] {
    if (!input || !Array.isArray(input)) {
        throw new Error("Input not valid");
    }
    return input.map((item: any) => {
        if (!item) {
            throw new Error("Data structure not valid");
        }
        return {
            name: "",
            partialValues: item.data,
            aggregatedValue: 0
        };
    });

}

export function mapMeasureDetailsResponses(measureDetailsResponses: AxiosResponse[]): Measure[] {
    return measureDetailsResponses.map(response => response.data.data);
}

