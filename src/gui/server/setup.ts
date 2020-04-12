import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"
import * as msg from "../messages"

import * as plane from "./plane"
import * as move from "./move"
import * as attempt from "./attempt"
import * as transfer from "./transfer"

let monitoredChannels = [
    // "log",
]

export function setup(gui: GuiConsole) {
    for (let c of monitoredChannels) {
        ipcMain.on(c, (event, args) => {
            console.log(`-> SERVER.${c}`, args)
        } )
    }
    function process(handler) {
        return function (event, args) {
            if (args.consoleId == gui.id) {
                handler(gui, args.payload)    
            }
        }
    }
    // bindings
    ipcMain.on(msg.SERVER.LOG,          process(log));
    ipcMain.on(msg.SERVER.PLANE,        process(plane.loadPlane));
    ipcMain.on(msg.SERVER.PLACE,        process(move.reposition));
    ipcMain.on(msg.SERVER.ATTEMPT,      process(attempt.attemptAction));
    ipcMain.on(msg.SERVER.TRANSFER_UP,  process(transfer.transferUp));
    ipcMain.on(msg.SERVER.MOVE_START,   process(move.startMoving));
    ipcMain.on(msg.SERVER.MOVE_FINISH,  process(move.stopMoving));
}


async function log(gui: GuiConsole, message: msg.MessageLog) {
    cl.log(`GUI of «${gui.id}»:`)
    console.log(message.data);
}