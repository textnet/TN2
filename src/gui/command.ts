/**
 * Module that interprets input from the player and converts it
 * into commands that will be taking into account by ArtifactActor.
 *
 * Moved into a separate file to provide more observability.
 */
import * as ex from "excalibur";

import { deepCopy     } from "../utils"
import { Game         } from "./game";
import * as geo from "../model/geometry"

/**
 * Returns a direction of the player input.
 * E.g. if player tries to move right, returns `DIR.LEFT` copy.
 * Returns DIR.NONE if there is no input that defines direction.
 * @param {Game} game - Excalibur engine
 */
export function getPlayerDirection(game: Game) {
    let result = deepCopy(geo.DIRECTION.NONE)
    // keys
    if (game.input.keyboard.isHeld(ex.Input.Keys.Left))  {
        result.dx = -1;
    }
    if (game.input.keyboard.isHeld(ex.Input.Keys.Right)) {
        result.dx = +1;
    }
    if (game.input.keyboard.isHeld(ex.Input.Keys.Up))    {
        result.dy = -1;
    }
    if (game.input.keyboard.isHeld(ex.Input.Keys.Down))  {
        result.dy = +1;
    }
    // No direction: return
    if (geo.isIdle(result)) return result;
    // Normalise direction
    return geo.normalize(result);
}
function directionPressed(game: Game) {
    const directions = [
        ex.Input.Keys.Left, 
        ex.Input.Keys.Right, 
        ex.Input.Keys.Up, 
        ex.Input.Keys.Down,
    ]
    for (let d of directions) {
        if (game.input.keyboard.wasPressed(d)) return true;
    }
    return false;
}

/**
 * Internal mapping of command keys.
 */
const KEY = {
    ENTER:     17, // CTRL=17
    PICKUP:    18, // ALT=18
    LEAVE:     ex.Input.Keys.Esc, // ENTER+LEAVE
    PUSH:      ex.Input.Keys.Shift,
    TEXT:      13, // ENTER
    EQUIPMENT: 9,  // TAB
}
export const COMMAND = {
    NONE:      { description: "No command" },
    ENTER:     { description: "Attempt to enter artifact's world" },
    LEAVE:     { description: "Leave the world, return to previous visited" },
    KNEEL:     { description: "Kneel into written text to alter it" },
    STAND:     { description: "Finish editing written text and get back" },
    PICKUP:    { description: "Attempt to pick an artifact up, or to put it down" },
    PUSH:      { description: "Attempt to push an artifact in the direction of movement" },
    EQUIPMENT: { description: "Show/Hide inventory" },
    WAIT:      { description: "Don't process commands until idle"}
    // USE:    is PUSH with item. 
}

// USE   = PUSH with item 

/**
 * Returns the command that player is trying to give.
 * E.g. COMMAND.ENTER to enter an artifact nearby.
 * Some of the commands require also direction to be provided.
 *
 * Doesn't check if the command could be possibly executed,
 * it merely recognises the intent.
 *
 * @param {Game} game - Excalibur engine
 */
export function getPlayerCommand(game: Game) {
    const dir = getPlayerDirection(game);
    const name = geo.directionName(dir);
    if (game.input.keyboard.wasReleased(KEY.EQUIPMENT))  return COMMAND.EQUIPMENT; 
    // if (game.input.keyboard.wasReleased(KEY.EQUIPMENT)) return COMMAND.EQUIPMENT; // uncomment this if HOLD-TO-SHOW-INVENTORY is true
    if (geo.isIdle(dir)) {
        if (game.input.keyboard.isHeld(KEY.ENTER) 
            && game.input.keyboard.wasReleased(KEY.TEXT))  return COMMAND.KNEEL;
        if (game.input.keyboard.isHeld(KEY.ENTER) 
            && game.input.keyboard.wasReleased(KEY.LEAVE)) return COMMAND.LEAVE;
    } else {
        if (game.input.keyboard.isHeld(KEY.ENTER)) {
            if (directionPressed(game)) return COMMAND.ENTER;
            else return COMMAND.WAIT;
        }
        if (game.input.keyboard.isHeld(KEY.PUSH)) {
            if (directionPressed(game)) return COMMAND.PUSH;
            else return COMMAND.WAIT;
        }
        if (game.input.keyboard.isHeld(KEY.PICKUP))  
            if (directionPressed(game)) return COMMAND.PICKUP;
            else return COMMAND.WAIT;
    }
    return COMMAND.NONE
}

function isCommandKey(key: number) {
    for (let name in KEY) {
        if (KEY[name] == key) return true;
    }
    return false;
}

export function wasReleased(game: Game) {
    const keys = game.input.keyboard.getKeys()
    let release = true;
    for (let key of keys) {
        release = false;
    }
    return release;
}

