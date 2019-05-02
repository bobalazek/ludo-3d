import { Room, Client } from 'colyseus';
import * as uuid from 'uuid/v4';

import { SessionRoomPlayer } from './SessionRoomPlayer';
import { SessionRoomPlayerToken } from './SessionRoomPlayerToken';
import { SessionRoomPlayerChatMessage } from './SessionRoomPlayerChatMessage';
import {
    SessionRoomState,
    DICE_ROLL_ACTION,
    TOKEN_MOVE_ACTION,
    CHAT_MESSAGE_ACTION,
    WAITING_FOR_PLAYER_DICE_ROLL_STATE,
    WAITING_FOR_PLAYER_TOKEN_MOVE_STATE,
    GAME_FINISHED_STATE,
} from './SessionRoomState';
import { Board } from '../../../Gameplay/Board';

export class SessionRoom extends Room {
    maxClients: number = 4;

    onInit() {
        this.setState(new SessionRoomState());

        let self = this;
        setTimeout(() => {
            self.state.lastTurnPlayerSessionId = this.getNextPlayerSessionId();
            this.state.state = WAITING_FOR_PLAYER_DICE_ROLL_STATE;
            self.setState(self.state);
        }, 1000);
    }

    requestJoin(options: any) {
        // Prevent the client from joining the same room from another browser tab
        return this.clients.filter(client => client.id === options.clientId).length === 0;
    }

    onAuth (options: any) {
        // TODO
        return true;
    }

    onJoin(client: Client) {
        let player = new SessionRoomPlayer();
        player.index = Object.keys(this.state.players).length + 1;
        player.name = 'Player ' + player.index;
        player.sessionId = client.sessionId;
        player.generateTokens();

        this.state.players[client.sessionId] = player;

        this.addChatMessage(
            'System',
            player.name + ' joined the session.'
        );
    }

    onMessage(client: Client, message: any) {
        if (message.action === DICE_ROLL_ACTION) {
            this.doDiceRollAction(client, message);
        } else if (message.action === TOKEN_MOVE_ACTION) {
            this.doTokenMoveAction(client, message);
        } else if (message.action === CHAT_MESSAGE_ACTION) {
            this.doChatMessageAction(client, message);
        }
    }

    async onLeave(client: Client, consented: boolean) {
        this.state.players[client.sessionId].connected = false;

        try {
            if (consented) {
                throw new Error("Consented leave");
            }

            await this.allowReconnection(client, 10);

            this.state.players[client.sessionId].connected = true;
        } catch (e) {
            delete this.state.players[client.sessionId];
        }
    }

    // Main actions
    doDiceRollAction(client: Client, message: any) {
        const player: SessionRoomPlayer = this.state.players[this.state.lastTurnPlayerSessionId];

        this.state.lastDiceRollNumber = this.getDiceRollNumber();
        this.state.lastDiceRollHash = uuid().substring(0, 8);
        this.state.state = WAITING_FOR_PLAYER_TOKEN_MOVE_STATE;

        if (!this.ifPlayerHasLegalMoves(player)) {
            this.addChatMessage(
                'System',
                'Player "' + this.state.players[client.sessionId].name + '" has no available moves.'
            );

            this.state.state = WAITING_FOR_PLAYER_DICE_ROLL_STATE;
            this.state.lastTurnPlayerSessionId = this.getNextPlayerSessionId();
        }
    }

    doTokenMoveAction(client: Client, message: any) {
        this.movePlayerToken(message.data.playerTokenIndex);

        const player: SessionRoomPlayer = this.state.players[this.state.lastTurnPlayerSessionId];
        if (this.isPlayerFinished(player)) {
            this.state.state = GAME_FINISHED_STATE;
            this.state.winnerPlayerSessionId = this.state.lastTurnPlayerSessionId;
        } else {
            this.state.state = WAITING_FOR_PLAYER_DICE_ROLL_STATE;
            this.state.lastTurnPlayerSessionId = this.getNextPlayerSessionId();
        }
    }

    doChatMessageAction(client: Client, message: any) {
        this.addChatMessage(
            this.state.players[client.sessionId].name,
            message.data.text
        );
    }

    // Helpers
    movePlayerToken(tokenIndex: number) {
        const player: SessionRoomPlayer = this.state.players[this.state.lastTurnPlayerSessionId];
        const playerToken = this.getPlayerTokenByIndex(
            this.state.lastTurnPlayerSessionId,
            tokenIndex
        );

        const nextPoint = this.getNextWantedPointForPlayerToken(player, playerToken);
        if (nextPoint === null) {
            // Should NEVER happen. A player tried to "hack", to get to this point.
            return false;
        }

        // Is there an other player on there? Send him back to base!
        const playerTokenOnPoint = this.getPlayerTokenOnPoint(nextPoint);
        if (playerTokenOnPoint !== null) {
            playerTokenOnPoint.point = 'player' + playerTokenOnPoint.playerIndex
                + '_start' + playerTokenOnPoint.index;
        }

        playerToken.point = nextPoint;

        return true;
    }

    getNextPlayerSessionId() {
        if (!this.state.lastTurnPlayerSessionId) {
            for (let index = 1; index < this.maxClients + 1; index++) {
                const player = this.getPlayerByIndex(index)
                if (player) {
                    return player.sessionId;
                }
            }
        }

        const lastPlayer = this.state.players[this.state.lastTurnPlayerSessionId];
        let nextPlayerIndex = lastPlayer.index + 1;

        let i = 0;
        do {
            if (nextPlayerIndex >= this.maxClients) {
                nextPlayerIndex = 1;
            }

            const nextPlayer = this.getPlayerByIndex(nextPlayerIndex)
            if (nextPlayer) {
                return nextPlayer.sessionId;
            }

            nextPlayerIndex++;
            i++;
        } while(i < this.maxClients);

        return '';
    }

    getPlayerByIndex(index: number) {
        for (let playerSessionid in this.state.players) {
            if (this.state.players[playerSessionid].index === index) {
                return this.state.players[playerSessionid];
            }
        }

        return null;
    }

    getPlayerTokenByIndex(playerSessionid: string, index: number) {
        const player: SessionRoomPlayer = this.state.players[playerSessionid];
        for (let playerToken in player.tokens) {
            if (player.tokens[playerToken].index === index) {
                return player.tokens[playerToken];
            }
        }

        return null;
    }

    getDiceRollNumber() {
        return Math.floor(Math.random() * 6) + 1;
    }

    /**
     * Goes through all player tokens and checks which once can be moved
     */
    ifPlayerHasLegalMoves(player: SessionRoomPlayer): boolean {
        let hasLegalMoves: boolean = false;

        for (let playerTokenIndex in player.tokens) {
            const playerToken = player.tokens[playerTokenIndex];
            const playerTokenNextWantedPoint = this.getNextWantedPointForPlayerToken(
                player,
                playerToken
            );
            const canBeMoved = playerTokenNextWantedPoint !== null
            playerToken.canBeMoved = canBeMoved;

            if (canBeMoved) {
                hasLegalMoves = true;
            }
        }

        return hasLegalMoves;
    }

    getNextWantedPointForPlayerToken(
        player: SessionRoomPlayer,
        playerToken: SessionRoomPlayerToken
    ) {
        const currentPoint: string = playerToken.point;
        const lastDiceRollNumber: number = this.state.lastDiceRollNumber;

        if (currentPoint.indexOf('_start') !== -1) {
            const nextWantedPoint = Board.players[player.index].pathStart;

            const playerTokenOnPoint = this.getPlayerTokenOnPoint(nextWantedPoint);
            if (
                playerTokenOnPoint !== null &&
                playerTokenOnPoint.playerIndex === playerToken.playerIndex
            ) {
                // Another token of yours already occupied this point
                return null;
            }

            if (this.state.lastDiceRollNumber !== 6) {
                return null;
            }

            return nextWantedPoint;
        }

        if (currentPoint.indexOf('_end') !== -1) {
            const currentEndPointNumber = parseInt(
                currentPoint.split('_')[1].replace('end', '')
            );

            if (lastDiceRollNumber + currentEndPointNumber > Board.playerTokensCount)  {
                // It's outside the end parking points
                return null;
            }

            const nextWantedPoint = 'player' + player.index + '_end' + (lastDiceRollNumber + currentEndPointNumber);

            const playerTokenOnPoint = this.getPlayerTokenOnPoint(nextWantedPoint);
            if (playerTokenOnPoint !== null) {
                // Another token of yours already occupied this point
                return null;
            }

            return nextWantedPoint;
        }

        // TODO: still not working correctly

        const currentPointNumber = parseInt(
            currentPoint.replace('path', '')
        );

        const playerStartPath = Board.players[player.index].pathStart;
        const playerStartNumber = parseInt(
            playerStartPath.replace('path', '')
        );
        const relativePlayerTokenPosition = currentPointNumber - playerStartNumber;
        const absolutePlayerTokenPosition = currentPointNumber >= playerStartNumber
            ? relativePlayerTokenPosition
            : relativePlayerTokenPosition + Board.pathPointsCount;
        const newPlayerTokenPosition = absolutePlayerTokenPosition + lastDiceRollNumber;

        if (newPlayerTokenPosition <= Board.pathPointsCount) {
            const nextWantedPoint = 'path' + (
                (relativePlayerTokenPosition + lastDiceRollNumber + playerStartNumber) % Board.pathPointsCount
            );

            const playerTokenOnPoint = this.getPlayerTokenOnPoint(nextWantedPoint);
            if (
                playerTokenOnPoint !== null &&
                playerTokenOnPoint.playerIndex === playerToken.playerIndex
            ) {
                return null;
            }

            return nextWantedPoint;
        } else if (newPlayerTokenPosition > Board.pathPointsCount + Board.playerTokensCount) {
            // The token would go outside the end bases
            return null;
        }

        // TODO: check if already occupied

        return 'player' + player.index + '_end' + (newPlayerTokenPosition - Board.pathPointsCount);
    }

    /**
     * Get the player token that is on the point. Returns null if none
     */
    getPlayerTokenOnPoint(point: string) {
        for (let playerSessionid in this.state.players) {
            const player = this.state.players[playerSessionid];
            for (let playerTokenIndex in player.tokens) {
                const playerToken = player.tokens[playerTokenIndex];
                if (playerToken.point === point) {
                    return playerToken;
                }
            }
        }

        return null;
    }

    isPlayerFinished(player: SessionRoomPlayer) {
        let tokensOnEnd: number = 0;

        for (let playerTokenIndex in player.tokens) {
            const playerToken = player.tokens[playerTokenIndex];
            if (playerToken.point.indexOf('_end') !== -1) {
                tokensOnEnd++;
            }
        }

        return tokensOnEnd >= Object.keys(player.tokens).length;
    }

    addChatMessage(name: string, text: string) {
        let chatMessage = new SessionRoomPlayerChatMessage();
        chatMessage.name = name;
        chatMessage.text = text;

        this.state.chatMessages.push(chatMessage);
    }
}
