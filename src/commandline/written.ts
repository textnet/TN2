import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "./commandline"

let controller: Controller;

export async function bind(B: BookServer, thingId: string) {
    controller = new Controller(B, thingId);
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