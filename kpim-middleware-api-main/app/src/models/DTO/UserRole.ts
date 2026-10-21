export interface UserRole {
    id: string,
    name: string,
    description: string,
    composite: boolean,
    clientRole: boolean,
    containerId: string,
}
