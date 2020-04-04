/**
 * Renderer process of the Electron.
 * Responsible for all visualisation.
 * Launches Excalibur game engine.
 */
import * as ex from "excalibur";
import * as jquery from "jquery";
import { ipcRenderer } from "electron";
import { Game, GameScene } from "../gui/game"
import { MenuScene } from "../gui/menu"
import { config } from "../config"
import * as interop from "../gui/renderer/send"
import * as clientInterop from "../gui/renderer/setup"

/**
 * A proper and simple setup of the Excalibur called
 * from the renderer process of Electron.
 */
export function runGame() {
    baseCSS();
    const id = interop.id();
    const game = new Game();
    game.backgroundColor = ex.Color.fromRGB(0,0,0,0)
    game.bind(id);
    clientInterop.interopSetup(game);
    game.addScene("menu",               new MenuScene(game));
    game.addScene(game.gameSceneName(), new GameScene(game)); 
    game.goToScene("menu");
    game.start();
}

/**
 * Internal: stylize bare HTML with CSS.
 */
function baseCSS() {
    jquery("head").prepend(`<meta name="viewport" content="width=${config.gui.width/2}, initial-scale=2">`);
    jquery("body").css({ padding: 0, margin: 0, background:"#24251F" });
    jquery("canvas").css({
        zIndex: 1000,
        position: "absolute",
    })
}

runGame();


