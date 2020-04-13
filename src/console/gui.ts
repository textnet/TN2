import { BrowserWindow } from "electron"
import { Controller } from "../behaviour/controller"
import { Console } from "./console"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import * as cl from "../commandline/commandline"
import * as print from "../commandline/print"
import * as events from "../behaviour/events"
import * as msg from "../gui/messages"
import * as serverInterop from "../gui/server/setup"


export class GuiConsole extends Console {
    window: BrowserWindow;
    listeners: any;
    renderListeners: any;

    async openWindow() {
        const window = await cl.getConfig().gui(this);
        if (window) {
            this.window = window;
            await this.send(msg.RENDER.READY, {
                isReady: true,
            } as msg.MessageReady);
        }        
    }

    async bind(thingId?: string) {
        serverInterop.setup(this);
        const that = this;
        await super.bind(thingId);
    }

    async send(channel: string, message: msg.Message) {
        this.window.webContents.send(channel, message);
    }

    async unbind() {
        serverInterop.done(this);
        const wasBound = await super.unbind()
        if (wasBound) {
            if (this.window && !this.window.isDestroyed()) {
                this.window.close();
            }
        }
        return wasBound;
    }

}


