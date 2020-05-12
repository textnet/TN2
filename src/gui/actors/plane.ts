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

/**
 * Excalibur Actor extension for Equipment-based actors.
 */
export class PlaneActor extends ex.Actor {
    scene: GameScene;
    contents: msg.EquipmentRenderData;
    pbox: geo.PositionedBox;
    scaleFactor: number;

    constructor(contents: msg.EquipmentRenderData) {
        super();
        this.contents = contents;
        this.scaleFactor =contents.plane.equipment.scale || 1;
        this.calculateBounds();
        this.width  = this.pbox.n[2] - this.pbox.n[0];
        this.height = this.pbox.n[3] - this.pbox.n[1];
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
            // add underlay
            const underlay = new ex.Actor(
                0, 0, this.width*this.scaleFactor, this.height*this.scaleFactor,
                toColor(this.contents.plane.colors[model.COLORS.EQUIPMENT] || model.COLORS_DEFAULT[model.COLORS.EQUIPMENT])
            )
            this.add(underlay)
            // add slots
            if (this.contents.slots) {
                for (let id in this.contents.slots) {
                    const actor = new SlotActor(this.contents.slots[id]);
                    actor.adjustScale(this.scaleFactor);
                    this.add(actor);
                }
            }
            // add things
            if (this.contents.things) {
                for (let id in this.contents.things) {
                    const actor = new SlotActor(this.contents.things[id]);
                    actor.adjustScale(this.scaleFactor);
                    this.add(actor);
                }
            }
            // link to the owner
            scene.add(this);
            owner.equipmentActor = this;
        }
    }
    
    calculateBounds() {
        const physics = this.contents.plane.physics;
        const result: geo.PositionedBox = {n:[]};
        if (physics.box.w) {
            result.n[0] = -physics.box.w/2;
            result.n[2] = +physics.box.w/2;
        } else {
            let min, max;
            for (let id in this.contents.slots) {
                const slot = this.contents.slots[id];
                const pBox = geo.positionedBox(slot.physics.box, slot.position);
                if (min === undefined || min > pBox.n[0]) min = pBox.n[0];
                if (max === undefined || max < pBox.n[2]) max = pBox.n[2];
            }
            result.n[0] = min;
            result.n[2] = max;
        }
        if (physics.box.h) {
            result.n[1] = -physics.box.h/2;
            result.n[3] = +physics.box.h/2;            
        } else {
            let min, max;
            for (let id in this.contents.slots) {
                const slot = this.contents.slots[id];
                const pBox = geo.positionedBox(slot.physics.box, slot.position);
                if (min === undefined || min > pBox.n[1]) min = pBox.n[1];
                if (max === undefined || max < pBox.n[3]) max = pBox.n[3];
            }
            result.n[1] = min;
            result.n[3] = max;
        }
        this.pbox = result;
    }

    onPostUpdate(engine: Game, delta: number) {
        const owner = this.getOwner();
        this.body.pos.x = owner.body.pos.x;
        this.setZIndex(100000000000) // TODO
    }

    fitInCamera(engine: Game, cameraFocus: ex.Vector, cameraBounds: ex.Vector) {
        const owner = this.getOwner();
        const focusDistance = cameraFocus.y - owner.body.pos.y;
        const maxFocusDistance = cameraBounds.y/2;
        const boxSize = this.height * this.scaleFactor;
        if (maxFocusDistance - focusDistance <= boxSize) {
            // down
            this.body.pos.y = owner.body.pos.y
                              +boxSize/2 
                              +owner.sprite.sprite.size.h/2;
        } else {
            // up
            this.body.pos.y = owner.body.pos.y
                              -boxSize/2 
                              -owner.sprite.sprite.size.h/2;
        }
    }
}
