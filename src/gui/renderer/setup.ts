/**
 * Routing of the INTEROP events between renderer <=> main processes.
 */
import { ipcRenderer } from "electron";
import { Game } from "../game"
import * as msg from "../messages"

const modules = ["plane", "move", "leave", "equipment"]

let listeners: Record<string, any>;
export function registerRenderListener(messageName: string, listener) {
    listeners = listeners || {};
    listeners[messageName] = listener;
}
export const reg = registerRenderListener;
for (let module of modules) {
    const m = require("./"+module);
}

/**
 * Set up all event listeners.
 */
export function interopSetup(game: Game) {
    for (let m in listeners) {
        ipcRenderer.on(m, (event, args) => {
            listeners[m](game, args) 
        });
    }
}

