import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as sprites from "../../model/sprites"
import { reg } from "./setup"

reg(msg.RENDER.PLACE, (game: Game, data: msg.Place)=>{
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        scene.thingActors[data.thingId].repositionFromServer(game, data.position);
    }
})

reg(msg.RENDER.MOVE, (game: Game, data: msg.Move)=>{
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
})

