/**
 * Slot Actor Module.
 * ----------------------
 * If there is an equipment plane, we draw slots.
 */
import * as ex from "excalibur";

import { BaseActor } from "./base"
import { PlaneActor } from "./plane"
import { Game } from "../game"

/**
 * Excalibur Actor extension for Slot-based actors.
 */
export class SlotActor extends BaseActor {


    adjustScale(factor: number) {
        const _scale = this.scale;
        this.body.pos.x = this.body.pos.x * factor / _scale.x;
        this.body.pos.y = this.body.pos.y * factor / _scale.y;
        this.scale = new ex.Vector(factor, factor);
    }
}
