import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import * as ex from "excalibur"
import { ThingActor } from "../actors/thing"
import { COLORS, COLORS_DEFAULT } from "../../model/interfaces"


export function place(game: Game, data: msg.Place) {
    const scene = game.gameScene();
    if (scene.thingActors[data.thingId]) {
        scene.thingActors[data.thingId].repositionFromServer(game, data.position);
        return;
    }
}

