import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import { subscribeOnPlane } from "./subscribe"
import * as cl from "../../commandline/commandline"

import * as msg from "../messages"
import * as equip from "../../model/equipment"

import { reg } from "./setup"

reg(msg.SERVER.PLANE, async(gui: GuiConsole, args)=>{
    cl.verboseLog(`GUI(${gui.id}): loadPlane.`);
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    const hostPlane = await B.planes.load(animaThing.hostPlaneId);
    const thingsData : Record<string, msg.ThingRenderData> = {}
    const equipData: Record<string, msg.ThingRenderData> = {};
    for (let id in hostPlane.things) {
        thingsData[id] = await msg.renderThingData(B, id);
        // TODO FIX EQUIP
        const equipped = await equip.thingInHands(B, animaThing.id, id);
        if (equipped) {
            equipData[id] = await msg.renderThingData(B, equipped.id, id);
        }
    }
    //
    await subscribeOnPlane(gui, animaThing.hostPlaneId)
    // send
    gui.send(msg.RENDER.ENTER_PLANE, {
        asObserver: gui.isObserver,
        animaThingId: animaThing.id,
        plane: await msg.renderPlaneData(B, hostPlane),
        things: thingsData,
        equipment: equipData,
    } as msg.EnterPlane);
})