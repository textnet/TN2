import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"
import * as msg from "../gui/messages"


export class GuiConsole extends Console {
    anima: WrittenAnima;
    window: any;

    attach(window: any) {
        this.window = window;
    }

    async bind() {
        const c = await this.data();
        this.anima = new WrittenAnima(this.B, c.thingId, "");
        await this.anima.animate(ANIMA.PERMANENT);
        await this.anima.prepareMemory();
        cl.ok(`GUI(${c.id}) bound to: ${c.thingId}`)
    }

    async getAnima() {
        return this.anima;
    }

    async unbind() {
        const c = await this.data();
        if (this.anima) {
            await this.anima.terminate();
        }
        this.anima = undefined;
        cl.ok(`GUI(${c.id})  released.`)
    }

    async send(channel: string, message: msg.Message) {
        this.window.webContents.send(channel, message);
    }

}

