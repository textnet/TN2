import { GuiConsole } from "../../console/gui";
import * as cl from "../../commandline/commandline"

import * as msg     from "../messages"
import * as events  from "../../behaviour/events"
import * as actions from "../../behaviour/actions"

import { reg } from "./setup"

reg(msg.SERVER.TRANSFER_UP, async (gui: GuiConsole, message: msg.TransferUp)=>{
    const B = gui.anima.B;
    const animaThing = await B.things.load(gui.anima.thingId);
    await actions.action(B, {
        action:   actions.ACTION.TRANSFER_UP,
        actorId:  animaThing.id,
        planeId:  animaThing.hostPlaneId,
    } as actions.ActionTransferUp);
})

