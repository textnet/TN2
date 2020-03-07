import { Box, Position, Direction } from "./geometry"
// Everything about sprites

// for excalibur we need to extend Sprite.
// default sprite is a storage structure.
export interface Sprite {
    size: Box;
    symbol: string; // mandatory!
    base64?: string; // shortcut for one static idle unidirectional image
    directions?: Record<string, SpriteImage>; // shortcut for idle with directions
    states?: Record<string, SpriteState>; // idle, move, etc.
    implementation?: Record<string, any>; // GUI implementation, e.g. 2D or 3D builds cached structure here
    // ^ caching is done in the `render` part of the gui
}
export interface SpriteState { 
    directions: Record<string, SpriteImage>; // up, down,...
}
export interface SpriteImage { 
    symbol?: string; // shortcut for static symbol
    base64?: string; // shortcut for static picture with the same box
    animations?: Record<string, SpriteAnimation>; // main, easeIn, easeOut
}
export interface SpriteAnimation {
    symbol?:  string; // for text interface
    base64?: string; // for 3D sprite
    steps?: number;
    size? : Box;
}

export const simplestSprites: Record<string,Sprite> = {
    verbose: {  symbol: "@",
                size: { w: 32, h: 32 },
                states: { idle: { directions: {up: { animations: {main: {symbol: "@"}}}}}}
             },
    minimal: {  symbol: "@",
                size: { w: 32, h: 32 },
             },
    static:  {  symbol: "@", 
                size: { w: 32, h: 32 },
                base64: "...",
             },
    directional: { symbol: "@",
                   size: { w: 32, h: 32 },
                   directions: { up: { base64:"..." }, down: { base64:"..."} }
                 },
    minimalAnimation: { symbol: "^>v<", size: {w:64, h:64} },
}


export const DIR = {
    UP     : "Up",
    DOWN   : "Down",
    LEFT   : "Left",
    RIGHT  : "Right",
    UL     : "Up Left",
    DL     : "DownLeft",
    UR     : "Up Right",
    DR     : "Down-Right",
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
    IN   : "Ease In",
    OUT  : "Ease Out",
}

export function spriteCode(state?:string, dir?:string, animation?:string) {
    const myState = state === undefined? STATE.IDLE : state;
    const myDir = dir === undefined? DIR.UP     : dir;
    const myAnimation = animation === undefined? ANIMATION.MAIN : animation;
    return `${myState}-${myDir}-${myAnimation}`;
}
export function getCode(sprite: Sprite, state?:string, dir?:string, animation?:string) {
    let code = spriteCode(state, dir, animation);
    if (sprite.implementation[code]) {
        return sprite.implementation[code]
    }
    code = spriteCode(state, dir);
    if (sprite.implementation[code]) {
        return sprite.implementation[code]
    }
    code = spriteCode(state)
    if (sprite.implementation[code]) {
        return sprite.implementation[code]
    };
    return sprite.implementation[""]
}
