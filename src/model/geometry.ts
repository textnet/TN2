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
    IDLE:  { dx: 0, dy: 0, dz:0 }, 
}


export function directionName(what: Direction|Position) {
    let dir = what as Direction;
    if (what["direction"]) {
        dir = (what as Position).direction;
    }
    if (dir.dx <  0 && dir.dy <  0) return "UL";
    if (dir.dx <  0 && dir.dy == 0) return "LEFT";
    if (dir.dx <  0 && dir.dy >  0) return "DL";
    if (dir.dx == 0 && dir.dy <  0) return "UP";
    if (dir.dx == 0 && dir.dy == 0) return "IDLE";
    if (dir.dx == 0 && dir.dy >  0) return "DOWN";
    if (dir.dx >  0 && dir.dy <  0) return "UR";
    if (dir.dx >  0 && dir.dy == 0) return "RIGHT";
    if (dir.dx >  0 && dir.dy >  0) return "DR";
    return "IDLE";
}

export function isDir(name: string, dir: Direction) {
    const dirName = directionName(dir);
    return name == dirName;
}


/*
need helper functions for position and direction:
- isIdle, isUp, isDown, isLeft, isRight, -isUpLeft,... -isDir()
- toIdle, toUp, ..., normalize, length
- copy, deepcopy
- reverse
- distance, add, substract
*/