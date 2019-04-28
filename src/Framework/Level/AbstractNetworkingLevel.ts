import { Client, Room } from 'colyseus.js';

import { AbstractLevel } from '../../Framework/Level/AbstractLevel';

export class AbstractNetworkingLevel extends AbstractLevel {
    /** Is the networking enabled? */
    protected _serverEnabled: boolean = false;

    /** What is the server host, that we want to connect to? */
    protected _serverHost: string;

    /** The connection client for the server. */
    protected _serverClient: Client;

    /** The room on the server we are connected to. */
    protected _serverRoom: Room;

    /** The room name of the server we are connected to. */
    protected _serverRoomName: string;

    /** Must be a value between 0 and 1. Lover the value, more smooth the transition, but bigger the delay. */
    protected _serverInterpolationSmoothing: number = 0.2;

    /** It will ignore updates from server that are older than this value. */
    protected _serverInterpolationLastUpdateTolerance: number = 1000;

    public start() {
        this._prepareNetworking();
    }

    protected _prepareNetworking() {
        if (
            this._serverEnabled &&
            this._serverHost !== undefined &&
            this._serverRoomName !== undefined
        ) {
            this._serverClient = new Client('ws://' + this._serverHost);
            this._serverRoom = this._serverClient.join(this._serverRoomName);
        }
    }
}
