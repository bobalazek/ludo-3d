import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Key } from 'ts-keycode-enum';
import 'babylonjs-materials';
import 'babylonjs-loaders';

import {
    GAME_SERVER_PORT,
    GAME_SERVER_HOST,
} from '../Config';
import { GameManager } from '../../Framework/Core/GameManager';
import { AbstractNetworkingLevel } from '../../Framework/Level/AbstractNetworkingLevel';
import { Board } from '../Gameplay/Board';
import {
    SessionRoomState,
    DICE_ROLL_ACTION,
    TOKEN_MOVE_ACTION,
    CHAT_MESSAGE_ACTION,
    WAITING_FOR_PLAYER_DICE_ROLL_STATE,
    WAITING_FOR_PLAYER_TOKEN_MOVE_STATE,
} from '../Networking/Rooms/Session/SessionRoomState';

import { ChatComponent } from '../UI/components/ChatComponent';

export class SessionLevel extends AbstractNetworkingLevel {
    // General
    protected _hideDebugLayer: boolean = true;
    protected _playerIndex: number = 1;
    protected _skybox: BABYLON.Mesh;
    protected _shadowGenerator: BABYLON.ShadowGenerator;
    protected _highlightLayer: BABYLON.HighlightLayer;
    protected _meshes: {[key: string]: BABYLON.Mesh} = {};
    protected _camera: BABYLON.ArcRotateCamera;

    // Gameplay
    protected _canRollDice: boolean = false;
    protected _canMoveToken: boolean = false;

    // Network
    protected _serverEnabled: boolean = true;
    protected _serverRoomName: string = 'session';
    protected _serverHost: string = GAME_SERVER_HOST + ':' + GAME_SERVER_PORT;

    // Materials
    protected _materials: {[key: string]: BABYLON.Material} = {};

    public start() {
        super.start();

        this._prepareSkybox();
        this._prepareLights();
        this._prepareMaterials();
        this._prepareBoard();
        this._prepareBoardTokens();
        this._prepareCamera();
        this._prepareHighlightLayer();
        this._prepareEvents();
        this._prepareNetworkingEvents();
        this._prepareUi();
    }

    public onPreStart(callback: () => void) {
        // TODO: load meshes

        callback();
    }

    protected _prepareSkybox() {
        this._skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1024 }, this.getScene());
        this._skybox.infiniteDistance = true;

        let skyboxMaterial = new BABYLON.SkyMaterial('skyboxMaterial', this.getScene());
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.inclination = 0;
        skyboxMaterial.luminance = 1;
        skyboxMaterial.turbidity = 20;

        this._skybox.material = skyboxMaterial;
    }

    protected _prepareLights() {
        let hemiLight = new BABYLON.HemisphericLight(
            'hemiLight',
            new BABYLON.Vector3(0, 128, 0),
            this.getScene()
        );
        hemiLight.intensity = 0.7;

        let dirLight = new BABYLON.DirectionalLight(
            'dirLight',
            new BABYLON.Vector3(48, -48, 48),
            this.getScene()
        );
        this._shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    }

    protected _prepareMaterials() {
        let boardMaterial = new BABYLON.StandardMaterial('boardMaterial', this.getScene());
        boardMaterial.diffuseColor = BABYLON.Color3.FromHexString('#8e593c');

        for (let playerIndex = 1; playerIndex - 1 < Object.keys(Board.players).length; playerIndex++) {
            let playerMaterial = new BABYLON.StandardMaterial('player' + playerIndex + 'Material', this.getScene());
            playerMaterial.diffuseColor = BABYLON.Color3.FromHexString(Board.players[playerIndex].color);
        }
    }

    protected _prepareBoard() {
        let board = BABYLON.MeshBuilder.CreateBox(
            "board",
            {
                height: Board.height,
                width: Board.size + 0.01,
                depth: Board.size + 0.01,
            },
            this.getScene()
        );
        board.receiveShadows = true;
        board.position = new BABYLON.Vector3(0, -1, 0);
        board.material = this.getScene().getMaterialByName('boardMaterial');

        for (let pointKey in Board.points) {
            const playerKey = pointKey.split('_')[0];
            const point = Board.points[pointKey];
            let pointMesh: BABYLON.AbstractMesh;

            if (point.type === 'base') {
                pointMesh = BABYLON.MeshBuilder.CreateCylinder(
                    pointKey,
                    {
                        height: Board.height,
                        diameter: Board.pointSize,
                    },
                    this.getScene()
                );
            } else {
                pointMesh = BABYLON.MeshBuilder.CreateBox(
                    pointKey,
                    {
                        height: Board.height,
                        size: Board.pointSize - 0.2,
                    },
                    this.getScene()
                );
            }

            pointMesh.receiveShadows = true;
            pointMesh.position = new BABYLON.Vector3(point.position[0], 0, point.position[1]);
            pointMesh.material = this.getScene().getMaterialByName(playerKey + 'Material');
        }

        const boardMiddleBoxSize = Board.pointSize * 3;
        let boardMiddleBox = BABYLON.MeshBuilder.CreateBox(
            "boardMiddleBox",
            {
                height: boardMiddleBoxSize,
                width: boardMiddleBoxSize,
                depth: boardMiddleBoxSize,
            },
            this.getScene()
        );
        boardMiddleBox.position.y = boardMiddleBoxSize / 2;

        // Dice
        const diceSize = Board.pointSize;
        let dice = BABYLON.MeshBuilder.CreateBox(
            "dice",
            {
                height: diceSize,
                width: diceSize,
                depth: diceSize,
            },
            this.getScene()
        );
        dice.metadata = {
            isHighlightable: false,
            lastDiceRollNumber: 1,
        };
        dice.position.y = boardMiddleBoxSize + (diceSize / 2);
        this._meshes.dice = dice;
    }

    protected _prepareBoardTokens() {
        const playerTokenHeight = 8;
        for (let playerIndex = 1; playerIndex - 1 < Object.keys(Board.players).length; playerIndex++) {
            const abstractPlayerToken = BABYLON.MeshBuilder.CreateCylinder(
                'player' + playerIndex + '_token',
                {
                    height: playerTokenHeight,
                    diameter: Board.pointSize * 0.5,
                },
                this.getScene()
            );
            abstractPlayerToken.receiveShadows = true;
            abstractPlayerToken.isVisible = false;
            abstractPlayerToken.material = this.getScene().getMaterialByName('player' + playerIndex + 'Material');

            for (let playerTokenIndex = 1; playerTokenIndex - 1 < Board.playerTokensCount; playerTokenIndex++) {
                const startPointKey = 'player' + playerIndex + '_start' + playerTokenIndex;
                const startPoint = Board.points[startPointKey];

                let playerToken = abstractPlayerToken.createInstance(
                    'player' + playerIndex + '_token' + playerTokenIndex
                );
                playerToken.setEnabled(false);
                playerToken.position = new BABYLON.Vector3(
                    startPoint.position[0],
                    playerTokenHeight - (Board.height / 2),
                    startPoint.position[1]
                );
                playerToken.metadata = {
                    playerIndex: playerIndex,
                    playerTokenIndex: playerTokenIndex,
                    point: startPointKey,
                    instanceOf: abstractPlayerToken,
                    isHighlightable: false,
                    serverData: {},
                };
                this._addShadowsToMesh(playerToken);
            }
        }
    }

    protected _prepareCamera() {
        let camera = new BABYLON.ArcRotateCamera(
            "camera",
            Board.players[this._playerIndex].cameraAlpha,
            Math.PI / 3,
            192,
            BABYLON.Vector3.Zero(),
            this.getScene()
        );
        camera.maxZ = 1024 * 8;
        camera.upperBetaLimit = Math.PI / 2.5;
        camera.lowerRadiusLimit = 96;
        camera.upperRadiusLimit = 192;
        camera.angularSensibilityX = 10000;
        camera.angularSensibilityY = 10000;
        camera.attachControl(GameManager.canvas, true);

        this._camera = camera;
    }

    protected _prepareHighlightLayer() {
        // TODO: not working yet
        const scene = this.getScene();
        this._highlightLayer = new BABYLON.HighlightLayer("highlightLayer", scene);

        // https://www.babylonjs-playground.com/#1KUJ0A#136
        let highlightedMesh: BABYLON.Nullable<BABYLON.Mesh> = null;
        scene.onPointerObservable.add(() => {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (
                pickResult.hit &&
                pickResult.pickedMesh &&
                pickResult.pickedMesh.metadata &&
                pickResult.pickedMesh.metadata.isHighlightable
            ) {
                if (highlightedMesh === null) {
                    const pickedMesh = pickResult.pickedMesh;

                    if (
                        pickedMesh.metadata &&
                        pickedMesh.metadata.isAnimating
                    ) {
                        return;
                    }

                    highlightedMesh = pickedMesh.metadata && pickedMesh.metadata.instanceOf
                        ? pickedMesh.metadata.instanceOf.clone(pickResult.pickedMesh.name + 'Clone')
                        : pickedMesh.clone(pickResult.pickedMesh.name + 'Clone', null);

                    highlightedMesh.isVisible = true;
                    highlightedMesh.position = pickedMesh.position.clone();
                    highlightedMesh.scaling = pickedMesh.scaling.clone();
                    highlightedMesh.rotation = pickedMesh.rotation.clone();
                    highlightedMesh.metadata = {
                        lastMesh: pickedMesh,
                    };

                    this._highlightLayer.addMesh(
                        highlightedMesh,
                        BABYLON.Color3.White(),
                        true
                    );

                    this._meshes.highlightedMesh = highlightedMesh;
                } else {
                    if (highlightedMesh.metadata.lastMesh !== pickResult.pickedMesh) {
                        this._highlightLayer.removeMesh(highlightedMesh);
                        highlightedMesh.dispose();
                        highlightedMesh = null;
                    }
                }
            } else if (highlightedMesh !== null) {
                this._highlightLayer.removeMesh(highlightedMesh);
                highlightedMesh.dispose();
                highlightedMesh = null;
            }
        }, BABYLON.PointerEventTypes.POINTERMOVE);

    }

    protected _prepareEvents() {
        const self = this;
        const scene = this.getScene();
        window.addEventListener("click", function () {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                if (
                    self._canRollDice &&
                    pickResult.pickedMesh.name === 'dice'
                ) {
                    self._serverRoom.send({
                        action: DICE_ROLL_ACTION,
                    });
                } else if (
                    self._canMoveToken &&
                    pickResult.pickedMesh.name.indexOf('_token') !== -1 &&
                    pickResult.pickedMesh.metadata.serverData.canBeMoved
                ) {
                    self._serverRoom.send({
                        action: TOKEN_MOVE_ACTION,
                        detail: {
                            playerTokenIndex: pickResult.pickedMesh.metadata.playerTokenIndex,
                        },
                    });
                }

                // Remove, so it does not get stuck while we are animating the dice
                if (self._meshes.highlightedMesh) {
                    self._highlightLayer.removeMesh(self._meshes.highlightedMesh);
                    self._meshes.highlightedMesh.dispose();
                }
            }
       });
    }

    protected _prepareNetworkingEvents() {
        const scene = this.getScene();
        let diceMesh = scene.getMeshByName('dice');

        let initialCameraPositionSet: boolean = false;
        let lastState: SessionRoomState = null;

        this._serverRoom.onStateChange.add((state: SessionRoomState) => {
            console.log(state)

            const mySessionId = this._serverRoom.sessionId;

            this._canRollDice = state.lastTurnPlayerSessionId === mySessionId
                && state.state === WAITING_FOR_PLAYER_DICE_ROLL_STATE;
            this._canMoveToken = state.lastTurnPlayerSessionId === mySessionId
                && state.state === WAITING_FOR_PLAYER_TOKEN_MOVE_STATE;

            this._disablePlayerTokens();
            for (let playerSessionId in state.players) {
                const player = state.players[playerSessionId];
                for (let playerTokenIndex in player.tokens) {
                    const playerTokenServerData = player.tokens[playerTokenIndex];
                    let playerToken = scene.getMeshByName(
                        'player' + player.index + '_token' + playerTokenIndex
                    );
                    playerToken.setEnabled(true);
                    playerToken.metadata.serverData = playerTokenServerData;
                    playerToken.metadata.isHighlightable = false;

                    if (mySessionId === playerSessionId) {
                        playerToken.metadata.isHighlightable = this._canMoveToken
                            && playerTokenServerData.canBeMoved;

                        if (!initialCameraPositionSet) {
                            this._playerIndex = player.index;
                            this._camera.alpha = Board.players[this._playerIndex].cameraAlpha;
                            initialCameraPositionSet = true;
                        }
                    }

                    if (playerToken.metadata.point !== playerTokenServerData.point) {
                        this._moveToPoint(
                            playerToken,
                            playerTokenServerData.point
                        );
                    }
                }
            }

            diceMesh.metadata.isHighlightable = this._canRollDice;

            // Dice
            if (
                lastState !== null &&
                state.lastDiceRollHash !== lastState.lastDiceRollHash
            ) {
                this._diceRoll(
                    diceMesh,
                    state.lastDiceRollNumber
                );
            }

            lastState = JSON.parse(JSON.stringify(state));
        });

        this._serverRoom.onJoin.add(() => {
            this._serverRoom.state.chatMessages.onAdd = (chatMessage) => {
                window.dispatchEvent(new CustomEvent('chat:messages:update', {
                    detail: {
                        message: chatMessage,
                    },
                }));
            };
        });

        this._serverRoom.onError.add((error) => {
            console.log(error);
        });
    }

    protected _prepareUi() {
        // Chat
        ReactDOM.render(
            React.createElement(
                'div',
                {},
                React.createElement(ChatComponent)
            ),
            document.getElementById('ui')
        );

        let chatInputShown: boolean = false;
        window.addEventListener('keydown', (e) => {
            if (
                (
                    !chatInputShown &&
                    e.keyCode === Key.T
                ) || (
                    chatInputShown &&
                    e.keyCode === Key.Escape
                )
            ) {
                window.dispatchEvent(new Event('chat:input:toggle'));
                chatInputShown = !chatInputShown;
            }
        }, false);

        window.addEventListener('chat:messages:new', (event: CustomEvent) => {
            this._serverRoom.send({
                action: CHAT_MESSAGE_ACTION,
                detail: {
                    text: event.detail.text,
                },
            });
        }, false);
    }

    /***** Helpers *****/
    protected _addShadowsToMesh(mesh: BABYLON.AbstractMesh) {
        this._shadowGenerator.addShadowCaster(mesh);
    }

    protected _disablePlayerTokens() {
        for (let playerIndex = 1; playerIndex - 1 < Object.keys(Board.players).length; playerIndex++) {
            for (let playerTokenIndex = 1; playerTokenIndex - 1 < Board.playerTokensCount; playerTokenIndex++) {
                let playerToken = this.getScene().getMeshByName(
                    'player' + playerIndex + '_token' + playerTokenIndex
                );
                playerToken.setEnabled(false);
            }
        }
    }

    protected _moveToPoint(token: BABYLON.AbstractMesh, pointKey: string) {
        const jumpHeight = 8;
        const point = Board.points[pointKey];
        if (!point) {
            throw Error('The point "'  + pointKey + '" does not exist!');
        }

        const startPosition = token.position;
        const endPosition = new BABYLON.Vector3(
            point.position[0],
            token.position.y,
            point.position[1]
        );

        let midPosition = startPosition.clone()
            .add(endPosition)
            .divide(new BABYLON.Vector3(2, 2, 2));
        midPosition.y = startPosition.y + jumpHeight;

        let animation = new BABYLON.Animation(
            'moveAnimation',
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        animation.setKeys([
            {
                frame: 0,
                value: startPosition,
            },
            {
                frame: 15,
                value: midPosition,
            },
            {
                frame: 60,
                value: endPosition,
            },
        ]);

        let easingFunction = new BABYLON.QuarticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);

        token.animations.push(animation);

        token.metadata.point = pointKey;

        this.getScene().beginAnimation(token, 0, 60, false);
    }

    protected _diceRoll(dice: BABYLON.AbstractMesh, number: number) {
        if (
            dice.metadata &&
            dice.metadata.isAnimating
        ) {
            return;
        }

        const startRotation = dice.rotation;

        let animation = new BABYLON.Animation(
            'rollAnimation',
            "rotation",
            120,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        let animationKeys = [{
            frame: 0,
            value: startRotation,
        }];
        for (let i = 1; i <= 21; i++) {
            animationKeys.push({
                frame: i * 5,
                value: animationKeys[i-1].value.clone()
                    .add(new BABYLON.Vector3(
                        Math.random(),
                        Math.random(),
                        Math.random()
                    )),
            });
        }
        animationKeys.push({
            frame: 120,
            value: startRotation,
        });
        animation.setKeys(animationKeys);

        let easingFunction = new BABYLON.QuarticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);

        dice.animations.push(animation);

        dice.metadata.isAnimating = true;

        // TODO: set to the number specified

        this.getScene().beginAnimation(dice, 0, 120, false, 1, () => {
            dice.metadata.isAnimating = false;
        });
    }
}
