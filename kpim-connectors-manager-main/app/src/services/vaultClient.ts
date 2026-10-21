import {VAULT_K8S_JWT, VAULT_ROLE, VAULT_URL} from '../utils/constants';
import * as $log from '../modules/Logger';
import {credentials} from '../types/types';
import {decodeFromBase64} from '../utils/vaultUtils';
import * as fs from 'node:fs';

$log.info('vaultClient', `VAULT_URL: ${VAULT_URL}, VAULT_ROLE: ${VAULT_ROLE}`);
const vaultClient = require('node-vault')({
  endpoint: VAULT_URL,
  apiVersion: 'v1',
});

async function vaultLoginWithKubernetes() {
  await vaultClient.kubernetesLogin({
    jwt: fs.readFileSync(VAULT_K8S_JWT!).toString(),
    role: VAULT_ROLE,
  });
}

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

/*vaultClient.kubernetesLogin({
  jwt: fs.readFileSync(VAULT_K8S_JWT!).toString(),
  role: VAULT_ROLE,
});*/

export async function fetchSecretFromVault(
  secretPath: string
): Promise<credentials> {
  let secret: any;
  await vaultLoginWithKubernetes();
  try {
    secret = await vaultClient.read(secretPath);
  } catch (error) {
    $log.error('vaultClient', error);
  }
  return {
    username: decodeFromBase64(secret.data.data.username),
    accessKey: decodeFromBase64(secret.data.data.accessKey),
  } as credentials;
}
