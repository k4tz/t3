export {};

declare global {
    var utils: typeof import("../tictactoe/utils/utils.ts");
    interface Error {
        statusCode?: number
    }
}