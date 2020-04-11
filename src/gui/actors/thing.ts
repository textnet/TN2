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
import * as interop from "../renderer/send"


/**
 * Excalibur Actor extension for Thing-based actors.
 */
export class ThingActor extends BaseActor {
    isPlayer: boolean;
    asObserver: boolean;
    needRelease: boolean;

    dir: geo.Direction;
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

    bindPlayer(asObserver: boolean) {
        this.isPlayer = true;
        this.asObserver = asObserver;
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
        if (this.isPlayer && !this.asObserver) {
            this.updateFromCommands(engine, delta)
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
        const wasIdle = this.visualState == sprites.STATE.IDLE;
        if (geo.isIdle(dir) && !wasIdle) {
            this.visualState = sprites.STATE.IDLE;
            interop.stopMoving();
        }
        if (!geo.isIdle(dir) && wasIdle) {
            this.visualState = sprites.STATE.MOVE;
            interop.startMoving();
        }
        if (this.visualDir != sprites.DIR[geo.directionName(dir)]) {
            this.visualDir   = sprites.DIR[geo.directionName(dir)];
        }
        // velocity
        const friction = (this.scene as GameScene).planeData.physics.friction;
        const velocity = (this.data.physics.speed /friction) * (delta /physics.TIME_MOMENTUM);
        this.vel.x = dir.dx * velocity;
        this.vel.y = dir.dy * velocity;
        this.dir = dir;
        this.repositionToServer(engine, delta);
    } 

    _delta: number;
    _pos: geo.Position;
    repositionToServer(engine: Game, delta: number) {
        this._delta = (this._delta || 0) + delta;
        if (this._delta > 10) {
            this._delta = 0;
            const pos = geo.position(this.body.pos.x, this.body.pos.y, this.dir);
            if (!this._pos || geo.distance(pos, this._pos) > 0) {
                interop.reposition(pos);
            }
            this._pos = pos;
        }
    }

    stateFromServer(engine: Game, visualState: string) {
        this.visualState = visualState;
    }
    repositionFromServer(engine: Game, position: geo.Position) {
        this._pos = position;
        this.body.pos.x = position.x;
        this.body.pos.y = position.y;
        this.visualDir = sprites.DIR[geo.directionName(position.direction)];
    }

}
