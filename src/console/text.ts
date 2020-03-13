
import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"


export class TextConsole extends Console {
    anima: WrittenAnima;

    async bind() {
        const c = await this.data();
        this.anima = new WrittenAnima(this.B, c.thingId, "");
        await this.anima.animate(ANIMA.PERMANENT);
        await this.anima.prepareMemory();
        // print everything I hear.
        this.anima.subscribe(c.thingId, events.EVENT.HEAR, events.EVENT_ROLE.SUBJECT, async function(eventData){
            const event   = eventData.data as events.EventHear;
            const speaker = await this.B.things.load(event.thingId);
            cl.log(print.str(speaker, true) + ` says: «${event.what}»`)
        })
        cl.ok(`Controller bound to: ${c.thingId}`)
    }

    async getAnima() {
        return this.anima;
    }

    async unbind() {
        if (this.anima) {
            await this.anima.terminate();
        }
        this.anima = undefined;
        cl.ok("Controller released.")
    }

}

