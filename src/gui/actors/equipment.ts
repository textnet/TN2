/**
 * Equipment Actor Module.
 * ----------------------
 * Everything what holds other actors is an {EquipmentActor}.
 */
import * as ex from "excalibur";

import { BaseActor                            } from "./base"
import { Game, GameScene                      } from "../game"
import { ThingSprite                          } from "../sprite"
import * as msg from "../messages"
import * as geo from "../../model/geometry"
import * as sprites from "../../model/sprites"
import * as physics from "../../model/physics"
import { CONSTRAINTS } from "../../model/interfaces"
import { getPlayerDirection, getPlayerCommand, COMMAND } from "../command"
import { deepCopy } from "../../utils"
import * as interop from "../renderer/send"

const SCALE = 0.5;
/**
 * Excalibur Actor extension for Equipment-based actors.
 */
export class EquipmentActor extends BaseActor {
    ownerId: string;
    scene: GameScene;

    constructor(data: msg.ThingRenderData) {
        super(data);
        this.opacity = 0.9;
        this.rotation = -Math.PI/16;
        this.scale = new ex.Vector(SCALE, SCALE);
    }

    getOwner() {
        return (this.scene as GameScene).thingActors[this.ownerId];
    }

    equip(ownerId: string, scene: GameScene) {
        this.scene = scene;
        this.ownerId = ownerId;
        const owner = this.getOwner();
        const ownerAnchor = owner.data.physics.box.anchor || {x:0, y:0}
        const thisAnchor = this.data.physics.box.anchor || {x:0, y:0};
        this.pos = new ex.Vector(
            // x
            owner.data.physics.box.w/2 + ownerAnchor.x
            +(this.data.physics.box.w/2 + thisAnchor.x)*this.scale.x,
            // y
            -owner.data.physics.box.w/2 + ownerAnchor.y
            -(this.data.physics.box.h/2 + thisAnchor.y)*this.scale.y,
            );
        owner.add(this);
    }

    onInitialize(engine: Game) {
        super.onInitialize(engine);
        // TODO equip sequence 'ease-in'
        this.setDrawing(sprites.code(sprites.STATE.EQUIPMENT, sprites.DIR.UP, sprites.ANIMATION.MAIN))        
    }

    unequip() {
        const owner = this.getOwner();
        if (owner) {
            // TODO unequip sequence 'ease-out'
            owner.remove(this);        
            this.ownerId = undefined;
        }
    }
}
