import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as sprites from "../../model/sprites"
import { reg } from "./setup"

const KNEEL_SCALE = 0.5

reg(msg.RENDER.KNEEL, (game: Game, data: msg.Kneel)=>{
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        // scale down
        scene.thingActors[data.thingId].scale.x = KNEEL_SCALE;
        scene.thingActors[data.thingId].scale.y = KNEEL_SCALE;
    }
})

reg(msg.RENDER.STANDUP, (game: Game, data: msg.StandUp)=>{
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        // regular scale
        scene.thingActors[data.thingId].scale.x = 1;
        scene.thingActors[data.thingId].scale.y = 1;
    }
})

