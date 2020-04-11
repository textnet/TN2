import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"

import * as msg     from "../messages"
import * as events  from "../../behaviour/events"
import * as actions from "../../behaviour/actions"


export async function attemptAction(gui: GuiConsole, message: msg.Attempt) {
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    await actions.action(B, {
        action:   actions.ACTION.ATTEMPT,
        actorId:  animaThing.id,
        planeId:  animaThing.hostPlaneId,
        direction: message.direction,
        attempt: message.attempt,
    } as actions.ActionAttempt);
}

