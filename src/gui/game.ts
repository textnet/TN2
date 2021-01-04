/**
 * Main module. 
 * Also contains overrides for the Excalibur engine.
 * Currently creates everything anew on each restart.
 * To be rewritten as we reach 'persistence' stage.
 */
import * as ex from "excalibur";
import { ipcRenderer } from "electron";
import { config } from "../config"
import { ThingActor } from "./actors/thing"
import { EquipmentActor } from "./actors/equipment"
import * as editor from "./editor"
import * as interop from "./renderer/send"
import * as msg from "./messages"

/**
 * Extension of the Excalibur engine that initialises it
 * with world boundaries from the config.
 */
export class Game extends ex.Engine {
    editor?: editor.Editor;
    id: string;
    isReadyToPlay: boolean;
    interopListeners: Record<string,any>;
    constructor() {
        super({
            width: config.gui.width,
            height: config.gui.height,
        });
        this.interopListeners = {};
    }
    bind(id: string) {
        this.id = id;
    }
    gameSceneName() { return "plane" }
    gameScene()     { return this.scenes[this.gameSceneName()] as GameScene; }

}


export class GameScene extends ex.Scene {
    editor?: editor.Editor;
    planeData?: msg.PlaneRenderData;
    animaId: string;
    things?: Record<string, msg.ThingRenderData>;
    thingActors?: Record<string, ThingActor>;
    equipmentActors?: Record<string, EquipmentActor>;
    environmentActors?: Record<string, ex.Actor>;
}

export function startPlaying(game: Game) {
    const check = ()=>{
        if (game.isReadyToPlay) {
            interop.loadPlane();
        } else {
            setTimeout(check, 100);
        }
    }
    check();
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
        const bounds = new ex.Vector(config.gui.width  - config.gui.padding.horizontal, 
                                     config.gui.height - config.gui.padding.vertical);
        for (let axis of ["x", "y"]) {
            if (position[axis] + radius[axis] < focus[axis]) {
                focus[axis] = position[axis] + radius[axis];
            }
            if (position[axis] - radius[axis] > focus[axis]) {
                focus[axis] = position[axis] - radius[axis];
            }
        }
        // equipment
        const thingActor = target as ThingActor;
        const scene = target.scene as GameScene
        if (thingActor.equipmentActor) {
            thingActor.equipmentActor.fitInCamera(_eng as Game, focus, bounds)
        }
        if (scene.editor && !thingActor.isKneeled) {
            editor.adjustEditorFocus(scene.editor, focus, scene.planeData)
        }
        return focus;
    }
}
