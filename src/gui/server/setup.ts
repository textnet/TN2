import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"
import * as msg from "../messages"

import { loadPlane } from "./plane"

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
    ipcMain.on(msg.SERVER.LOG,     process(log));
    ipcMain.on(msg.SERVER.PLANE,   process(loadPlane));

}

async function log(gui: GuiConsole, args) {
    const p = [];
    for (let i of args) {
        if (i !== undefined) p.push(i);
    }
    const data = await gui.data();
    cl.log(`GUI of «${data.thingId}»:`)
    console.log(p);
}