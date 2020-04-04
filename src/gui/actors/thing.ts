/**
 * Thing Actor Module.
 * ----------------------
 * Every thing on the plane is rendered as a {ThingActor}.
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


/**
 * Excalibur Actor extension for Thing-based actors.
 */
export class ThingActor extends BaseActor {
    isPlayer: boolean;
    needRelease: boolean;

    visualDir:   string;
    visualState: string;

    _isMoving: boolean;

    constructor(data: msg.ThingRenderData) {
        super(data);
        this.isPlayer = false;
        this.scale = new ex.Vector(1,1);
        this.body.pos = new ex.Vector(data.position.x, data.position.y);
        this.body.collider.type = ex.CollisionType.Fixed;
        this.visualState = sprites.STATE.IDLE;
        this.visualDir = sprites.DIR[geo.directionName(data.position.direction)];
    }

    bindPlayer() {
        this.isPlayer = true;
        this.body.collider.type = ex.CollisionType.Active;
    }

    /**
     * Happens after main update once per frame.
     */
    onPostUpdate(engine: Game, delta: number) {
        // update from properties
        if (this.isPlayer) {
            this.body.collider.type = ex.CollisionType.Active;
        } else 
        if (this.data.constraints[ CONSTRAINTS.PASSABLE ]) { // simplified to make it a bit easier on the client
            this.body.collider.type = ex.CollisionType.PreventCollision;
        } else {
            this.body.collider.type = ex.CollisionType.Fixed;
        }
        // update position and issue commands
        if (this.isPlayer) {
            this.updateFromCommands(engine, delta)
            // TODO
            // interopSend.updateArtifactPosition(this);
        } 
        // switch sprites
        this.setDrawing(sprites.code(this.visualState, this.visualDir, sprites.ANIMATION.MAIN));

        // normalize and update 2.5D visualisation
        this.setZIndex(10000+this.pos.y)
    }

    /**
     * Update player's actor based on commands received (e.g. move, push, etc.)
     * @param {Game} engine
     */
    updateFromCommands(engine: Game, delta: number) {
        let dir: geo.Direction = deepCopy(geo.DIRECTION.NONE)
        if (this.isPlayer) { 
            // TODO kneeled
            if (this.needRelease && engine.input.keyboard.getKeys().length == 0) {
                this.needRelease = false;
            }
            if (!this.needRelease) {
                let playerDir = getPlayerDirection(engine);
                let command   = getPlayerCommand(engine);
                // PUSH
                if (command == COMMAND.PUSH && !geo.isIdle(playerDir)) {
                    this.needRelease = true;
                    geo.accumulateDirection(dir, playerDir);
                    // interopSend.push(this, playerDir); TODO send push
                } 
                // MOVE               
                if (command == COMMAND.NONE && !geo.isIdle(playerDir)) {
                    geo.accumulateDirection(dir, playerDir);
                }
            }
            let switchState = false;
            let switchDir   = false;
            if ((geo.isIdle(dir) && (this.visualState != sprites.STATE.IDLE)) ||
                (!geo.isIdle(dir) && (this.visualState == sprites.STATE.IDLE))) {
                switchState = true;
            }
            if (this.visualDir != sprites.DIR[geo.directionName(dir)]) {
                switchDir = true;
            }
            if (switchState || switchState) {
                this.visualDir = sprites.DIR[geo.directionName(dir)];
                this.visualState = geo.isIdle(dir) ? sprites.STATE.IDLE : sprites.STATE.MOVE;
            }
            // velocity
            const friction = (this.scene as GameScene).planeData.physics.friction;
            const velocity = (this.data.physics.speed /friction) * (delta /physics.TIME_MOMENTUM);
            this.vel.x = dir.dx * velocity;
            this.vel.y = dir.dy * velocity;
            console.log(this.data.physics.speed, physics.TIME_MOMENTUM)
            // console.log("pos", this.pos, "vel", this.vel,)

            // TODO start/stop moving
            // const _prevMoving = this._isMoving;
            // this. _isMoving = Math.abs(this.vel.x)+Math.abs(this.vel.y) > 0;
            // if (this.isMoving && !prevMoving) {
            //     interopSend.startMoving(this);
            // }
            // if (!this.isMoving && prevMoving) {
            //     interopSend.stopMoving(this);                
            // }
        }
    }    

}