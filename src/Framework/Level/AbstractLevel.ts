import { GameManager } from '../Core/GameManager';
import { MeshManager } from '../Core/MeshManager';

export class AbstractLevel {
    protected _scene: BABYLON.Scene;
    protected _assetsManager: BABYLON.AssetsManager;
    protected _meshManager: MeshManager;
    protected _onLevelReadyIntervalTime: number = 100;
    protected _isLoaded: boolean = false;
    protected _isAssetsLoaded: boolean = false;

    constructor() {
        this._scene = new BABYLON.Scene(<any>GameManager.engine);
        this._assetsManager = new BABYLON.AssetsManager(this._scene);
        this._meshManager = new MeshManager(this);

        if (GameManager.debug) {
            this._scene.debugLayer.show();
        }

        // Check when scene is actually ready
        let sceneReadyInterval = setInterval(() => {
            if (this._scene.isReady()) {
                clearInterval(sceneReadyInterval);
                this.onReady();
            }
        }, this._onLevelReadyIntervalTime);
    }

    /********** User overwritable methods **********/

    /**
     * Starts the game logic.
     */
    public start() {
        // Your game logic will be here ...
    }

    /**
     * If you need to do something before we start the level, like manually loading meshes via the MeshManager.
     */
    public onPreStart(callback: () => void) {
        callback();
    }

    /**
     * When the scene is fully ready, meaning: geometry ready, textures applied, shaders loaded, ...
     */
    public onReady() {
        // Your scene is ready ...
    }

    /**
     * If called on each progress of the assets manager.
     */
    public onAssetsProgress(remainingCount: number, totalCount: number) {
        GameManager.engine.loadingUIText = [
            'We are loading the scene. ',
            remainingCount + ' out of ' + totalCount + ' items still need to be loaded.',
        ].join('');
    }

    /**
     * Once all the assets were loaded.
     */
    public onAssetsFinish() {
        // Do something after all the assets were loaded ...
    }

    /********** Helpers **********/

    /**
     * When the level is loaded. Here we can finally start rendering stuff, listening to input, ...
     * Used only in the GameManager.
     */
    public onPostLoad(callback: () => void) {
        this.onPreStart(() => {
            this._isLoaded = true;
            this.start();
        });

        // Assets manager
        this._assetsManager.onProgress = this.onAssetsProgress.bind(this);
        this._assetsManager.onFinish = () => {
            this.onAssetsFinish.bind(this);

            this._isAssetsLoaded = true;
        };
        this._assetsManager.load();

        // Interval
        let interval = setInterval(() => {
            if (
                this._isLoaded &&
                this._isAssetsLoaded
            ) {
                clearInterval(interval);
                callback();
            }
        }, this._onLevelReadyIntervalTime);
    }

    public render() {
        this._scene.render();
    }

    public getScene(): BABYLON.Scene {
        return this._scene;
    }

    public getAssetsManager(): BABYLON.AssetsManager {
        return this._assetsManager;
    }

    public getMeshManager(): MeshManager {
        return this._meshManager;
    }

    public getCamera(): BABYLON.Camera {
        return this._scene.activeCamera;
    }
}
