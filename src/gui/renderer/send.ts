/**
 * INTEROP: Shooting events back to the main process:
 *  - log           - log a string or an object or...
 *  - loadPlane
 */
import { ipcRenderer } from "electron";
import * as msg from "../messages"


export function id() {
    return window.location.search.substr(1);
}
function send(name, payload) {
    ipcRenderer.send(name, {
        consoleId: id(),
        payload: payload,
    });
}

/**
 * INTEROP-> Sends some data (up to ten fields) to be put in the log
 */
export function log(a1, a2?, a3?, a4?, a5?, a6?, a7?, a8?, a9?, a10?) {
    send(msg.SERVER.LOG, [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]);
}

/**
 * INTEROP-> Ask for stage
 */
export function loadPlane() {
    send(msg.SERVER.PLANE, {});
}


