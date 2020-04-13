import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"
import * as msg from "../messages"

import * as plane from "./plane"
import * as move from "./move"
import * as attempt from "./attempt"
import * as transfer from "./transfer"

// TODO refactor to remove once();
let listeners: Record<string, any>;
function once() {
    registerServerListener(msg.SERVER.PLANE,       plane.loadPlane);
    registerServerListener(msg.SERVER.PLACE,       move.reposition);
    registerServerListener(msg.SERVER.ATTEMPT,     attempt.attemptAction);
    registerServerListener(msg.SERVER.TRANSFER_UP, transfer.transferUp);
    registerServerListener(msg.SERVER.MOVE_START,  move.startMoving);
    registerServerListener(msg.SERVER.MOVE_FINISH, move.stopMoving);
}
once();
export function registerServerListener(name: string, listener) {
    listeners = listeners || {};
    listeners[name] = listener;
}

export function setup(gui: GuiConsole) {
    function process(handler) {
        return function (event, args) {
            console.log("process", event, args)
            if (args.consoleId == gui.id) {
                handler(gui, args.payload)    
            }
        }
    }
    gui.renderListeners = gui.renderListeners || {};
    for (let name in listeners) {
        gui.renderListeners[name] = process(listeners[name]);
        ipcMain.on(name, gui.renderListeners[name]);
    }
}

export function done(gui: GuiConsole) {
    gui.renderListeners = gui.renderListeners || {};
    for (let name in gui.renderListeners) {
        ipcMain.off(name, gui.renderListeners[name]);
    }
    gui.renderListeners = undefined;
}


async function log(gui: GuiConsole, message: msg.MessageLog) {
    cl.log(`GUI of «${gui.id}»:`)
    console.log(message.data);
}