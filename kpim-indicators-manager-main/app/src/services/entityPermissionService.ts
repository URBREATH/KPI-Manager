import {Kpi, UserDto} from "@he_hurbreath/kpi-models-support-main";
import {IncomingHttpHeaders} from "http";
import {KPIM_ADMIN_ROLE_KEYCLOAK} from "../utils/constants";

export function extractUserInfo(headers: IncomingHttpHeaders): UserDto {
    return {
        "X-User-Id": headers['x-user-id'] as string,
        "X-User-Role": headers['x-user-role'] as string,
        "X-Tenant-Id": headers['x-tenant-id'] as string,
        "X-User-Contexts": headers["x-user-contexts"] as string
    }
}
export function filterKpisByContext(kpis: Kpi[], userGroups: string[]): Kpi[] {
    if (!userGroups.includes(KPIM_ADMIN_ROLE_KEYCLOAK)) {
        return kpis.filter(kpis => userGroups.includes(kpis.context))
    }
    return kpis;
}

export function filterMeasuresByAccess(kpis: Kpi[], user: UserDto): Kpi[] {
    const userGroups: string[] = user["X-User-Contexts"]?.split(",") ?? ["all-users"];
    const contextFilteredKpis = filterKpisByContext(kpis, userGroups);
    return contextFilteredKpis
            .filter(kpi => kpi.tenantId === user["X-Tenant-Id"])
            .filter(kpi => {
                if (kpi.ownerId === user["X-User-Id"]) {
                    return true;
                }
                return kpi.scope?.editorIds?.includes(user["X-User-Id"]) || kpi.scope?.viewerIds?.includes(user["X-User-Id"]);
            });
}

export function checkOwnership(kpis: Kpi[], user: UserDto, operation: Operation): boolean {
    return kpis.every((item) => {
        const isOwner = item.ownerId === user['X-User-Id'];
        const isEditor = item.scope?.editorIds?.includes(user['X-User-Id']);
        const isViewer = item.scope?.viewerIds?.includes(user['X-User-Id']);
        if (isOwner) {
            return true;
        }
        if (isEditor) {
            return checkEditorPermissions(operation);
        }

        if (isViewer){
            return checkViewerPermissions(operation);
        }
        return false;
    });
}

function checkEditorPermissions(operation?: Operation): boolean {
    if (!operation) return false;

    switch (operation) {
        case 'READ':
            return true;
        case 'UPDATE':
            return true;
        case 'DELETE':
            return false;
        default:
            return false;
    }
}

function checkViewerPermissions(operation?: Operation): boolean {
    if (!operation) return false;

    switch (operation) {
        case 'READ':
            return true;
        case 'UPDATE':
            return false;
        case 'DELETE':
            return false;
        default:
            return false;
    }
}

