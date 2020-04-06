import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"
import * as msg from "../gui/messages"
import * as serverInterop from "../gui/server/send"


export class GuiConsole extends Console {
    window: any;

    attach(window: any) {
        this.window = window;
    }

    async bind(thingId?: string) {
        const that = this;
        await super.bind(thingId);
        await serverInterop.setup(this);
    }

    async send(channel: string, message: msg.Message) {
        this.window.webContents.send(channel, message);
    }

}

