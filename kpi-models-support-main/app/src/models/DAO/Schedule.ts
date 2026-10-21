import { Expose } from "class-transformer";
import { DateGranularity } from "../utils/enum";

export class Schedule {
    @Expose()
    time: DateGranularity;
    @Expose()
    value: number;
}