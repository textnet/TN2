import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "./commandline"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"

let anima: WrittenAnima;

export function getAnima() {
    return anima;
}

export async function bind(B: BookServer, thingId: string, consoleId: string) {
    anima = new WrittenAnima(B, thingId, "");
    await anima.controller.connectConsole(consoleId);
    await anima.animate(ANIMA.PERMANENT);
    cl.ok(`Controller bound to: ${thingId}`)

}
export async function unbind() {
    if (anima) {
        await anima.terminate();
        cl.ok("Controller released.")
        anima = undefined;
    }
}