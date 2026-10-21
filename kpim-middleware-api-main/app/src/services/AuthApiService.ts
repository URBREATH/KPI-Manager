import { TokenResponse } from "../models/DTO/TokenResponse"
import { UserInfoResponse } from "../models/DTO/UserInfoResponse"
import { KeycloakService } from "./KeycloakService"
import * as $log from '../modules/Logger';
import { API_BASE_URL, KEYCLOAK_CLIENT_ID } from "../utils/constants";

export class AuthApiService {

    constructor(private keycloakService: KeycloakService) { }

    async getLoginURL(tenantId: string) {
        try {
            const url = await this.keycloakService.getLoginURL(tenantId, KEYCLOAK_CLIENT_ID, `${API_BASE_URL}/api/v1/${tenantId}/auth/callback`)
            $log.info("AuthApiService", `login request for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${url}`)
            return url as string
        } catch (err) {
            $log.error("AuthApiService", `an error occurred getting login url for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${err}`);
        }
    }

    async logout(tenantId: string, refreshToken: string) {
        try {
            await this.keycloakService.logout(tenantId, KEYCLOAK_CLIENT_ID, refreshToken);
            $log.info("AuthApiService", `logout request for ${KEYCLOAK_CLIENT_ID}@${tenantId}`)
            return await this.getLoginURL(tenantId);
        } catch (err) {
            $log.error("AuthApiService", `an error occurred performing logout for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${err}`);
        }
    }

    async getToken(tenantId: string, code: string): Promise<TokenResponse | undefined> {
        try {
            const tkns = await this.keycloakService.getToken(tenantId, KEYCLOAK_CLIENT_ID, `${API_BASE_URL}/api/v1/${tenantId}/auth/callback`, code)
            $log.info("AuthApiService", `token exchange completed for ${KEYCLOAK_CLIENT_ID}@${tenantId}`)
            return tkns
        } catch (err) {
            $log.error("AuthApiService", `an error occurred getting token for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${err}`)
        }
    }

    async getUserInfo(tenantId: string, token: string, refreshToken: string): Promise<UserInfoResponse | undefined> {
        try {
            const info = await this.keycloakService.getUserInfo(tenantId, KEYCLOAK_CLIENT_ID, token, refreshToken)
            $log.info("AuthApiService", `userinfo request for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${JSON.stringify(info.user)}`)
            return info
        } catch (err) {
            $log.error("AuthApiService", `an error occurred getting user info for tenant ${tenantId}: ${err}`)
        }
    }
}