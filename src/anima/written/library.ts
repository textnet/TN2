/**
 * Directory of all Written Word commands.
 */

import { debug } from "./library/debug"
import { teleport } from "./library/teleport"
import { leave } from "./library/leave"
import * as get from "./library/get"
import * as say from "./library/say"
import * as attempt from "./library/attempt"
import * as spatials from "./library/spatials"

import { event_on, event_off } from "./library/events"

import { EVENT } from "../../behaviour/events"

// import { update } from "./library/properties"
// import { move_to, move_by, place_at, fit_at, halt } from "./library/spatial"
// import { get_text, update_text, update_line, insert_line, delete_line } from "./library/text"

/**
 * Map of all commands currently supported in Written Word.
 * Read Written Word documentation.
 */
export const supportedFunctions = {
    "debug": { signature: ["log", "where", "list"], f: debug },
    "get_artifacts": { signature: ["host", "plane", "id", "name"], f: get.get_things },
    "get_artifact":  { signature: ["host", "plane", "id", "name"], f: get.get_thing  },
    "get_myself":    { signature: [],                      f: get.get_myself    },
    "get_next":      { signature: ["direction"],           f: get.get_next      },
    "get_closest":   { signature: ["name"],                f: get.get_closest   },
    //
    "on":  { signature: false, /* thing, event, role, handler */ f: event_on }, 
    "off": { signature: ["thing", "event", "role", "key" ,],     f: event_off },
    //
    "teleport":    { signature: ["thing", "to" ], f: teleport },
    "leave":       { signature: false,            f: leave },
    //
    "say":         { signature: ["what", "loudness"], f: say.say },
    "shout":       { signature: ["what"], f: say.shout },
    "whisper":     { signature: ["what"], f: say.whisper },
    //
    "attempt":     { signature: ["action", "direction"], f: attempt.attempt },
    "enter":       { signature: ["direction"], f: attempt.enter },
    "push":        { signature: ["direction"], f: attempt.push },
    "pickup":      { signature: ["direction"], f: attempt.pickup },

    // "update":        { signature: false,                   f: update        },
    // "self":          { signature: false,                   f: update        },

    // "get_text":    { signature: ["artifact", "line", "anchor"         ], f: get_text    },
    // "get_line":    { signature: ["artifact", "line", "anchor"         ], f: get_text    },
    // "update_text": { signature: ["artifact", "text",                  ], f: update_text },
    // "update_line": { signature: ["artifact", "line", "anchor", "text" ], f: update_line },
    // "insert_line": { signature: ["artifact", "line", "anchor", "text" ], f: insert_line },
    // "delete_line": { signature: ["artifact", "line", "anchor"         ], f: delete_line },

    "move_to":  { signature: ["thing", "x", "y", "direction" ],     f: spatials.move_to  },
    "move_by":  { signature: ["thing", "dx", "dy", "direction", 
                              "distance", "duration", "angle"],     f: spatials.move_by  },
    "halt":     { signature: ["thing", ],                           f: spatials.halt },

    // "turn_to":  { signature: ["artifact", "directon"            ], f: move_by  },
    // "place_at": { signature: ["artifact", "x", "y", "direction" ], f: place_at },
    // "fit_at":   { signature: ["artifact", "x", "y", "direction" ], f: fit_at },
}

export const supportedEvents = [ 
                                 EVENT.TIMER, 
                                 EVENT.PLACE,
                                 EVENT.ENTER,
                                 EVENT.LEAVE,
                                 EVENT.HEAR,
                                 EVENT.ENTER,
                                 EVENT.LEAVE,
                                 EVENT.MOVE_FINISH,
                                 EVENT.MOVE_START,
                                 EVENT.PLACE,
                                 // "pickup", "putdown", 
                                 // "push", 
                               ];
