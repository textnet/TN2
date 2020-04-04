/**
 * Routing of the INTEROP events between renderer <=> main processes.
 */
import { ipcRenderer } from "electron";

import { Game } from "../game"
import * as msg from "../messages"

import * as plane from "./plane"
import * as move  from "./move"

/**
 * Set up all event listeners.
 */
export function interopSetup(game: Game) {
    ipcRenderer.on(msg.RENDER.ENTER, (event, args) => { plane.enterPlane(game, args) });
    ipcRenderer.on(msg.RENDER.PLACE, (event, args) => { move.place(game, args) });
}
