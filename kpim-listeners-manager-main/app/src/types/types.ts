interface HistoricalDataDto {
    value: number[];
    timestamp: string[];
    statistics: {
        min: number;
        max: number;
        avg: number;
    }
}
interface HistoricalDataKpimEngineDto {
    measurementId: string;
    value: number[]
}
