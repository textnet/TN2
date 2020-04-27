import { config } from "../../config"
import { Game, GameScene, RadiusAroundActorStrategy } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import * as ex from "excalibur"
import { ThingActor } from "../actors/thing"
import { EquipmentActor } from "../actors/equipment"
import { COLORS, COLORS_DEFAULT } from "../../model/interfaces"
import { reg } from "./setup"

reg(msg.RENDER.ENTER, (game: Game, data: msg.Enter) => {
    const actor = createActor(game, data.thing);
    if (data.equipped) {
        const actorInHands = createActor(game, data.equipped, data.thing.id);
    }
})

reg(msg.RENDER.READY, (game: Game, data: msg.MessageReady) => {
    game.isReadyToPlay = true;
})

reg(msg.RENDER.ENTER_PLANE, (game: Game, data: msg.EnterPlane) => {
    // 1. reset scene
    const oldScene = game.gameScene();
    if (oldScene) game.removeScene(oldScene);
    const scene = new GameScene(game);
    game.addScene(game.gameSceneName(), scene);
    game.goToScene(game.gameSceneName())
    // 2. populate actors
    scene.animaId = data.animaThingId;
    scene.things = data.things;
    scene.thingActors = {}
    scene.equipmentActors = {}
    let playerActor;
    for (let id in data.things) {
        const actor = createActor(game, data.things[id])
        if (id == scene.animaId) {
            actor.bindPlayer(data.asObserver);
            playerActor = actor;
        }
    }
    // 2a. and their equipment
    for (let id in data.equipment) {
        const actor = createActor(game, data.equipment[id], id);
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
    scene.camera.addStrategy(
        new RadiusAroundActorStrategy(playerActor)
    );    
    // 6. Go!
    updateSceneFromPlane(scene, data.plane);
    game.start();
})




// --- helpers ---

export function createActor(game: Game, 
                     thing: msg.ThingRenderData,
                     equipmentOwnerid?: string) {
    const scene = game.gameScene();
    let actor;
    if (equipmentOwnerid) {
        actor = new EquipmentActor(thing);
        scene.equipmentActors[thing.id] = actor;
        actor.equip(equipmentOwnerid, scene);
    } else {
        actor = new ThingActor(thing);
        scene.thingActors[thing.id] = actor;
        scene.add(actor);
    }
    return actor;
}

function updateSceneFromPlane(scene: GameScene, data: msg.PlaneRenderData) {
    scene.planeData = data;
    const label = (scene.environmentActors["label"] as ex.Label);
    const title = (scene.environmentActors["title"] as ex.UIActor)
    label.text = `${data.id} «${data.name}»` // data.name;
    label.color = ex.Color.fromHex(data.colors[COLORS.NAME] || COLORS_DEFAULT[COLORS.NAME]);
    title.color = ex.Color.fromHex(data.colors[COLORS.TITLE] || COLORS_DEFAULT[COLORS.TITLE]);
    // scene.editor.getSession().setMode('ace/mode/'+worldData.format);
}

