import { Schema, type } from "@colyseus/schema";

export class SessionRoomPlayerToken extends Schema {
    @type("string")
    point: string;

    @type("uint8")
    index: number;

    @type("uint8")
    playerIndex: number;

    @type("boolean")
    canBeMoved: boolean = false;
}
