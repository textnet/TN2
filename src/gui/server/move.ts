import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"

import * as msg     from "../messages"
import * as events  from "../../behaviour/events"
import * as actions from "../../behaviour/actions"

export async function startMoving(gui: GuiConsole, message: msg.Message) {
    return moving(gui, events.EVENT.MOVE_START);
}

export async function stopMoving(gui: GuiConsole, message: msg.Message) {
    return moving(gui, events.EVENT.MOVE_FINISH);
}

export async function moving(gui: GuiConsole, event: string) {
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    //
    await events.emit(B, {
        event:   event,
        actorId: animaThing.id,
        thingId: animaThing.id,
        planeId: animaThing.hostPlaneId,
    } as events.EventMoveStartFinish);
}

export async function reposition(gui: GuiConsole, message: msg.Place) {
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    // const newPosition = 
    await actions.action(B, {
        action:   actions.ACTION.PLACE,
        actorId:  animaThing.id,
        thingId:  animaThing.id,
        planeId:  animaThing.hostPlaneId,
        position: message.position
    } as actions.ActionPlace);
}

