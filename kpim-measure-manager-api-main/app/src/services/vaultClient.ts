import {VAULT_K8S_JWT, VAULT_URL, TENANT_ID, VAULT_ROLE} from "../utils/constants";
import * as $log from "../modules/Logger";
import * as fs from "node:fs";

const vaultClient = require('node-vault')({
    endpoint: VAULT_URL,
    apiVersion: "v1"
});

/*vaultClient.kubernetesLogin({
    jwt: (fs.readFileSync(VAULT_K8S_JWT).toString()),
    role: VAULT_ROLE,
});*/
if (VAULT_K8S_JWT && VAULT_ROLE) {
  // ✅ PRODUZIONE (Kubernetes)
   vaultClient.kubernetesLogin({
    jwt: fs.readFileSync(VAULT_K8S_JWT).toString(),
    role: VAULT_ROLE,
  });
} else {
  // ✅ LOCALE (Vault dev)
  // NIENTE LOGIN
  // Il token è già settato nel client
}

function calculateSecretPath(secretName: string): string {
    return `kpim-${TENANT_ID}/${secretName}`;
}

export async function putSecretIntoVault(secretName: string, username: string, accessKey: string): Promise<string> {
    const pathSecret: string = calculateSecretPath(secretName);
    $log.info("vaultClient", pathSecret);
    try {
        const data = {
            data: {
                "username": Buffer.from(username.toString()).toString('base64'),
                "accessKey": Buffer.from(accessKey.toString()).toString('base64'),
            }
        };
        await vaultClient.write(pathSecret, data);
        if (!pathSecret) {
            throw new Error("Secret not written");
        }
        $log.info("vaultClient", "Secret written");
    } catch (error) {
        $log.error("vaultClient", error);
    }
    return pathSecret;
}

export async function deleteSecretFromVault(secretPath: string) {
    try {
        await vaultClient.delete(secretPath);
        $log.info("vaultClient", "Secret deleted");
    } catch (error) {
        $log.error("vaultClient", error);
    }
}
