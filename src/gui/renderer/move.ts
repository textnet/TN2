import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import * as ex from "excalibur"
import { ThingActor } from "../actors/thing"
import { COLORS, COLORS_DEFAULT } from "../../model/interfaces"
import * as sprites from "../../model/sprites"


export function place(game: Game, data: msg.Place) {
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        scene.thingActors[data.thingId].repositionFromServer(game, data.position);
    }
}

export function moving(game: Game, data: msg.Move) {
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        // TODO ease-in/out
        let state = sprites.STATE.IDLE;
        if (data.isStart) {
            state = sprites.STATE.MOVE;
        }
        scene.thingActors[data.thingId].stateFromServer(game, state);
    }
}

