import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import { reg } from "./setup"
import { createActor } from "./plane"
import * as equipment from "../../model/equipment"
import { ThingActor } from "../actors/thing"
import { PlaneActor } from "../actors/plane"

reg(msg.RENDER.EQUIP, (game: Game, data: msg.Equip)=>{
    const scene = game.gameScene();
    const owner = scene.thingActors[data.ownerId];
    if (!data.slotName || !data.thing.equipment || data.slotName == data.thing.equipment.default) {
        createActor(game, data.thing, data.ownerId);
    }
    console.log("@@ EQUIP ",data, owner)
    if (owner.equipmentActor) {
        interop.loadEquipment(owner.data.id);
    }
})

reg(msg.RENDER.UN_EQUIP, (game: Game, data: msg.UnEquip)=>{
    const scene = game.gameScene();
    const actor = scene.equipmentActors[data.thingId];
    const owner = actor.getOwner();
    if (actor && owner) {
        actor.unequip();
        if (owner.equipmentActor) {
            interop.loadEquipment(owner.data.id);
        }
    }
})

reg(msg.RENDER.EQUIPMENT, (game: Game, data: msg.Equipment)=>{
    const scene = game.gameScene();
    const actor = scene.thingActors[data.contents.ownerId] as ThingActor;
    console.log("@@ EQUIPMENT", data)
    if (actor) {
        console.log("hide equip")
        actor.hideEquipment();
    } 
    const planeActor = new PlaneActor(data.contents);
    planeActor.bind(scene);
})


