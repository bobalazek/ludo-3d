import { Schema, type } from "@colyseus/schema";

export class SessionRoomPlayerChatMessage extends Schema {
    @type("uint16")
    id: number;

    @type("string")
    sender: string;

    @type("string")
    text: string;
}
