import { Server } from "colyseus";
import { createServer } from "http";

// we need it, becase inside the LobbyRoom,
//   we include the Game/Gameplay/Board.ts,
//   which uses some babylon stuff.
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
