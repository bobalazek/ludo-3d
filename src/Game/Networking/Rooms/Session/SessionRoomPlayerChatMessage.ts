import { Schema, type } from "@colyseus/schema";

export class SessionRoomPlayerChatMessage extends Schema {
    @type("string")
    name: string;

    @type("string")
    text: string;
}
