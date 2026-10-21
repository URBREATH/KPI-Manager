import { ScheduleDTO } from "./ScheduleDto";
import { JobStatus } from "../utils/enum";
import { Expose } from "class-transformer";

export class JobDto {
    @Expose({ name: "id_PK" })
    id?: string;
    @Expose()
    status: JobStatus;
    @Expose()
    schedule: ScheduleDTO;
    @Expose()
    cronJobId?: string;
}
