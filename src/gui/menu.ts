/** 
 * Module about rendering the game scene.
 */
import * as ex from "excalibur";
import { config } from "../config"
import * as interop from "./renderer/send"

/** 
 * Excalibur Scene for menu
 */
export class MenuScene extends ex.Scene {
    onInitialize() {
        // create UI
        let title = new ex.UIActor();
        title.width = config.gui.width;
        title.pos.y = 200;
        title.height = 50;
        title.color = ex.Color.fromHex("#EF6B75");
        let text = new MenuStart();
        text.color = ex.Color.fromHex("#FFFFFF");
        text.fontFamily = "Nanum Gothic Coding, monospace";
        text.fontSize = 40;
        text.fontUnit = ex.FontUnit.Px;
        text.textAlign = ex.TextAlign.Center;
        text.pos.x = title.width /2;
        text.pos.y = (title.height+text.fontSize)/2;
        text.text = "PRESS <SPACE> TO START";
        title.add(text);
        this.add(title);
    }
}



export class MenuStart extends ex.Label {
    _done: boolean;
    update(engine, delta) {
        super.update(engine, delta);
        if (this._done) return;
        if (config.debug.skipTitle || engine.input.keyboard.wasReleased(ex.Input.Keys.Space)) {
            this._done = true;
            interop.loadPlane();
        }
    }
}