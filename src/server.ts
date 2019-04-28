import { Server } from "colyseus";
import { createServer } from "http";
import * as BABYLON from 'babylonjs';

import { GAME_SERVER_PORT } from './Game/Config';
import { LobbyRoom } from './Game/Network/Rooms/Lobby/LobbyRoom';
import { SessionRoom } from './Game/Network/Rooms/Session/SessionRoom';

const gameServer = new Server({
  server: createServer(),
});

// Rooms
gameServer.register("lobby", LobbyRoom);
gameServer.register("session", SessionRoom);

gameServer.listen(GAME_SERVER_PORT);
