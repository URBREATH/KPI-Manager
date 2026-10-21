import axios, {AxiosResponse} from "axios";
import qs from "qs";
import {EtcdService} from "./EtcdService";
import {TokenResponse} from "../models/DTO/TokenResponse";
import * as $log from '../modules/Logger';
import {
    KEYCLOAK_ACCOUNT_PASSWORD,
    KEYCLOAK_ACCOUNT_USERNAME,
    KEYCLOAK_BASE_URL,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_REALM
} from "../utils/constants";
import {UserDto} from "@he_hurbreath/kpi-models-support-main";
import * as console from "node:console";
import {IncomingHttpHeaders} from "http";
import {UserRole} from "../models/DTO/UserRole";



// map to cache secret for tenants-app
const secretMap = new Map<string, string>();

// map to cache keycloak realms for tenants
const realmMap = new Map<string, string>();

const etcdService = new EtcdService();


export class KeycloakService {

    async getLoginURL(tenantId: string, clientId: string, callbackURL: string) {
        const realm = await this.getRealm(tenantId, clientId);
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: callbackURL
        });
        return `${KEYCLOAK_BASE_URL}/realms/${encodeURIComponent(realm)}/protocol/openid-connect/auth?${params.toString()}`;
    }

    async getToken(tenantId: string, clientId: string, callbackURL: string, code: string) {
        const clientSecret = this.getSecret(tenantId, clientId);
        const realm = await this.getRealm(tenantId, clientId);
        
        $log.info("realm keycloak Service",realm);
   

        const res = await axios.request({
            url: `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            data: qs.stringify({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackURL,
            }, { encode: false }),
            validateStatus(status) { return true }
        }).catch(err => {
            const error = new Error(`processing error: ${err}`)
            throw error
        });
        if (res.status !== 200) {
    $log.error('Keycloak token error', JSON.stringify({
    status: res.status,
    statusText: res.statusText,
    data: res.data
}, null, 2));
    throw new Error(`processing error: ${res.status} ${JSON.stringify(res.data)}`);
}


        if (res.status === 200) {
            return { access_token: res.data.access_token, refresh_token: res.data.refresh_token } as TokenResponse
        } else {
            const error = new Error(`processing error: ${res.statusText}`)
            throw error
        }
    }

    async getUserInfo(tenantId: string, clientId: string, token: string, refresh_token?: string, refresh: boolean = true): Promise<any> {
        const realm = await this.getRealm(tenantId, clientId);

        const res = await axios.request({
            url: `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/userinfo`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            validateStatus(status) { return true }
        }).catch(err => {
            const error = new Error(`processing error: ${err}`)
            throw error
        });
        if (res.status === 200 || res.status === 201) {

            return {
                user: {
                    id: res.data.sub,
                    email: res.data.email,
                    username: res.data.preferred_username || "",
                    roles: res.data.roles,
                    firstname: res.data.given_name || "",
                    lastname: res.data.family_name || "",
                    locale: res.data.locale || "en"
                },
                access_token: token,
                refresh_token
            }

        } else if (res.status === 401 && refresh_token) { // try refresh token

            $log.info("KeycloakService", `token has expired...trying to refresh`)

            const rt_res = await this.refreshToken(tenantId, clientId, refresh_token)

            if (rt_res.status === 200 || rt_res.status === 201) {
                return this.getUserInfo(tenantId, clientId, rt_res.data.access_token, rt_res.data.refresh_token, false)
            }
        } else {
            const error = new Error(`Keycloak returned status: ${res.status}`)
            throw error
        }
    }

    async logout(tenantId: string, clientId: string, refresh_token: string) {

        const clientSecret = this.getSecret(tenantId, clientId);
        const realm = await this.getRealm(tenantId, clientId);

        const res = await axios.request({
            url: `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/logout`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
                refresh_token,
                client_id: clientId,
                client_secret: clientSecret
            }),
            validateStatus(status) { return true }
        });

        if (res.status === 200 || res.status === 204) {
            return
        } else {
            const error = new Error(`processing error: ${res.statusText}`)
            throw error
        }
    }

    async refreshToken(tenantId: string, clientId: string, refreshToken: string) {

        const clientSecret = this.getSecret(tenantId, clientId);
        const realm = await this.getRealm(tenantId, clientId);

        const res = await axios.request({
            url: `${KEYCLOAK_BASE_URL}/realms/${realm}/protocol/openid-connect/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            data: qs.stringify({
                grant_type: 'refresh_token',
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            }),
            validateStatus(status) { return true }
        }).catch(err => {
            const error = new Error(`processing error: ${err}`)
            throw error
        });

        return res

    }

    getSecret(_tenantId: string, _clientId: string): string {
        if (!KEYCLOAK_CLIENT_SECRET) {
            throw new Error("KEYCLOAK_CLIENT_SECRET is not configured");
        }
        return KEYCLOAK_CLIENT_SECRET;
        

       /* const id = `${tenantId.toUpperCase()}_${clientId.toUpperCase()}`

        if (!secretMap.has(id)) {

            const clientSecret = await etcdService.get(`${id}_KEYCLOAK_CLIENT_SECRET`);
            $log.info("KeycloakService", `retrieved client secret for ${id}: ${clientSecret}`);

            if (!clientSecret) throw new Error(`Keycloak client secret for ${id} is not defined`);

            secretMap.set(id, clientSecret)

            // set watcher in order to automatically update secret whenever it changes
            etcdService.watch(`${id}_KEYCLOAK_CLIENT_SECRET`, (value) => {
                secretMap.set(id, value)
                $log.info("KeycloakService", `updated client secret for ${id}: ${value}`);
            }).catch(error => {
                throw new Error(`Keycloak client secret for ${id} is not defined: ${error}`);
            })
        }

        return secretMap.get(id) as string;*/

    }

    async getRealm(tenantId: string, clientId: string) {
        return KEYCLOAK_REALM || tenantId;

       /* const id = `${tenantId.toUpperCase()}_${clientId.toUpperCase()}`

        if (!realmMap.has(id)) {
            let realm = await etcdService.get(`${id}_KEYCLOAK_REALM`);
            $log.info("KeycloakService", `retrieved realm for ${id}: ${realm}`);

            if (!realm) throw new Error(`Keycloak realm for ${id} is not defined`);

            realmMap.set(id, realm)

            // set watcher in order to automatically update realm whenever it changes
            etcdService.watch(`${id}_KEYCLOAK_REALM`, (value) => {
                realmMap.set(id, value)
                $log.info("KeycloakService", `updated realm for ${id}: ${value}`);
            }).catch(error => {
                throw new Error(`Keycloak realm for ${id} is not defined: ${error}`);
            })
        }

        return realmMap.get(id) as string;*/

    }
}

export async function getTokenServiceAccount(tenantId: string): Promise<string>{
    try {
        const keycloakService = new KeycloakService();
        const clientSecret: string = await keycloakService.getSecret(tenantId, KEYCLOAK_CLIENT_ID);
        const response = await axios.post(`${KEYCLOAK_BASE_URL}/realms/${tenantId}/protocol/openid-connect/token`,
                new URLSearchParams({
                    'client_id': KEYCLOAK_CLIENT_ID,
                    'client_secret': clientSecret,
                    'username': KEYCLOAK_ACCOUNT_USERNAME,
                    'password': KEYCLOAK_ACCOUNT_PASSWORD,
                    'grant_type': 'password'
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
        );
        return response.data.access_token;
    } catch (error) {
        const tokenError = error as unknown as { response?: { data?: unknown }; message?: string };
        $log.error('Error fetching the token:', String(tokenError.response?.data ?? tokenError.message ?? error));
    }
    return '';
}

export async function getUserList(tenantId: string) : Promise<string[]>{
    const token: string = await getTokenServiceAccount(tenantId);
    const userListRequest: AxiosResponse<any,any> = await axios.get(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    return (userListRequest.data).map(((user => ({
                id: user.id,
                username: user.username,
                email: user.email,
    }))));
}

export async function extractUserRoleInfo(tenantId: string, userId: string, authorizationToken: string ){
    return (await axios.get(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/users/${userId}/role-mappings/realm`, {
        headers: {
            'Authorization': authorizationToken
        }
    })).data as UserRole[];
}

