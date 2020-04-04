/**
 * Routing of the INTEROP events between renderer <=> main processes.
 */
import { ipcRenderer } from "electron";

import { Game } from "../game"
import * as msg from "../messages"

import { enterPlane } from "./plane"

/**
 * Set up all event listeners.
 */
export function interopSetup(game: Game) {
    ipcRenderer.on(msg.RENDER.ENTER, (event, args) => { enterPlane(game, args) });

}
