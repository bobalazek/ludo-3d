import * as BABYLON from 'babylonjs';

import { GameManager } from "./Framework/Core/GameManager";
import { DEBUG } from './Game/Config';
import { SessionLevel } from "./Game/Levels/SessionLevel";

// Boot up the game!
GameManager.boot({
    debug: DEBUG,
    startupLevel: SessionLevel,
});
