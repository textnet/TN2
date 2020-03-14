// TN2 Physics

import { Box, Position, Direction } from "./geometry"

export interface ThingPhysics {
    box: Box;
    Z?:  number; // Z-level
    mass?: Record<string,number>;
    force?: Record<string, number>;
    velocity: Direction;
}

export interface PlanePhysics {
    gravity?: Record<string, PlaneGravity>;
    seasons?: Record<string, PlaneSeason>;
}

export interface PlaneGravity {
    direction:     Direction;
    velocity?:     number;    // sets things in movement with constant velocity
    acceleration?: number;    // accelerate things
    minimalMass?:  number;    // don't trigger if the mass is lighter

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
        acceleration: 1,        
    },
    WIND: {
        direction: { dx:1, dy:0 },
        velocity: 1,
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
    gravity: { mass: GRAVITY.TOPDOWN },
    seasons: { day: SEASON.DAY },
}
