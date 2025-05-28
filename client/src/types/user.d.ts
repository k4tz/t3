export interface BaseUser {
    id: string,
    username: string
}

export interface AuthData extends BaseUser {
    id?: null,
    password: string
}
