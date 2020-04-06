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
    planeData?: msg.PlaneRenderData;
    animaId: string;
    things?: Record<string, msg.ThingRenderData>;
    thingActors?: Record<string, ThingActor>;
    environmentActors?: Record<string, ex.Actor>;
}


/** 
 * Strategy to move camera in a way that it always follows the player actor.
 */
export class RadiusAroundActorStrategy implements ex.CameraStrategy<ex.Actor> {
    constructor(public target: ex.Actor) {}

    /** 
     * Called regularly in the draw/update cycle.
     * As the player's actor nears screen boundary, we start to move camera,
     * so the player will alwyas stay in the visible area.
     */
    public action(
        target: ex.Actor,
        cam: ex.Camera,
        _eng: ex.Engine,
        _delta: number
    ) {
        const position = target.center;
        let focus = cam.getFocus();
        const radius = {
            x: config.gui.width/2 - config.gui.padding.horizontal,
            y: config.gui.height/2 - config.gui.padding.vertical,
        }
        for (let axis of ["x", "y"]) {
            if (position[axis] + radius[axis] < focus[axis]) {
                focus[axis] = position[axis] + radius[axis];
            }
            if (position[axis] - radius[axis] > focus[axis]) {
                focus[axis] = position[axis] - radius[axis];
            }
        }
        // TODO: kneeling here
        return focus;
    }
}
