import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

import { SessionRoomPlayer } from './SessionRoomPlayer';
import { SessionRoomPlayerChatMessage } from './SessionRoomPlayerChatMessage';

export const DICE_ROLL_ACTION = 'dice_roll';
export const TOKEN_MOVE_ACTION = 'token_move';
export const CHAT_MESSAGE_ACTION = 'chat_message';

export const WAITING_FOR_PLAYERS_STATE = 'waiting_for_players';
export const WAITING_FOR_PLAYER_DICE_ROLL_STATE = 'waiting_for_player_dice_roll';
export const WAITING_FOR_PLAYER_TOKEN_MOVE_STATE = 'waiting_for_player_token_move';

export class SessionRoomState extends Schema {
    @type({ map: SessionRoomPlayer })
    players = new MapSchema();

    @type([ SessionRoomPlayerChatMessage ])
    chatMessages = new ArraySchema<SessionRoomPlayerChatMessage>();

    @type("string")
    state: string = WAITING_FOR_PLAYERS_STATE;

    @type("string")
    lastTurnPlayerSessionId: string = '';

    @type("boolean")
    lastTurnPlayerHasLegalMoves: boolean = true;

    @type("uint8")
    lastDiceRollNumber: number = 0;

    @type("string")
    lastDiceRollHash: string = '';
}
