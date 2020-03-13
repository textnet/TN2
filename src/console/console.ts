import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"


export class Console {
    B: BookServer;
    id: string;
    controller: Controller;

    constructor(B: BookServer, consoleId: string) {
        this.B = B;
        this.id = consoleId;
    }
    async bind()   {}
    async unbind() {}
    async data() {
        return this.B.library.loadConsole(this.id);
    }

}