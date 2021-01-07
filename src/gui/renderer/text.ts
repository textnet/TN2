import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as sprites from "../../model/sprites"
import { reg } from "./setup"
import * as editor from "../editor"

reg(msg.RENDER.KNEEL, (game: Game, data: msg.Kneel)=>{
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        scene.thingActors[data.thingId].kneelDown();
    }
})

reg(msg.RENDER.STANDUP, (game: Game, data: msg.StandUp)=>{
    const scene = game.gameScene();
    if (!scene.thingActors) return;
    if (scene.thingActors[data.thingId]) {
        scene.thingActors[data.thingId].kneelUp();
    }
})


reg(msg.RENDER.TEXT, (game: Game, data: msg.UpdateText)=>{
    const scene = game.gameScene();
    if (!scene.editor || !scene.planeData) return;
    scene.planeData.text       = data.text;
    scene.planeData.textAnchor = data.anchor;
    editor.updateEditorContent(scene)
})
