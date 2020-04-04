import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"
import * as msg from "../gui/messages"


export class GuiConsole extends Console {
    window: any;

    attach(window: any) {
        this.window = window;
    }

    async bind() {
        const that = this;
        await super.bind()
        // reposition everything I see
        const animaThing = await this.B.things.load(this.anima.thingId);
        const hostPlane  = await this.B.planes.load(animaThing.hostPlaneId);
        this.anima.subscribe(hostPlane.ownerId, 
            events.EVENT.PLACE, 
            events.EVENT_ROLE.HOST, 
            async function(eventData) {
                return that.updateRenderer(eventData.data as events.Event);
            }
        )
    }

    async updateRenderer(eventData: events.Event) {
        switch(eventData.event) {
            case events.EVENT.PLACE:
                const e = eventData as events.EventPlace;
                this.send(msg.RENDER.PLACE, {
                    position: e.position,
                    thingId:  e.thingId,
                } as msg.Place);
                break;
        }
    }

    async send(channel: string, message: msg.Message) {
        this.window.webContents.send(channel, message);
    }

}

