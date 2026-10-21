import { Expose } from "class-transformer";
import { DateGranularity } from "../utils/enum";

export class ScheduleDTO {
    @Expose()
    id_PK: string;
    @Expose()
    time: DateGranularity;
    @Expose()
    value: number;

}