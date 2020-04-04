import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"

import * as msg from "../messages"

export async function loadPlane(gui: GuiConsole, args) {
    cl.verboseLog(`GUI(${gui.id}): loadPlane.`);
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    const hostPlane = await B.planes.load(animaThing.hostPlaneId);
    const thingsData : Record<string, msg.ThingRenderData> = {}
    for (let id in hostPlane.things) {
        thingsData[id] = await msg.renderThingData(B, id)
    }
    // send
    // console.log(thingsData)
    gui.send(msg.RENDER.ENTER, {
        animaId: animaThing.id,
        plane: await msg.renderPlaneData(B, hostPlane),
        things: thingsData,
    } as msg.EnterPlane);
}