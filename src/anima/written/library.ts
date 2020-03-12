/**
 * Directory of all Written Word commands.
 */

import { debug } from "./library/debug"
import { get_artifacts, get_artifact, get_myself, } from "./library/get"

import { event_on, event_off } from "./library/events"

import { EVENT } from "../../behaviour/events"

// import { update } from "./library/properties"
// import { move_to, move_by, place_at, fit_at, halt } from "./library/spatial"
// import { get_text, update_text, update_line, insert_line, delete_line } from "./library/text"
// import { teleport } from "./library/teleport"

/**
 * Map of all commands currently supported in Written Word.
 * Read Written Word documentation.
 */
export const supportedFunctions = {
    "debug": { signature: ["log"], f: debug },
    "get_artifacts": { signature: ["host", "plane", "id", "name"], f: get_artifacts },
    "get_artifact":  { signature: ["host", "plane", "id", "name"], f: get_artifact  },
    "get_myself":    { signature: [],                      f: get_myself    },
    // "get_next":      { signature: ["direction"],           f: get_next      },
    // "get_closest":   { signature: ["name"],                f: get_closest   },
    //
    "on":  { signature: false, /* artifact, event, role, handler */ f: event_on }, 
    "off": { signature: ["artifact", "event", "role", "key" ,], f: event_off },

    // "update":        { signature: false,                   f: update        },
    // "self":          { signature: false,                   f: update        },

    // "teleport":    { signature: ["artifact", "target", "target_id"    ], f: teleport    },

    // "get_text":    { signature: ["artifact", "line", "anchor"         ], f: get_text    },
    // "get_line":    { signature: ["artifact", "line", "anchor"         ], f: get_text    },
    // "update_text": { signature: ["artifact", "text",                  ], f: update_text },
    // "update_line": { signature: ["artifact", "line", "anchor", "text" ], f: update_line },
    // "insert_line": { signature: ["artifact", "line", "anchor", "text" ], f: insert_line },
    // "delete_line": { signature: ["artifact", "line", "anchor"         ], f: delete_line },

    // "move_to":  { signature: ["artifact", "x", "y", "direction" ], f: move_to  },
    // "move_by":  { signature: ["artifact", "x", "y", "direction", "distance" ], 
    //                                                                f: move_by  },
    // "turn_to":  { signature: ["artifact", "directon"            ], f: move_by  },
    // "place_at": { signature: ["artifact", "x", "y", "direction" ], f: place_at },
    // "fit_at":   { signature: ["artifact", "x", "y", "direction" ], f: fit_at },
    // "halt":     { signature: ["artifact",                       ], f: halt },
}

export const supportedEvents = [ 
                                 EVENT.TIMER, 
                                 EVENT.ENTER,
                                 EVENT.LEAVE,
                                 // "move", 
                                 // "pickup", "putdown", 
                                 // "enter", "leave",
                                 // "push", 
                                 // "move_start", "move_stop",
                               ];