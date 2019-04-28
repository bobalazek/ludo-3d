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

// how many times per second should we send the updates to the server?
export const GAME_SERVER_UPDATE_RATE = Number(
    process.env.SERVER_UPDATE_RATE || 10
);
