/**
 * INTEROP: Shooting events back to the main process:
 *  - log           - log a string or an object or...
 *  - loadPlane
 */
import { ipcRenderer } from "electron";
import * as msg from "../messages"
import * as geo from "../../model/geometry"


export function id() {
    return unescape(window.location.search.substr(1));
}
function send(name, payload?: msg.Message) {
    ipcRenderer.send(name, {
        consoleId: id(),
        payload: payload || {},
    });
}

/**
 * INTEROP-> Sends some data (up to ten fields) to be put in the log
 */
export function log(a1, a2?, a3?, a4?, a5?, a6?, a7?, a8?, a9?, a10?) {
    send(msg.SERVER.LOG, {data: [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]} as msg.MessageLog);
}

/**
 * INTEROP-> Ask for stage
 */
export function loadPlane() { send(msg.SERVER.PLANE); }

/**
 * INTEROP-> Start/stop moving
 */
export function startMoving() { send(msg.SERVER.MOVE_START);  }
export function stopMoving()  { send(msg.SERVER.MOVE_FINISH); }

/**
 * INTEROP-> Reposition
 */
export function reposition(position: geo.Position) {
    send(msg.SERVER.PLACE, {
        position: position 
    } as msg.Place);
}

/**
 * INTEROP-> Attempt(Push, Pickup, etc.)
 */
export function attempt(attempt: string, direction: geo.Direction) {
    send(msg.SERVER.ATTEMPT, {
        direction: direction,
        attempt: attempt
    } as msg.Attempt);
}

/**
 * INTEROP-> Transfer itself up in visits stack
 */
export function transferUp() { send(msg.SERVER.TRANSFER_UP); }

