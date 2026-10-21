import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import {INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, TENANT_ID} from '../utils/constants';
import * as $log from "../modules/Logger"

import axios from 'axios';

async function pingInfluxDB(url: string): Promise<boolean> {
    try {
        const response = await axios.get(`${url}/ping`);
        return response.status === 204;
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return false;
    }
}

pingInfluxDB(INFLUXDB_URL).then(isReachable => {
    if (isReachable) {
        $log.info("InfluxDB", `InfluxDB is reachable`);
    }else {
        $log.error("InfluxDB", `InfluxDB is not reachable`);
    }
});

const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });

export const writeApi: WriteApi = influxDB.getWriteApi(INFLUXDB_ORG, TENANT_ID);
export const queryApi: QueryApi = influxDB.getQueryApi(INFLUXDB_ORG);
