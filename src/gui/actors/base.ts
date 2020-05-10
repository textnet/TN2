/**
 * Base Actor Module.
 */
import * as ex from "excalibur";

import { Game, GameScene } from "../game"
import { ThingSprite } from "../sprite"
import * as msg from "../messages"
import * as geo from "../../model/geometry"

/**
 * Base class holds connection between an Excalibur actor and an artifact.
 */
export class BaseActor extends ex.Actor {
    data: msg.ThingRenderData;
    sprite: ThingSprite;
    dir: geo.Direction;

    /**
     * Build an actor for the thing
     * @param {msg.ThingRenderData} data
     */
    constructor(data: msg.ThingRenderData) {
        super({
            pos: new ex.Vector(data.position.x, data.position.y),
            scale: new ex.Vector(0.75, 0.75),
            body: new ex.Body({
                collider: new ex.Collider({
                    type:   ex.CollisionType.Passive, 
                    shape:  ex.Shape.Box(data.physics.box.w, data.physics.box.h),
                    offset: new ex.Vector(data.physics.box.anchor.x, data.physics.box.anchor.y),
                })
            })
        });
        this.scale = new ex.Vector(1,1);
        this.data = data;
        this.sprite = new ThingSprite(data.sprite);
        this.opacity = 1;
        this.rotation = 0;
    }

    /**
     * Called before the first actor update.
     * Makes all animations ready.
     * @param {Game} engine
     */
    onInitialize(engine: Game) {
        if (!this.sprite.animations) {
            this.sprite.makeAnimations(engine)
        }
        for (let a in this.sprite.animations) {
            this.addDrawing(a, this.sprite.animations[a]);
        }
    }
}
