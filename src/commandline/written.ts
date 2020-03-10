import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "./commandline"

let controller: Controller;

export async function bind(B: BookServer, thingId: string, consoleId: string) {
    controller = new Controller(B, thingId);
    controller.connectConsole(consoleId);
    await controller.connect();
    cl.ok(`Controller bound to: ${thingId}`)

}
export async function unbind() {
    if (controller) {
        await controller.disconnect();
        cl.ok("Controller released.")
        controller = undefined;
    }
}