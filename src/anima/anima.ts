import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { Controller } from "../behaviour/controller"
import * as print from "../commandline/print"

export const ANIMA = {
    PERMANENT: true
}

export class Anima {
    B: BookServer;
    thingId: string;
    controller: Controller;

    constructor(B: BookServer, thingId: string) {
        this.B = B;
        this.thingId = thingId;
        this.controller = new Controller(B, thingId);
        this.controller.connectAnima(this)
    }

    async str() {
        const thing = await this.B.things.load(this.thingId);
        return print.str(thing, true);
    }

    async animate(permanent?: boolean) {
        await this.controller.connect();
    }

    async terminate() {
        await this.controller.disconnect();
    }
}
