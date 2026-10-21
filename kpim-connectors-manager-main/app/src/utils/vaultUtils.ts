import {SourceDto} from '@he_hurbreath/kpi-models-support-main';
import {credentials} from '../types/types';
import {fetchSecretFromVault} from '../services/vaultClient';

export function decodeFromBase64(stringToBeDecoded: string): string {
  return Buffer.from(stringToBeDecoded, 'base64').toString();
}

export async function retrieveCredentialsFromVault(
  connectionDetails: SourceDto
): Promise<credentials> {
  let credentialsObject: credentials = {username: '', accessKey: ''};
  if (
    connectionDetails.auth?.secretPath === undefined ||
    connectionDetails.auth?.secretPath === '' ||
    connectionDetails.auth?.secretPath === null
  ) {
    return credentialsObject;
  } else {
    credentialsObject = await fetchSecretFromVault(
      connectionDetails.auth?.secretPath
    );
  }
  return credentialsObject;
}
