import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "../commandline/commandline"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import { ConsoleData } from "../model/interfaces"


export class Console {
    B: BookServer;
    id: string;
    anima: WrittenAnima;
    isObserver: boolean;

    constructor(B: BookServer, consoleId?: string) {
        this.B = B;
        this.id = consoleId;
        this.isObserver = !consoleId;
    }
    isBound: boolean;
    async bind(thingId?: string)   {
        if (!thingId) {
            thingId = (await this.B.library.loadConsole(this.id)).thingId;
        } else {
            this.id = `<observer:${thingId}>`
        }
        this.anima = new WrittenAnima(this.B, thingId, "");
        await this.anima.animate(ANIMA.PERMANENT);
        await this.anima.prepareMemory();
        this.anima.controller.connectConsole(this);    
        this.isBound = true;
        cl.ok(`Console(${this.id}) bound to: ${thingId}`)
    }
    async unbind() {
        if (this.isBound) {
            this.isBound = false;
            await this.anima.controller.disconnect();
            cl.ok(`Console(${this.id}) released.`) 
            return true;
        }
        return false;
    }
    getAnima() { return this.anima; }
}