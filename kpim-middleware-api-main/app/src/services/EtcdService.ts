import { Etcd3 } from "etcd3";
import * as $log from '../modules/Logger';
import { ETCD_ENABLED, ETCD_HOSTS } from "../utils/constants";

export class EtcdService {

    private etcd: Etcd3 = new Etcd3();

    constructor() {
        if (ETCD_ENABLED) {
            this.etcd = new Etcd3({
                hosts: ETCD_HOSTS ?? 'localhost:2379'
            });
        }

        $log.info("EtcdService", `initialized`);
    }

    async get(key: string) {
        $log.info("ETCD", "ETCD GET - Attempting to retrieve key: " + key);
        if (!ETCD_ENABLED) {
            $log.warn("ETCD", "ETCD GET - ETCD not enabled, retrieving from process.env");
            return process.env[key] || null;
        }
        try {
            let result = await this.etcd.get(key).string();
            return result;
        } catch (error) {
            $log.error("ETCD", "ETCD GET - Error: ");
            throw error;
        }
    }

    async put(key: string, value: string) {
        if (!ETCD_ENABLED) return;

        await this.etcd.put(key).value(value);
    }

    async remove(key: string) {

        if (!ETCD_ENABLED) return;

        await this.etcd.delete().key(key).exec();
    }

    watch(key: string, callback: (value: string) => void): Promise<void> {
        if (!ETCD_ENABLED) return Promise.resolve();

        return new Promise((resolve, reject) => {
            this.etcd.watch().key(key).create()
                .then(watcher => {

                    watcher.on("put", res => callback(res.value.toString()));
                    resolve();
                })
                .catch(err => {
                    reject(err);
                })
        });
    }
}