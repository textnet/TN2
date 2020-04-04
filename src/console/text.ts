
import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"


export class TextConsole extends Console {

    async bind() {
        await super.bind()
        // print everything I hear.
        this.anima.subscribe(this.anima.thingId, events.EVENT.HEAR, events.EVENT_ROLE.SUBJECT, async function(eventData){
            const event   = eventData.data as events.EventHear;
            const speaker = await this.B.things.load(event.thingId);
            cl.log(print.str(speaker, true) + ` says: «${event.what}»`)
        })
    }

}

