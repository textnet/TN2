import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"

import * as msg     from "../messages"
import * as events  from "../../behaviour/events"
import * as actions from "../../behaviour/actions"
import { reg } from "./setup"

reg(msg.SERVER.KNEEL, async(gui: GuiConsole, message: msg.Kneel)=>{
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    await actions.action(B, {
        action:   actions.ACTION.KNEEL,
        actorId:  animaThing.id,
        planeId:  animaThing.hostPlaneId,
    } as actions.ActionKneel);
})

reg(msg.SERVER.STANDUP, async(gui: GuiConsole, message: msg.StandUp)=>{
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    await actions.action(B, {
        action:   actions.ACTION.STANDUP,
        actorId:  animaThing.id,
        planeId:  animaThing.hostPlaneId,
        text: message.text,
        anchor: message.anchor,
    } as actions.ActionStandUp);
})



// ---------------------------------------------------------------------------
