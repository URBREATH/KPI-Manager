export interface UserDto{
    'X-User-Role': string,
    'X-User-Id': string,
    'X-Tenant-Id': string,
    'X-User-Contexts'?: string
}