import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import * as ex from "excalibur"
import { ThingActor } from "../actors/thing"


export function leave(game: Game, data: msg.Leave) {
    // remove actor or ask for new plane
    const scene = game.gameScene();
    if (data.thingId == scene.animaId) {
        interop.loadPlane();
    } else {
        scene.remove(scene.thingActors[data.thingId]);
        delete scene.thingActors[data.thingId];
    }
}


