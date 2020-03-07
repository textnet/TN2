// everything about geometry


export interface Box {
    w: number;
    h: number;
    anchor?: {
        x: number;
        y: number;
    }
    position?: Position;
}
export interface Position {
    x:  number;
    y:  number;
    z?: number;
    direction: Direction;
}

export interface Direction {
    dx:  number;
    dy:  number;
    dz?: number;
}

/*
need helper functions for position and direction:
- isIdle, isUp, isDown, isLeft, isRight, -isUpLeft,... -isDir()
- toIdle, toUp, ..., normalize, length
- copy, deepcopy
- reverse
- distance, add, substract
*/