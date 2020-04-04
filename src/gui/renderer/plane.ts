import { config } from "../../config"
import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import * as ex from "excalibur"
import { ThingActor } from "../actors/thing"
import { COLORS, COLORS_DEFAULT } from "../../model/interfaces"



export function enterPlane(game: Game, data: msg.EnterPlane) {
    // 1. reset scene
    const oldScene = game.gameScene();
    if (oldScene) game.removeScene(oldScene);
    const scene = new GameScene(game);
    game.addScene(game.gameSceneName(), scene);
    game.goToScene(game.gameSceneName())
    // 2. populate actors
    scene.animaId = data.animaId;
    scene.things = data.things;
    for (let id in data.things) {
        const actor = new ThingActor(data.things[id]);
        if (id == scene.animaId) {
            actor.bindPlayer();
        }
        scene.add(actor);
    }
    // 3. create HUD
    const titleHeight = config.gui.planeTitle.height;
    const labelHeight = config.gui.planeTitle.fontSize;
    let title = new ex.UIActor();
    title.width = config.gui.width;
    title.height = titleHeight;
    let text = new ex.Label();
    text.fontFamily = config.gui.planeTitle.fontFamily;
    text.fontSize   = labelHeight;
    text.fontUnit = ex.FontUnit.Px;
    text.textAlign = ex.TextAlign.Center;
    text.pos.x = title.width /2;
    text.pos.y = (title.height+labelHeight)/2;
    title.add(text);
    scene.add(title);
    scene.environmentActors = {
        title: title,
        label:  text,
    }
    // 4. Editor
    // 5. Camera
    // 6. Go!
    updateSceneFromPlane(scene, data.plane);
    game.start();
}


function updateSceneFromPlane(scene: GameScene, data: msg.PlaneRenderData) {
    scene.planeData = data;
    const label = (scene.environmentActors["label"] as ex.Label);
    const title = (scene.environmentActors["title"] as ex.UIActor)
    label.text = data.name;
    label.color = ex.Color.fromHex(data.colors[COLORS.NAME] || COLORS_DEFAULT[COLORS.NAME]);
    title.color = ex.Color.fromHex(data.colors[COLORS.TITLE] || COLORS_DEFAULT[COLORS.TITLE]);
    // scene.editor.getSession().setMode('ace/mode/'+worldData.format);
}
