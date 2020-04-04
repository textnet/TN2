import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "../commandline/commandline"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"


export class Console {
    B: BookServer;
    id: string;
    anima: WrittenAnima;

    constructor(B: BookServer, consoleId: string) {
        this.B = B;
        this.id = consoleId;
    }
    async bind()   {
        const c = await this.data();
        this.anima = new WrittenAnima(this.B, c.thingId, "");
        await this.anima.animate(ANIMA.PERMANENT);
        await this.anima.prepareMemory();
        cl.ok(`GUI(${c.id}) bound to: ${c.thingId}`)        
    }
    async unbind() {
        const c = await this.data();
        if (this.anima) {
            await this.anima.terminate();
        }
        this.anima = undefined;
        cl.ok(`GUI(${c.id})  released.`)        
    }
    async data() {
        return this.B.library.loadConsole(this.id);
    }
    async getAnima() {
        return this.anima;
    }
    

}