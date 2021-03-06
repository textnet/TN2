// TN2 Physics

import { Box, Position, Direction } from "./geometry"
import * as geo from "./geometry"

export interface ThingPhysics {
    box: Box;
    Z?:  number; // Z-level required to pass over
    mass?: Record<string,number>;
    force?: Record<string, number>;
    _inertia?: Direction; // applied physics as result of acceleration
    _momentum?: Direction; // applied speed/tension and _momentum gravity
    speed?: number;       // 100 is 1:1
}


export interface PlanePhysics {
    box?: Box;
    gravity?: Record<string, PlaneGravity>;
    seasons?: Record<string, PlaneSeason>;
    friction?: number; // 100 is 1:1; slowing any movement in any direction
}

export const TIME_MOMENTUM     = 10;    // how many units of time per 1 unit of _inertia/_momentum. More = slower
export const TIME_ACCELERATION = 1.00;  // how many units of time per 1 unit of acceleration
export const DEFAULT_SPEED = 100;
export const DEFAULT_INERTIA = 100;
export const FORCE_AMPLIFIER_PUSH = 1; // how much force of push is amplified, higher = stronger.

export interface PlaneGravity {
    direction:     Direction;
    _momentum?:     number;   // sets things in movement with constant _inertia
    acceleration?: number;    // accelerate things
    minimalMass?:  number;    // don't trigger if the mass is lighter
    maximalMass?:  number;    // don't trigger if the mass is heavier

}

export interface PlaneSeason {
    times: number[];
    names: string[];
}


export const GRAVITY: Record<string, PlaneGravity> = {
    TOPDOWN: {
        direction: { dx:0, dy:0, dz:-1 },
        acceleration: 1,
    },
    MARIO: {
        direction: { dx:0, dy:1 },
        _momentum: 1,        
    },
    WIND: {
        direction: { dx:1, dy:0 },
        _momentum: 1,
    },
}

export const DURATION: Record<string, number> = {
    SECOND: 1,
    MINUTE: 60,
    HOUR:   60*60,
    DAY:    60*60*24,
    WEEK:   60*60*24*7,
    MONTH:  60*60*24*30, // NB!
    SEASON: 60*60*24*30*3, 
    YEAR:   60*60*24*30*3*4,
}

export const SEASON: Record<string, PlaneSeason> = {
    DAY: { 
           times: [DURATION.HOUR*6, DURATION.HOUR*6, DURATION.HOUR*6, DURATION.HOUR*6],
           names: ["Night", "Morning", "Day", "Evening"],
    },
    SEASONS: { 
            times: [DURATION.SEASON, DURATION.SEASON, DURATION.SEASON, DURATION.SEASON],
            names: ["Winter", "Spring", "Summer", "Autumn"],
    },
    MONTHS: { 
              times: [DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, 
                      DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, 
                      DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, ],
              names: ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"],
    },
}

export const PLANE_PHYSICS_DEFAULT: PlanePhysics = {
    box:     { w: 0, h: 0 },
    gravity: { mass: GRAVITY.TOPDOWN },
    seasons: { day: SEASON.DAY },
    friction: DEFAULT_INERTIA,
}

export function patchThingPhysics(physics: ThingPhysics) {
    const defaults = {
        speed: DEFAULT_SPEED,
        Z: 0,
        mass: {},
        force: {},
    }
    for (let i in defaults) {
        physics[i] = physics[i] || defaults[i];
    }
    return physics;    
}


export function patchPlanePhysics(physics: PlanePhysics) {
    const defaults = {
        friction: DEFAULT_INERTIA,
        gravity: {},
        seasons: {},
    }
    for (let i in defaults) {
        physics[i] = physics[i] || defaults[i];
    }
    return physics;
}


export function velocity(thing: ThingPhysics, plane: PlanePhysics, timeDelta: number) {
    const velocity = (thing.speed / plane.friction) * (timeDelta / TIME_MOMENTUM);
    return velocity;
}


