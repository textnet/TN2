import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"
import * as msg from "../messages"

const modules = ["plane", "move", "attempt", "transfer"]

// ---------------------------------------------------------------------------
let listeners: Record<string, any>;
export function registerServerListener(name: string, listener) {
    listeners = listeners || {};
    listeners[name] = listener;
}
export const reg = registerServerListener;
for (let module of modules) {
    const m = require("./"+module);
}

export function setup(gui: GuiConsole) {
    function process(handler) {
        return function (event, args) {
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

reg(msg.SERVER.LOG, async(gui: GuiConsole, message: msg.MessageLog)=>{
    cl.log(`GUI of «${gui.id}»:`)
    console.log(message.data);
});