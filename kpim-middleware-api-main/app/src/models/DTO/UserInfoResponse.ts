export interface UserInfo {
    id: string;
    email: string;
    username: string;
    roles: string[];
    firstname: string;
    lastname: string;
    locale: string;
}

export interface UserInfoResponse {
    user: UserInfo;
    access_token: string;
    refresh_token?: string;
}