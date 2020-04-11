import { Controller } from "../../behaviour/controller"
import { WrittenAnima } from "../../anima/written/detect"
import { GuiConsole } from "../../console/gui"
import * as events from "../../behaviour/events"
import * as msg from "../messages"



export async function setup(gui: GuiConsole) {
    const animaThing = await gui.B.things.load(gui.anima.thingId);
    const hostPlane  = await gui.B.planes.load(animaThing.hostPlaneId);

    const mapping = {}
    mapping[events.EVENT.PLACE]       = sendPlace;
    mapping[events.EVENT.MOVE_START]  = sendMove;
    mapping[events.EVENT.MOVE_FINISH] = sendMove;
    mapping[events.EVENT.LEAVE]       = sendLeave;

    for (let event in mapping) {
       gui.anima.subscribe(hostPlane.ownerId, 
                           event, 
                           events.EVENT_ROLE.HOST, 
                           (e)=>{ return mapping[event](gui, e.data) });
    }    
}

export async function sendPlace(gui: GuiConsole, e: events.EventPlace) {
    return gui.send(msg.RENDER.PLACE, {
        position: e.position,
        thingId:  e.thingId,
    } as msg.Place);    
}

export async function sendMove(gui: GuiConsole, e: events.EventMoveStartFinish) {
    return gui.send(msg.RENDER.MOVE, {
        isStart: e.event == events.EVENT.MOVE_START,
        thingId: e.thingId
    } as msg.Move);    
}

export async function sendLeave(gui: GuiConsole, e: events.EventLeave) {
    return gui.send(msg.RENDER.LEAVE, {
        thingId:  e.thingId,
    } as msg.Leave);    
}