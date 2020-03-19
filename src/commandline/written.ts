import { Controller } from "../behaviour/controller"
import { BookServer } from "../model/book"
import * as cl from "./commandline"
import { WrittenAnima } from "../anima/written/detect"
import { ANIMA } from "../anima/anima"
import { TextConsole } from "../console/text"
import { GuiConsole }  from "../console/gui"


let ui: TextConsole;

export function getAnima() {
    if (ui) return ui.anima;
    else return undefined;
}

export async function bind(B: BookServer, consoleId: string) {
    ui = new TextConsole(B, consoleId);
    await ui.bind();
}
export async function unbind() {
    if (ui) {
        await ui.unbind();
        ui = undefined;
    }
}

export async function gui(B: BookServer, consoleId: string) {
    const window = cl.getConfig().gui();
    if (window) {
        const gui = new GuiConsole(B, consoleId);
        gui.attach(window);
        await gui.bind();        
    }
}