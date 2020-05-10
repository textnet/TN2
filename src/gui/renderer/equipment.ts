import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import { reg } from "./setup"
import { createActor } from "./plane"
import * as equipment from "../../model/equipment"
import { ThingActor } from "../actors/thing"
import { PlaneActor } from "../actors/plane"

reg(msg.RENDER.EQUIP, (game: Game, data: msg.Equip)=>{
    if (!data.slotName || !data.thing.equipment || data.slotName == data.thing.equipment.default) {
        createActor(game, data.thing, data.ownerId);        
        const scene = game.gameScene();
        const owner = scene.actors[data.ownerId];
        updateEquipmentActor(owner)
    }
})

reg(msg.RENDER.UN_EQUIP, (game: Game, data: msg.UnEquip)=>{
    const scene = game.gameScene();
    const actor = scene.equipmentActors[data.thingId];
    if (actor) {
        actor.unequip();
        updateEquipmentActor(actor.getOwner())
    }
})

reg(msg.RENDER.EQUIPMENT, (game: Game, data: msg.Equipment)=>{
    const scene = game.gameScene();
    const actor = scene.actors[data.contents.ownerId] as ThingActor;
    if (actor) {
        actor.hideEquipment();
    } 
    const planeActor = new PlaneActor(data.contents);
    planeActor.bind(scene);
})


function updateEquipmentActor(owner: ThingActor) {
        if (owner && owner.equipmentActor) {
            owner.hideEquipment();
            interop.loadEquipment(this.data.id)    
        }
}