import { Expose } from "class-transformer";

export class GeoLocation {
    @Expose()
    latitude: number;
    @Expose()
    longitude: number;
}

