/**
 * Routing of the INTEROP events between renderer <=> main processes.
 */
import { ipcRenderer } from "electron";

import { Game } from "../game"
import * as msg from "../messages"

import * as plane from "./plane"
import * as move  from "./move"
import * as leave from "./leave"

// TODO: investigate if I can refactor it into individual modules
let listeners: Record<string, any>;
function once() {
    registerRenderListener(msg.RENDER.READY,       plane.readyToPlay);
    registerRenderListener(msg.RENDER.ENTER_PLANE, plane.enterPlane);
    registerRenderListener(msg.RENDER.ENTER,       plane.enterActor);   
    registerRenderListener(msg.RENDER.LEAVE,       leave.leave);
    registerRenderListener(msg.RENDER.PLACE,       move.place);
    registerRenderListener(msg.RENDER.MOVE,        move.moving);
}

export function registerRenderListener(messageName: string, listener) {
    listeners = listeners || {};
    listeners[messageName] = listener;
}

/**
 * Set up all event listeners.
 */
export function interopSetup(game: Game) {
    once();
    for (let m in listeners) {
        ipcRenderer.on(m, (event, args) => { listeners[m](game, args) });
    }
}

