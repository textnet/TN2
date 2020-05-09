import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import { reg } from "./setup"
import { createActor } from "./plane"
import * as equipment from "../../model/equipment"

reg(msg.RENDER.EQUIP, (game: Game, data: msg.Equip)=>{
    createActor(game, data.thing, data.ownerId);    
})

reg(msg.RENDER.UN_EQUIP, (game: Game, data: msg.UnEquip)=>{
    const scene = game.gameScene();
    const actor = scene.equipmentActors[data.thingId];
    if (actor) {
        actor.unequip();
    }
})

