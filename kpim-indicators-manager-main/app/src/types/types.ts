
interface PayloadInflux {
    originatorId: string,
    ts: number,
    measurement: string,
    data: {
        result: number
    }
}

type Operation = "UPDATE" | "DELETE" | "READ";

type KpiPartial = {
    id: string,
    name: string,
    unitMeasure: string,
    schedule: {
        time: string,
        value: number
    },
}
