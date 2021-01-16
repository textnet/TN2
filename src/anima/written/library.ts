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
import * as update from "./library/update"
import * as equip from "./library/equip"
import * as text from "./library/text"

import { event_on, event_off } from "./library/events"

import { EVENT } from "../../behaviour/events"

// import { place_at, fit_at } from "./library/spatial"
// import { get_text, update_text, update_line, insert_line, delete_line } from "./library/text"

/**
 * Map of all commands currently supported in Written Word.
 * Read Written Word documentation.
 */
export const supportedFunctions = {
    "debug": { signature: ["log", "where", "list"], f: debug },
    "get_things":    { signature: ["plane", "id", "name"], f: get.get_things },
    "get_thing":     { signature: ["plane", "id", "name"], f: get.get_thing  },
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
    "attempt":      { signature: ["action", "direction", "slot"], f: attempt.attempt },
    "enter":        { signature: ["direction"], f: attempt.enter },
    "push":         { signature: ["direction"], f: attempt.push },
    "pickup":       { signature: ["direction", "slot"], f: attempt.pickup },
    "putdown":      { signature: ["direction", "slot"], f: attempt.putdown },
    //
    "equip":        { signature: ["thing", "owner", "slot"],         f: equip.equip },
    "un_equip":     { signature: ["owner", "slot", "direction"],     f: equip.unEquip },
    "re_equip":     { signature: ["owner_from", "slot_from", "owner_to", "slot_to"], f: equip.reEquip },
    //
    "self":              { signature: false,                                     f: update.update },
    "update":            { signature: false,                                     f: update.update },
    "update_constraint": { signature: ["thing", "constraint", "name", "value" ], f: update.constraints },
    "update_color":      { signature: ["thing", "color", "name", "value" ],      f: update.colors },
    "update_physics":    { signature: ["thing", "plane", 
                                       "width", "height", "anchor_x", "anchor_y", 
                                       "slot", "Z",
                                       "speed", "friction",
                                       "mass", "force", "gravity", "value", 
                                       "direction", "minimal", "maximal" ],      f: update.physics },
    "update_equipment":  { signature: ["thing", "default", "autopicking", "everything", 
                                       "scale_slots", "thing_sprite", "thing_sScale"], f: update.equipment },
    "update_seasons":    { signature: ["thing", "plane", "names", "times" ],     f: update.seasons },


    "get_text":    { signature: ["thing", "plane", "line", "anchor"          ], f: text.get_text    },
    "get_line":    { signature: ["thing", "plane", "line", "anchor"          ], f: text.get_text    },
    "update_text": { signature: ["thing", "plane", "text",                   ], f: text.update_text },
    "update_line": { signature: ["thing", "plane", "line", "anchor", "text", ], f: text.update_line },
    "insert_line": { signature: ["thing", "plane", "line", "anchor", "text", ], f: text.insert_line },
    "delete_line": { signature: ["thing", "plane", "line", "anchor"        , ], f: text.delete_line },

    "move_to":  { signature: ["thing", "x", "y", "direction" ],       f: spatials.move_to  },
    "move_by":  { signature: ["thing", "dx", "dy", "direction", 
                              "distance", "duration", "angle"],       f: spatials.move_by  },
    "turn_to":  { signature: ["thing", "", "", "", "", "", "angle"],  f: spatials.move_by  },
    "halt":     { signature: ["thing", ],                             f: spatials.halt },

    // "place_at": { signature: ["artifact", "x", "y", "direction" ], f: place_at },
    // "fit_at":   { signature: ["artifact", "x", "y", "direction" ], f: fit_at },
}
// synonyms
supportedFunctions["self"] = supportedFunctions["update"];
for (let name of ["constraint", "color", "physics", "equipment", "seasons"]) {
    supportedFunctions[name] = supportedFunctions[ "update_"+name ];
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
