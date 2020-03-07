// TN2 Physics

import { Box, Position, Direction } from "./geometry"

export interface ThingPhysics {
    box: Box;
    Z?:  number; // Z-level
    mass?: Record<string,number>;
    force?: Record<string, number>;
}

export interface PlanePhysics {
    gravity?: Record<string, number>;
    seasons?: PlaneSeason[];
}

export interface PlaneSeason {
    name:  string;
    times: number[];
    names: string[];
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
    DAY: { name: "Day", 
           times: [DURATION.HOUR*6, DURATION.HOUR*6, DURATION.HOUR*6, DURATION.HOUR*6],
           names: ["Night", "Morning", "Day", "Evening"],
    },
    SEASONS: { name: "Year", 
            times: [DURATION.SEASON, DURATION.SEASON, DURATION.SEASON, DURATION.SEASON],
            names: ["Winter", "Spring", "Summer", "Autumn"],
    },
    MONTHS: { name: "Year", 
              times: [DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, 
                      DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, 
                      DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, DURATION.MONTH, ],
              names: ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"],
    },
}
