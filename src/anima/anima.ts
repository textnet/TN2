import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { Controller } from "../behaviour/controller"

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

    async animate(permanent?: boolean) {
        await this.controller.connect();
    }

    async terminate() {
        await this.controller.disconnect();
    }
}
