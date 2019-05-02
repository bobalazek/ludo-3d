import { Schema, MapSchema, type } from "@colyseus/schema";

import { SessionRoomPlayerToken } from './SessionRoomPlayerToken';

export const READY_STATE = 'connected';
export const IN_GAME_STATE = 'disconnected';

export class SessionRoomPlayer extends Schema {
    @type("uint8")
    index: number = 1;

    @type("string")
    name: string;

    @type("string")
    sessionId: string;

    @type({ map: SessionRoomPlayerToken })
    tokens = new MapSchema<SessionRoomPlayerToken>();

    @type("boolean")
    connected: boolean = true;

    @type("string")
    state: string = READY_STATE;

    generateTokens() {
        const tokensCount = 4;
        for (let index = 1; index < tokensCount + 1; index++) {
            let token = new SessionRoomPlayerToken();
            token.index = index;
            token.playerIndex = this.index;
            token.point = 'player' + this.index + '_start' + index;

            this.tokens[index] = token;
        }
    }
}
