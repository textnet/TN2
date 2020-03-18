// TN2 Physics

import { Box, Position, Direction } from "./geometry"

export interface ThingPhysics {
    box: Box;
    Z?:  number; // Z-level required to pass over
    mass?: Record<string,number>;
    force?: Record<string, number>;
    inertia?: Direction; // applied physics as result of acceleration
    momentum?: Direction; // applied speed/tension and momentum gravity
    speed?: number;       // 100 is 1:1
}

export interface PlanePhysics {
    box?: Box;
    gravity?: Record<string, PlaneGravity>;
    seasons?: Record<string, PlaneSeason>;
    friction?: number; // 100 is 1:1; slowing any movement in any direction
}

export const TIME_MOMENTUM = 1;      // how many units of time per 1 unit of inertia/momentum
export const TIME_ACCELERATION = 1;  // how many units of time per 1 unit of acceleration
export const DEFAULT_SPEED = 100;
export const DEFAULT_INERTIA = 100;

export interface PlaneGravity {
    direction:     Direction;
    momentum?:     number;    // sets things in movement with constant inertia
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
        momentum: 1,        
    },
    WIND: {
        direction: { dx:1, dy:0 },
        momentum: 1,
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
