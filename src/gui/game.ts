/**
 * Main module. 
 * Also contains overrides for the Excalibur engine.
 * Currently creates everything anew on each restart.
 * To be rewritten as we reach 'persistence' stage.
 */
import * as ex from "excalibur";
import { ipcRenderer } from "electron";
import { config } from "../config"
import * as msg from "./messages"
import { ThingActor } from "./actors/thing"

/**
 * Extension of the Excalibur engine that initialises it
 * with world boundaries from the config.
 */
export class Game extends ex.Engine {
    id: string;
    constructor() {
        super({
            width: config.gui.width,
            height: config.gui.height,
        });
    }
    bind(id: string) {
        this.id = id;
    }

    gameSceneName() { return "plane" }
    gameScene()     { return this.scenes[this.gameSceneName()] as GameScene; }

}


export class GameScene extends ex.Scene {
    // editor?: Editor;
    // hasCamera?: boolean;
    planeData?: msg.PlaneRenderData;
    animaId: string;
    things?: Record<string, msg.ThingRenderData>;
    thingActors?: Record<string, ThingActor>;
    environmentActors?: Record<string, ex.Actor>;
}