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

export const DIRECTION: Record<string,Direction> = {
    UP:    { dx: 0, dy:-1, dz:0 },
    DOWN:  { dx: 0, dy: 1, dz:0 },
    LEFT:  { dx:-1, dy: 0, dz:0 },
    RIGHT: { dx: 1, dy: 0, dz:0 }, 
    UL:    { dx:-1, dy:-1, dz:0 }, 
    DL:    { dx:-1, dy: 1, dz:0 }, 
    UR:    { dx: 1, dy:-1, dz:0 }, 
    DR:    { dx: 1, dy: 1, dz:0 }, 
}

/*
need helper functions for position and direction:
- isIdle, isUp, isDown, isLeft, isRight, -isUpLeft,... -isDir()
- toIdle, toUp, ..., normalize, length
- copy, deepcopy
- reverse
- distance, add, substract
*/