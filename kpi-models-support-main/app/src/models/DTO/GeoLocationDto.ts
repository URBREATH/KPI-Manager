import { Expose } from "class-transformer";

export class GeoLocationDto {
    @Expose()
    latitude: number;
    @Expose()
    longitude: number;
}