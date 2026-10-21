import {Measure, UserDto} from "@he_hurbreath/kpi-models-support-main";
import {IncomingHttpHeaders} from "http";
import axios from "axios";
import {KPIM_ADMIN_ROLE_KEYCLOAK} from "../utils/constants";

export function extractUserInfo(headers: IncomingHttpHeaders): UserDto {
    return {
        "X-User-Id": headers['x-user-id'] as string,
        "X-User-Role": headers['x-user-role'] as string,
        "X-Tenant-Id": headers['x-tenant-id'] as string,
        "X-User-Contexts": headers["x-user-contexts"] as string
    }
}

export function filterMeasuresByContext(measures: Measure[], userGroups: string[]): Measure[] {
    if (!userGroups.includes(KPIM_ADMIN_ROLE_KEYCLOAK)) {
        return measures.filter(measure => userGroups.includes(measure.context))
    }
    return measures;
}

export function filterMeasuresByAccess(measures: Measure[], user: UserDto): Measure[] {
    const userGroups: string[] = user["X-User-Contexts"]?.split(",") ?? ["all-users"];
    const contextFilteredMeasures = filterMeasuresByContext(measures, userGroups);

    return contextFilteredMeasures
            .filter(measure => !user["X-Tenant-Id"] || measure.tenantId === user["X-Tenant-Id"])
            .filter(measure => {
                if (measure.ownerId === user["X-User-Id"]) {
                    return true;
                }
                return measure.scope?.editorIds?.includes(user["X-User-Id"]);
            });
}

export function checkOwnership(measures: Measure[], user: UserDto, operation: Operation): boolean {
    return measures.every((item) => {
        const isOwner = item.ownerId === user['X-User-Id'];
        const isEditor = item.scope?.editorIds?.includes(user['X-User-Id']);
        if (isOwner) {
            return true;
        }
        if (isEditor) {
            return checkEditorPermissions(operation);
        }
        return false;
    });
}

function checkEditorPermissions(operation?: Operation): boolean {
    if (!operation) return true;

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


