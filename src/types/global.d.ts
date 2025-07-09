import type { HttpErrortype } from '../errors/HttpError.ts';

declare global {
    var utils: typeof import("../tictactoe/utils/utils.ts");
    interface Error {
        statusCode?: number
    }
    var HttpError: HttpErrortype;
}

export {};