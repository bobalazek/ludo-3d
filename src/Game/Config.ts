export const DEBUG = process.env.DEBUG
    && process.env.DEBUG === 'true'
    || true;

/********** Game server **********/
export const GAME_SERVER_PORT = Number(
    process.env.GAME_SERVER_PORT || 8081
);

export const GAME_SERVER_HOST = process.env.GAME_SERVER_HOST
    || typeof window !== 'undefined'
        ? window.location.hostname
        : 'localhost';
