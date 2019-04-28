import { Room, Client } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

export class LobbyRoomPlayer extends Schema {
    @type("string") name: string;
}

export class LobbyRoomState extends Schema {
    @type({ map: LobbyRoomPlayer })
    players = new MapSchema();
}

export class LobbyRoom extends Room {
    onInit () {
        this.setState(new LobbyRoomState());
    }

    onJoin (client: Client) {
        this.state.players[client.sessionId] = new LobbyRoomPlayer();
    }

    onMessage (client: Client, message: any) {
        console.log(client);
        console.log(message);
    }

    onLeave (client: Client) {
        delete this.state.players[client.sessionId];
    }

    onDispose () { }
}
