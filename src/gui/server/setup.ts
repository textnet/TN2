import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"
import * as msg from "../messages"

import * as plane from "./plane"
import * as move from "./move"

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
    ipcMain.on(msg.SERVER.MOVE_START,   process(move.startMoving));
    ipcMain.on(msg.SERVER.MOVE_FINISH,  process(move.stopMoving));

}

async function log(gui: GuiConsole, message: msg.MessageLog) {
    const data = await gui.data();
    cl.log(`GUI of «${data.thingId}»:`)
    console.log(message.data);
}