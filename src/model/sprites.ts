import { deepCopy } from "../utils"
import { Box, Position, Direction, directionName, isIdle } from "./geometry"
// Everything about sprites

// for excalibur we need to extend Sprite.
// default sprite is a storage structure.
export interface Sprite {
    size: Box;
    symbol: string;  // mandatory!
    base64?: string; // shortcut for one static idle unidirectional image
    steps?: number;  // default number of steps in animations
    offset?: { x: number, y: number }; // shift from the center
    hasDiagonals?: boolean; // to make use of UL/UR/DL/DR sprites
    mapping?: Record<string, number[]>; // for each 'state-direction-animation' 
                                        // [<number of the row in the mapping>, <optional no of steps>]
}

export const simplestSprites: Record<string,Sprite> = {
    verbose: {  symbol: "@",
                size: { w: 32, h: 32 },
                base64: "....",
                steps: 16,
                mapping: {
                    "Idle(Up  )Main":   [0, 1],
                    "Idle(Down)Main": [1, 1],
                    "Move(Up  )Main":   [0],
                    "Move(Down)Main": [1],
                }
             },
    minimal: {  symbol: "@",
                size: { w: 32, h: 32 },
             },
    static:  {  symbol: "@", 
                size: { w: 32, h: 32 },
                base64: "...",
             },
}


export const DIR = {
    UP     : "Up",
    DOWN   : "Down",
    LEFT   : "Left",
    RIGHT  : "Right",
    UL     : "UL",
    DL     : "DL",
    UR     : "UR",
    DR     : "DR",
    NONE   : "Down",
}
export const STATE = {
    IDLE   : "Idle",
    MOVE   : "Move",
    PUSH   : "Push",
    FLY    : "Fly",
    INVENTORY : "Inventory"
}
export const ANIMATION = {
    MAIN : "Main",
    IN   : "Ease-In",
    OUT  : "Ease-Out",
}
export const SPEED = 60;

export function code(state?:string, dir?:string, animation?:string) {
    const myState     = state       === undefined? STATE.IDLE     : state;
    const myDir       = dir         === undefined? DIR.NONE       : dir;
    const myAnimation = (animation || ANIMATION.MAIN == ANIMATION.MAIN) ? "" : `->${animation}`;
    return `${myState}(${myDir})${myAnimation}`;
}

export function isDiagonalCode(code: string) {
    const dirs = [DIR.UL, DIR.DL, DIR.UR, DIR.DR];
    for (let dirName in dirs) {
        if (code.indexOf(`(${dirs[dirName]})`) >= 0) return true;
    }
    return false;
}
export function isDiagonal(dir: Direction) {
    return dir.dx*dir.dy != 0;    
}
export function isDiagonalName(name: string) {
    const dirs = [DIR.UL, DIR.DL, DIR.UR, DIR.DR];
    for (let dirName in dirs) {
        if (name == dirs[dirName]) return true;
    }
    return false;
}

export function straightenDiagonalName(dir: Direction) {
    const modX = dir.dx*Math.sign(dir.dx);
    const modY = dir.dy*Math.sign(dir.dy);
    if (modX > modY) {
        if (dir.dx < 0) return DIR.LEFT;
        else            return DIR.RIGHT;
    } else {
        if (dir.dy < 0) return DIR.UP;
        else            return DIR.DOWN;
    }
}
