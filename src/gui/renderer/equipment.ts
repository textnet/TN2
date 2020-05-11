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
        const scene = game.gameScene();
        const owner = scene.thingActors[data.ownerId];
        const showEquipment = owner.equipmentActor != undefined;
        owner.hideEquipment();
        createActor(game, data.thing, data.ownerId);        
        if (showEquipment) {
            interop.loadEquipment(owner.data.id);            
        }
    }
})

reg(msg.RENDER.UN_EQUIP, (game: Game, data: msg.UnEquip)=>{
    const scene = game.gameScene();
    const actor = scene.equipmentActors[data.thingId];
    if (actor) {
        const owner = actor.getOwner();
        const showEquipment = owner.equipmentActor != undefined;
        owner.hideEquipment();
        actor.unequip();
        if (showEquipment) {
            interop.loadEquipment(owner.data.id);            
        }
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


