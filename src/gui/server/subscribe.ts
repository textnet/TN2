import { Controller } from "../../behaviour/controller"
import { WrittenAnima } from "../../anima/written/detect"
import { GuiConsole } from "../../console/gui"
import * as events from "../../behaviour/events"
import * as msg from "../messages"
import * as equip from "../../model/equipment"


export async function unsubscribeFromCurrentPlane(gui: GuiConsole) {
    if (gui.listeners) {
        for (let event in gui.listeners) {
            gui.anima.unsubscribe(undefined, event, events.EVENT_ROLE.HOST, gui.listeners[event]);
        }
        gui.listeners = undefined;
    }
}

export async function subscribeOnPlane(gui: GuiConsole, planeId: string) {
    if (gui.listeners) {
        unsubscribeFromCurrentPlane(gui);
    }
    gui.listeners = {}
    const hostPlane  = await gui.B.planes.load(planeId);
    for (let event in mapping) {
       gui.listeners[event] = gui.anima.subscribe(
           hostPlane.ownerId, 
           event, 
           events.EVENT_ROLE.HOST, 
           (e)=>{ 
                if (e.role == events.EVENT_ROLE.HOST) {
                    // console.log(gui.id, "E->", e.data.event, e.role, e.targetIds)
                    mapping[event](gui, e.data)    
                }
            }
        )
    }
}

export const mapping = {}

mapping[events.EVENT.PLACE] = 
async function(gui: GuiConsole, e: events.EventPlace) {
    return gui.send(msg.RENDER.PLACE, {
        position: e.position,
        thingId:  e.thingId,
    } as msg.Place);    
}

mapping[events.EVENT.MOVE_START] =
mapping[events.EVENT.MOVE_FINISH] =
async function(gui: GuiConsole, e: events.EventMoveStartFinish) {
    return gui.send(msg.RENDER.MOVE, {
        isStart: e.event == events.EVENT.MOVE_START,
        thingId: e.thingId
    } as msg.Move);    
}

mapping[events.EVENT.LEAVE] = 
async function(gui: GuiConsole, e: events.EventLeave) {
    return gui.send(msg.RENDER.LEAVE, {
        thingId:  e.thingId,
    } as msg.Leave);
}

mapping[events.EVENT.ENTER] = 
async function(gui: GuiConsole, e: events.EventEnter) {
    const thingData = await msg.renderThingData(gui.B, e.thingId);
    const thingInHands = await equip.thingInHands(gui.B, e.thingId, e.thingId);
    const equippedData = thingInHands? (await msg.renderThingData(gui.B, thingInHands)) : undefined;
    return gui.send(msg.RENDER.ENTER, {
        thing: thingData,
        equipped: equippedData,
    } as msg.Enter);
}

mapping[events.EVENT.EQUIP] = 
async function(gui: GuiConsole, e: events.EventEquip) {
    const thingData = await msg.renderThingData(gui.B, e.thingId);
    return gui.send(msg.RENDER.EQUIP, {
        thing: thingData,
        ownerId: e.equipId,
    } as msg.Equip);
}

mapping[events.EVENT.UN_EQUIP] = 
async function(gui: GuiConsole, e: events.EventUnEquip) {
    const thingData = await msg.renderThingData(gui.B, e.thingId);
    return gui.send(msg.RENDER.UN_EQUIP, {
        thingId: e.thingId
    } as msg.UnEquip);
}
