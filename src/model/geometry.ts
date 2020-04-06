// everything about geometry
import { deepCopy } from "../utils"

const dbg = console;

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

export interface PositionedBox {
    n: number[];
}

export interface Direction {
    dx:  number;
    dy:  number;
    dz?: number;
    rotation?: number;
}

export const DIRECTION: Record<string,Direction> = {
    UP:    { dx: 0, dy:-1, dz:0, rotation:   0 },
    DOWN:  { dx: 0, dy: 1, dz:0, rotation: 180 },
    LEFT:  { dx:-1, dy: 0, dz:0, rotation: 270 },
    RIGHT: { dx: 1, dy: 0, dz:0, rotation:  90 }, 
    UL:    { dx:-1, dy:-1, dz:0, rotation: 315 }, 
    DL:    { dx:-1, dy: 1, dz:0, rotation: 225 }, 
    UR:    { dx: 1, dy:-1, dz:0, rotation:  45 }, 
    DR:    { dx: 1, dy: 1, dz:0, rotation: 135 }, 
    NONE:  { dx: 0, dy: 0, dz:0, rotation: 180 }, 
}
export const PROXIMITY = {
    NEXT: 3,
    MOVE: 0.1,
    STOP: 1,
}

export function position(x, y, zOrDirection?: Direction|string|number, direction?: Direction|string) {
    let z = 0;
    if (typeof zOrDirection == "number") {
        z = zOrDirection;
    } else {
        return position(x,y,z, zOrDirection);
    }
    if (direction       === undefined) direction = DIRECTION.NONE;
    if (direction["dx"] === undefined) {
        return position(x,y,z, toDir(direction as string));
    } else {
        return {
            x: x*1.0,
            y: y*1.0,
            z: z,
            direction: deepCopy(direction as Direction),
        } as Position;        
    }
}

export function directionName(what?: Direction|Position) {
    if (what === undefined) {
        what = DIRECTION.NONE;
    }
    let dir = what as Direction;
    if (what["direction"]) {
        dir = (what as Position).direction;
    }
    if (dir.dx <  0 && dir.dy <  0) return "UL";
    if (dir.dx <  0 && dir.dy == 0) return "LEFT";
    if (dir.dx <  0 && dir.dy >  0) return "DL";
    if (dir.dx == 0 && dir.dy <  0) return "UP";
    if (dir.dx == 0 && dir.dy == 0) return "NONE";
    if (dir.dx == 0 && dir.dy >  0) return "DOWN";
    if (dir.dx >  0 && dir.dy <  0) return "UR";
    if (dir.dx >  0 && dir.dy == 0) return "RIGHT";
    if (dir.dx >  0 && dir.dy >  0) return "DR";
    return "NONE";
}

export function rotationDir(dir?: Direction) {
    if (!dir) return rotationDir(DIRECTION.NONE);
    if (dir.rotation) return dir.rotation;
    if (dir.dy == 0) {
        if (dir.dx > 0) return rotationDir(DIRECTION.RIGHT);
        if (dir.dx < 0) return rotationDir(DIRECTION.LEFT);
        if (dir.dx ==0) return rotationDir(DIRECTION.NONE);
    } else {
        return Math.floor(Math.sin(dir.dx/dir.dy)*180/Math.PI);
    }
}

export function isDir(name: string, dir: Direction) {
    const dirName = directionName(dir);
    return name == dirName;
}
export function isIdle(dir: Direction) {
    return isDir("NONE", dir)
}
export function toDir(name: string, length?:number, rotation?: number) {
    if (!DIRECTION[name]) return deepCopy(DIRECTION.NONE);
    length = length || 1;
    return normalize(DIRECTION[name], length)
}
export function normalize(dir: Direction, length?:number) {
    length = length || 1;
    const len = lengthDir(dir);
    if (len == 0) {
        return deepCopy(DIRECTION.NONE)
    } else {
        const result = deepCopy(dir);
        result.dx = result.dx * length / len;
        result.dy = result.dy * length / len;
        result.dz = result.dz * length / len;
        return result;       
    }
}
export function lengthDir(dir: Direction) {
    return Math.sqrt(dir.dx*dir.dx + dir.dy*dir.dy + dir.dz*dir.dz);
}
export function reverse(dir: Direction) {
    return {
        dx: -dir.dx, 
        dy: -dir.dy,
        dz: -dir.dz
    } as Direction
}
export function vector(from: Position, to: Position) {
    return {
        dx: from.x - to.x, 
        dy: from.y - to.y,
        dz: from.z - to.z,
    } as Direction;
}
export function distance(from: Position, to: Position) {
    return lengthDir(vector(from, to))
}
export function add(pos: Position, dir: Direction) {
    const result = deepCopy(pos);
    result.x += dir.dx;
    result.y += dir.dy;
    result.z += dir.dz;
    return result;
}
export function substract(pos: Position, dir: Direction) {
    return add(pos, reverse(dir));
}
export function scale(dir: Direction, scaleFactor: number) {
    const result = deepCopy(dir);
    result.dx *= scaleFactor;
    result.dy *= scaleFactor;
    result.dz *= scaleFactor;
    return result;
}
export function accumulateDirection(main: Direction, contribution: Direction) {
    main.dx += contribution.dx;
    main.dy += contribution.dy;
    main.dz += contribution.dz;
}

export function positionedBox(box: Box, position: Position) {
    let aBox: PositionedBox = {n:[0,0,0,0]} // L-U-R-D
    aBox.n[0] = position.x - box.w/2 + (box.anchor?box.anchor.x:0);
    aBox.n[1] = position.y - box.h/2 + (box.anchor?box.anchor.y:0);
    aBox.n[2] = aBox.n[0] + box.w;
    aBox.n[3] = aBox.n[1] + box.h;
    return aBox;
}

export function boxOverlap(aBox?: PositionedBox, bBox?: PositionedBox) {
    if (!aBox || !bBox) return true;
    if (aBox.n[0] > bBox.n[0]) {
        return boxOverlap(bBox, aBox);
    }
    // dbg.log("Box A:", aBox);
    // dbg.log("Box B:", bBox);
    if (aBox.n[2] <= bBox.n[0]) return false;
    if (aBox.n[1] <= bBox.n[1] && aBox.n[3] <= bBox.n[1]) return false;
    if (aBox.n[1] >= bBox.n[3] && aBox.n[3] >= bBox.n[3]) return false;
    // dbg.log("Overlap!")
    return true;
}

export function inBounds(pos: Position, box: Box) {
    if (box.w > 0 && (pos.x < 0 || pos.x > box.w)) return false;
    if (box.h > 0 && (pos.y < 0 || pos.y > box.h)) return false;
    return true;
}

export function boxNextTo(dir: Direction, aBox: PositionedBox, bBox: PositionedBox) {
    if (!aBox || !bBox) return false;
    // dbg.log("IsNext:", dir)
    // dbg.log("Box A:", aBox);
    // dbg.log("Box B:", bBox);
    // check the overlap
    let overlapX = false, overlapY = false;
    if ((aBox.n[0] >= bBox.n[0] && aBox.n[0] <  bBox.n[2]) ||
        (aBox.n[0] <  bBox.n[0] && aBox.n[2] >= bBox.n[0]))
        overlapX = true;
    if ((aBox.n[1] >= bBox.n[1] && aBox.n[1] <  bBox.n[3]) ||
        (aBox.n[1] <  bBox.n[1] && aBox.n[3] >= bBox.n[1]))
        overlapY = true;
    // check the distance
    let distance = -66666666666;
    if (overlapY) {
        if (isDir("LEFT", dir))    distance = aBox.n[0]-bBox.n[2];
        if (isDir("RIGHT", dir))   distance = bBox.n[0]-aBox.n[2];
        // dbg.log("overlapY", distance, dir.name)
    }
    if (overlapX) {
        if (isDir("UP", dir))     distance = aBox.n[1]-bBox.n[3];
        if (isDir("DOWN", dir))   distance = bBox.n[1]-aBox.n[3];
    }
    return (distance >= -PROXIMITY.NEXT && distance <= PROXIMITY.NEXT);
}

