import {KEYCLOAK_BASE_URL} from "../utils/constants";
import axios, {AxiosResponse} from "axios";
import {extractUserRoleInfo, getTokenServiceAccount} from "./KeycloakService";
import {UserRole} from "../models/DTO/UserRole";

export async function createContextService(tenantId: string, keycloakGroup: KeycloakGroup) {
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.post(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/groups`, keycloakGroup, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });
}

export async function getContextsService(tenantId: string){
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.get(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/groups`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });

}

export async function getContextByIdService(tenantId: string, contextId: string){
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.get(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/groups/${contextId}`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });
}

export async function updateContextService(tenantId: string, contextId: string, groupAttributes: any){
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.put(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/groups/${contextId}`, groupAttributes, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });

}

export async function deleteContextService(tenantId: string, contextId: string){
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.delete(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/groups/${contextId}`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });
}

export async function getUserContextsService(tenantId: string, userId: string): Promise<AxiosResponse>{
    const serviceAccountAuthorizationToken = `Bearer ${await getTokenServiceAccount(tenantId)}`;
    return await axios.get(`${KEYCLOAK_BASE_URL}/admin/realms/${tenantId}/users/${userId}/groups`,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": serviceAccountAuthorizationToken
        }
    });
}

export async function checkPermissions(tenantId: string, userId: string, auhtorizationToken: string): Promise<boolean>{
    const userRole: UserRole[] = await extractUserRoleInfo(tenantId,userId, auhtorizationToken);
    for (let role of userRole) {
        if (role.name === 'admin') {
            return true;
        }
    }
    return false
}
