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

/**
 * Internal mapping of command keys.
 */
const KEY = {
    ENTER:   17, // CTRL=17
    PICKUP:  18, // ALT=18
    LEAVE:   ex.Input.Keys.Esc,
    PUSH:    ex.Input.Keys.Shift,
    TEXT:    13, // ENTER
}
export const COMMAND = {
    NONE:    { description: "No command" },
    ENTER:   { description: "Attempt to enter artifact's world" },
    LEAVE:   { description: "Leave the world, return to previous visited" },
    KNEEL:   { description: "Kneel into written text to alter it" },
    STAND:   { description: "Finish editing written text and get back" },
    PICKUP:  { description: "Attempt to pick an artifact up, or to put it down" },
    PUSH:    { description: "Attempt to push an artifact in the direction of movement" },
}

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
    if (game.input.keyboard.isHeld(KEY.LEAVE))       return COMMAND.LEAVE;
    if (geo.isIdle(dir)) {
        if (game.input.keyboard.isHeld(KEY.ENTER) && game.input.keyboard.isHeld(KEY.TEXT)) return COMMAND.KNEEL;
    } else {
        if (game.input.keyboard.isHeld(KEY.ENTER))   return COMMAND.ENTER;
        if (game.input.keyboard.isHeld(KEY.PUSH))    return COMMAND.PUSH;
        if (game.input.keyboard.isHeld(KEY.PICKUP))  return COMMAND.PICKUP;
    }
    return COMMAND.NONE
}

