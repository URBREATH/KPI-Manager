interface KeycloakGroup {
    name: string;
    path?: string;
    attributes?: Record<string, string[]>;
    realmRoles?: string[];
    clientRoles?: Record<string, string[]>;
    subGroups?: KeycloakGroup[];
}
