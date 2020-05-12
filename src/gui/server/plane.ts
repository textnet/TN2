import { ipcMain } from "electron"
import { GuiConsole } from "../../console/gui";
import { subscribeOnPlane } from "./subscribe"
import * as cl from "../../commandline/commandline"
import * as print from "../../commandline/print"

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




reg(msg.SERVER.EQUIPMENT, async(gui: GuiConsole, args)=>{
    cl.verboseLog(`GUI(${gui.id}): loadEquipment(${args.ownerId}).`);
    const message = args as msg.RequestEquipment;
    const B = gui.anima.B;
    const owner = await B.things.load(message.ownerId);
    const contents = await equip.getEquipment(B, message.ownerId, message.slotName);
    const slots = await equip.getSlots(B, message.ownerId, message.slotName)
    //
    if (!message.slotName && contents[owner.equipment.everything]) {
        contents[owner.equipment.everything].equipmentContents = [];
    }
    const equipmentPlane = await B.getEquipmentPlane(owner.id);
    const thingsData: Record<string,msg.ThingRenderData> = {}
    const slotsData: Record<string,msg.ThingRenderData> = {}
    for (let name in slots) {
        for (let slot of slots[name]) {
            slotsData[slot.id] = await msg.renderThingData(B, slot);
        }
    }
    for (let name in contents) {
        const slot = contents[name];
        for (let thing of slot.equipmentContents) {
            thingsData[thing.id] = await msg.renderThingData(B, thing);
            thingsData[thing.id].slotId = slot.id;
        }
    }
    // send
    gui.send(msg.RENDER.EQUIPMENT, {
        contents: {
            ownerId:  message.ownerId,
            slotName: message.slotName,
            things: thingsData,
            slots:  slotsData,
            plane: await msg.renderPlaneData(B, equipmentPlane),
        }
    } as msg.Equipment);
})