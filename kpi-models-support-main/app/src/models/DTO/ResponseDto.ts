import { Expose } from "class-transformer";

export class ResponseDTO {
    @Expose()
    message: string;
    @Expose()
    data: object;
    @Expose()
    status: number;
}