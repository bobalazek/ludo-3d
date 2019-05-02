import { AbstractLevel } from '../Level/AbstractLevel';

export class GameManager {
    public static canvas: HTMLCanvasElement;
    public static engine: BABYLON.Engine;

    public static debug: boolean;
    public static activeLevel: AbstractLevel;

    public static boot(config: GameConfigInterface) {
        if (!BABYLON.Engine.isSupported()) {
            alert('Sorry, but your device is unable to run this game :(');
            return false;
        }

        this.debug = config.debug;

        this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true, {
            stencil: true,
        });

        this.activeLevel = new (<any>config.startupLevel)();
        this.activeLevel.onPostLoad(() => {
            this.engine.runRenderLoop(() => {
                this.activeLevel.render();
            });
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    public static switchLevel(level: typeof AbstractLevel) {
        let newActiveLevel = new (<any>level)();
        newActiveLevel.onLevelReady(() => {
            this.activeLevel = newActiveLevel;
        });
    }
}

export interface GameConfigInterface {
    debug: boolean;
    startupLevel: typeof AbstractLevel;
}
