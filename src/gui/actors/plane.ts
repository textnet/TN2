/**
 * Plane Actor Module.
 * ----------------------
 * When you want to show a content of a plane as an Actor.
 */
import * as ex from "excalibur";

import { BaseActor                            } from "./base"
import { SlotActor                            } from "./slot"
import { Game, GameScene                      } from "../game"
import { ThingSprite                          } from "../sprite"
import * as model from "../../model/interfaces"
import * as msg from "../messages"
import * as geo from "../../model/geometry"
import * as sprites from "../../model/sprites"
import * as physics from "../../model/physics"
import { CONSTRAINTS } from "../../model/interfaces"
import { getPlayerDirection, getPlayerCommand, COMMAND } from "../command"
import { deepCopy } from "../../utils"
import * as interop from "../renderer/send"
import { toColor } from "../renderer/plane"


export const SCALE = 0.5;
/**
 * Excalibur Actor extension for Equipment-based actors.
 */
export class PlaneActor extends ex.Actor {
    scene: GameScene;
    contents: msg.EquipmentRenderData;

    constructor(contents: msg.EquipmentRenderData) {
        super({
            color: toColor(contents.plane.colors[model.COLORS.EQUIPMENT] || model.COLORS_DEFAULT[model.COLORS.EQUIPMENT])
        });
        this.scale = new ex.Vector(SCALE, SCALE)
        this.contents = contents;
    }

    getOwner() {
        return (this.scene as GameScene).thingActors[this.contents.ownerId];
    }

    bind(scene: GameScene) {
        this.scene = scene;
        const owner = this.getOwner();
        if (owner) {
            // prep the plane
            const plane = this.contents.plane;
            const bounds = this.calculateBounds()
            this.width  = bounds.w;
            this.height = bounds.h;
            // add slots
            if (this.contents.slots) {
                for (let id in this.contents.slots) {
                    const slotActor = new SlotActor(this.contents.slots[id]);
                    this.add(slotActor);
                }
            }
            // add things
            if (this.contents.things) {
                for (let id in this.contents.things) {
                    const thingActor = new SlotActor(this.contents.things[id]);
                    this.add(thingActor);
                }
            }
            // link to the owner
            owner.add(this);
            owner.equipmentActor = this;
        }
    }
    
    calculateBounds() {
        const result: geo.Box = { w: this.contents.plane.physics.box.w, h:this.contents.plane.physics.box.h }
        if (!result.w) {
            let min, max;
            for (let id in this.contents.slots) {
                const slot = this.contents.slots[id];
                const pBox = geo.positionedBox(slot.physics.box, slot.position);
                if (min === undefined || min > pBox.n[0]) min = pBox.n[0];
                if (max === undefined || max < pBox.n[2]) max = pBox.n[2];
            }
            result.w = max-min;
        }
        if (!result.h) {
            let min, max;
            for (let id in this.contents.slots) {
                const slot = this.contents.slots[id];
                const pBox = geo.positionedBox(slot.physics.box, slot.position);
                if (min === undefined || min > pBox.n[1]) min = pBox.n[1];
                if (max === undefined || max < pBox.n[3]) max = pBox.n[3];
            }
            result.h = max-min;
        }
        return result;
    }

    fitInCamera(engine: Game, cameraFocus: ex.Vector, cameraBounds: ex.Vector) {
        const owner = this.getOwner();
        const focusDistance = cameraFocus.y - owner.body.pos.y;
        const maxFocusDistance = cameraBounds.y/2;
        const boxSize = this.height*SCALE;
        if (maxFocusDistance - focusDistance <= boxSize) {
            // down
            this.body.pos.y = +this.height/2 *SCALE
                              +owner.sprite.sprite.size.h/2;
        } else {
            // up
            this.body.pos.y = -this.height/2 *SCALE
                              -owner.sprite.sprite.size.h/2;
        }
    }
}
