export class Board {
    public static height: number = 4;
    public static pointSize: number = 8;
    public static size: number = Board.pointSize * 13;
    public static pathPointsCount: number = 48;
    public static playerTokensCount: number = 4;
    public static players = {
        1: {
            color: '#ff0000',
            pathStart: 'path0',
            cameraAlpha: (Math.PI / -4) * 3,
        },
        2: {
            color: '#00ff00',
            pathStart: 'path36',
            cameraAlpha: Math.PI / -4,
        },
        3: {
            color: '#0000ff',
            pathStart: 'path12',
            cameraAlpha: (Math.PI / 4) * 3,
        },
        4: {
            color: '#ffff00',
            pathStart: 'path24',
            cameraAlpha: Math.PI / 4,
        },
    };
    public static points = {
        /********** Player 1 **********/
        player1_start1: {
            position: [(Board.pointSize * -6) + (Board.pointSize / 2), (Board.pointSize * -6) + (Board.pointSize / 2)],
            type: 'base',
        },
        player1_start2: {
            position: [(Board.pointSize * -4) + (Board.pointSize / 2), (Board.pointSize * -6) + (Board.pointSize / 2)],
            type: 'base',
        },
        player1_start3: {
            position: [(Board.pointSize * -6) + (Board.pointSize / 2), (Board.pointSize * -4) + (Board.pointSize / 2)],
            type: 'base',
        },
        player1_start4: {
            position: [(Board.pointSize * -4) + (Board.pointSize / 2), (Board.pointSize * -4) + (Board.pointSize / 2)],
            type: 'base',
        },
        player1_end1: {
            position: [Board.pointSize * 0, Board.pointSize * -5],
        },
        player1_end2: {
            position: [Board.pointSize * 0, Board.pointSize * -4],
        },
        player1_end3: {
            position: [Board.pointSize * 0, Board.pointSize * -3],
        },
        player1_end4: {
            position: [Board.pointSize * 0, Board.pointSize * -2],
        },
        /********** player 2 **********/
        player2_start1: {
            position: [(Board.pointSize * 6) - (Board.pointSize / 2), (Board.pointSize * -6) + (Board.pointSize / 2)],
            type: 'base',
        },
        player2_start2: {
            position: [(Board.pointSize * 4) - (Board.pointSize / 2), (Board.pointSize * -6) + (Board.pointSize / 2)],
            type: 'base',
        },
        player2_start3: {
            position: [(Board.pointSize * 6) - (Board.pointSize / 2), (Board.pointSize * -4) + (Board.pointSize / 2)],
            type: 'base',
        },
        player2_start4: {
            position: [(Board.pointSize * 4) - (Board.pointSize / 2), (Board.pointSize * -4) + (Board.pointSize / 2)],
            type: 'base',
        },
        player2_end1: {
            position: [Board.pointSize * 5, Board.pointSize * 0],
        },
        player2_end2: {
            position: [Board.pointSize * 4, Board.pointSize * 0],
        },
        player2_end3: {
            position: [Board.pointSize * 3, Board.pointSize * 0],
        },
        player2_end4: {
            position: [Board.pointSize * 2, Board.pointSize * 0],
        },
        /********** player 3 **********/
        player3_start1: {
            position: [(Board.pointSize * -6) + (Board.pointSize / 2), (Board.pointSize * 6) - (Board.pointSize / 2)],
            type: 'base',
        },
        player3_start2: {
            position: [(Board.pointSize * -4) + (Board.pointSize / 2), (Board.pointSize * 6) - (Board.pointSize / 2)],
            type: 'base',
        },
        player3_start3: {
            position: [(Board.pointSize * -6) + (Board.pointSize / 2), (Board.pointSize * 4) - (Board.pointSize / 2)],
            type: 'base',
        },
        player3_start4: {
            position: [(Board.pointSize * -4) + (Board.pointSize / 2), (Board.pointSize * 4) - (Board.pointSize / 2)],
            type: 'base',
        },
        player3_end1: {
            position: [Board.pointSize * -5, Board.pointSize * 0],
        },
        player3_end2: {
            position: [Board.pointSize * -4, Board.pointSize * 0],
        },
        player3_end3: {
            position: [Board.pointSize * -3, Board.pointSize * 0],
        },
        player3_end4: {
            position: [Board.pointSize * -2, Board.pointSize * 0],
        },
        /********** player 4 **********/
        player4_start1: {
            position: [(Board.pointSize * 6) - (Board.pointSize / 2), (Board.pointSize * 6) - (Board.pointSize / 2)],
            type: 'base',
        },
        player4_start2: {
            position: [(Board.pointSize * 4) - (Board.pointSize / 2), (Board.pointSize * 6) - (Board.pointSize / 2)],
            type: 'base',
        },
        player4_start3: {
            position: [(Board.pointSize * 6) - (Board.pointSize / 2), (Board.pointSize * 4) - (Board.pointSize / 2)],
            type: 'base',
        },
        player4_start4: {
            position: [(Board.pointSize * 4) - (Board.pointSize / 2), (Board.pointSize * 4) - (Board.pointSize / 2)],
            type: 'base',
        },
        player4_end1: {
            position: [Board.pointSize * 0, Board.pointSize * 5],
        },
        player4_end2: {
            position: [Board.pointSize * 0, Board.pointSize * 4],
        },
        player4_end3: {
            position: [Board.pointSize * 0, Board.pointSize * 3],
        },
        player4_end4: {
            position: [Board.pointSize * 0, Board.pointSize * 2],
        },
        /********** Path **********/
        path0: {
            position: [Board.pointSize * -1, Board.pointSize * -6],
            color: '#ffffff',
            type: 'path',
        },
        path1: {
            position: [Board.pointSize * -1, Board.pointSize * -5],
            color: '#ffffff',
            type: 'path',
        },
        path2: {
            position: [Board.pointSize * -1, Board.pointSize * -4],
            color: '#ffffff',
            type: 'path',
        },
        path3: {
            position: [Board.pointSize * -1, Board.pointSize * -3],
            color: '#ffffff',
            type: 'path',
        },
        path4: {
            position: [Board.pointSize * -1, Board.pointSize * -2],
            color: '#ffffff',
            type: 'path',
        },
        path5: {
            position: [Board.pointSize * -2, Board.pointSize * -2],
            color: '#ffffff',
            type: 'path',
        },
        path6: {
            position: [Board.pointSize * -2, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path7: {
            position: [Board.pointSize * -3, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path8: {
            position: [Board.pointSize * -4, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path9: {
            position: [Board.pointSize * -5, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path10: {
            position: [Board.pointSize * -6, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path11: {
            position: [Board.pointSize * -6, Board.pointSize * 0],
            color: '#ffffff',
            type: 'path',
        },
        path12: {
            position: [Board.pointSize * -6, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path13: {
            position: [Board.pointSize * -5, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path14: {
            position: [Board.pointSize * -4, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path15: {
            position: [Board.pointSize * -3, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path16: {
            position: [Board.pointSize * -2, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path17: {
            position: [Board.pointSize * -2, Board.pointSize * 2],
            color: '#ffffff',
            type: 'path',
        },
        path18: {
            position: [Board.pointSize * -1, Board.pointSize * 2],
            color: '#ffffff',
            type: 'path',
        },
        path19: {
            position: [Board.pointSize * -1, Board.pointSize * 3],
            color: '#ffffff',
            type: 'path',
        },
        path20: {
            position: [Board.pointSize * -1, Board.pointSize * 4],
            color: '#ffffff',
            type: 'path',
        },
        path21: {
            position: [Board.pointSize * -1, Board.pointSize * 5],
            color: '#ffffff',
            type: 'path',
        },
        path22: {
            position: [Board.pointSize * -1, Board.pointSize * 6],
            color: '#ffffff',
            type: 'path',
        },
        path23: {
            position: [Board.pointSize * 0, Board.pointSize * 6],
            color: '#ffffff',
            type: 'path',
        },
        path24: {
            position: [Board.pointSize * 1, Board.pointSize * 6],
            color: '#ffffff',
            type: 'path',
        },
        path25: {
            position: [Board.pointSize * 1, Board.pointSize * 5],
            color: '#ffffff',
            type: 'path',
        },
        path26: {
            position: [Board.pointSize * 1, Board.pointSize * 4],
            color: '#ffffff',
            type: 'path',
        },
        path27: {
            position: [Board.pointSize * 1, Board.pointSize * 3],
            color: '#ffffff',
            type: 'path',
        },
        path28: {
            position: [Board.pointSize * 1, Board.pointSize * 2],
            color: '#ffffff',
            type: 'path',
        },
        path29: {
            position: [Board.pointSize * 2, Board.pointSize * 2],
            color: '#ffffff',
            type: 'path',
        },
        path30: {
            position: [Board.pointSize * 2, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path31: {
            position: [Board.pointSize * 3, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path32: {
            position: [Board.pointSize * 4, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path33: {
            position: [Board.pointSize * 5, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path34: {
            position: [Board.pointSize * 6, Board.pointSize * 1],
            color: '#ffffff',
            type: 'path',
        },
        path35: {
            position: [Board.pointSize * 6, Board.pointSize * 0],
            color: '#ffffff',
            type: 'path',
        },
        path36: {
            position: [Board.pointSize * 6, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path37: {
            position: [Board.pointSize * 5, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path38: {
            position: [Board.pointSize * 4, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path39: {
            position: [Board.pointSize * 3, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path40: {
            position: [Board.pointSize * 2, Board.pointSize * -1],
            color: '#ffffff',
            type: 'path',
        },
        path41: {
            position: [Board.pointSize * 2, Board.pointSize * -2],
            color: '#ffffff',
            type: 'path',
        },
        path42: {
            position: [Board.pointSize * 1, Board.pointSize * -2],
            color: '#ffffff',
            type: 'path',
        },
        path43: {
            position: [Board.pointSize * 1, Board.pointSize * -3],
            color: '#ffffff',
            type: 'path',
        },
        path44: {
            position: [Board.pointSize * 1, Board.pointSize * -4],
            color: '#ffffff',
            type: 'path',
        },
        path45: {
            position: [Board.pointSize * 1, Board.pointSize * -5],
            color: '#ffffff',
            type: 'path',
        },
        path46: {
            position: [Board.pointSize * 1, Board.pointSize * -6],
            color: '#ffffff',
            type: 'path',
        },
        path47: {
            position: [Board.pointSize * 0, Board.pointSize * -6],
            color: '#ffffff',
            type: 'path',
        },
    };
}
