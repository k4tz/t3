export interface BaseUser {
    id: string,
    username: string,
    totalMatches?: number,
    wins?: number,
    losses?: number,
    draws?: number,
    totalStars?: number
}

export interface AuthData extends BaseUser {
    id?: null,
    password: string
}
