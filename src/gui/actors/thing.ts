/**
 * Thing Actor Module.
 * ----------------------
 * Every thing on the plane is rendered as a {ThingActor}.
 */
import * as ex from "excalibur";

import { BaseActor                            } from "./base"
import { PlaneActor                           } from "./plane"
import { Game, GameScene                      } from "../game"
import { ThingSprite                          } from "../sprite"
import * as msg from "../messages"
import * as geo from "../../model/geometry"
import * as sprites from "../../model/sprites"
import * as physics from "../../model/physics"
import { CONSTRAINTS } from "../../model/interfaces"
import { getPlayerDirection, getPlayerCommand, COMMAND } from "../command"
import * as commands from "../command"
import { deepCopy } from "../../utils"
import * as interop from "../renderer/send"
import * as editor from "../editor"

const GUI_VELOCITY = 75; // more = faster

/**
 * Excalibur Actor extension for Thing-based actors.
 */
export class ThingActor extends BaseActor {
    isPlayer: boolean;
    isKneeled: boolean;
    asObserver: boolean;
    needRelease: boolean;

    dir: geo.Direction;
    visualDir:   string;
    visualState: string;

    equipmentActor: PlaneActor;

    _isMoving: boolean;

    constructor(data: msg.ThingRenderData) {
        super(data);
        this.scale = new ex.Vector(1,1);
        this.isPlayer = false;
        this.isKneeled = false;
        this.body.pos = new ex.Vector(data.position.x, data.position.y);
        this.visualState = sprites.STATE.IDLE;
        this.visualDir = sprites.DIR[geo.directionName(data.position.direction)];
        this.needRelease = false;
        this.setPassable();
    }

    bindPlayer(asObserver: boolean) {
        this.isPlayer = true;
        this.asObserver = asObserver;
        this.setPassable();
        // interop.loadEquipment(this.data.id);
    }

    setPassable() {
        // update from properties
        if (this.isPlayer && !this.asObserver) {
            this.body.collider.type = ex.CollisionType.Active;
        } else 
        if (this.data.constraints[ CONSTRAINTS.PASSABLE ]) { // simplified to make it a bit easier on the client
            this.body.collider.type = ex.CollisionType.PreventCollision;
        } else {
            this.body.collider.type = ex.CollisionType.Fixed;
        }
    }

    /**
     * Happens after main update once per frame.
     */
    onPostUpdate(engine: Game, delta: number) {
        this.setPassable();
        // update position and issue commands
        if (this.isPlayer && !this.asObserver) {
            this.updateFromCommands(engine, delta)
        } 
        // switch sprites
        this.setDrawing(sprites.code(this.visualState, this.visualDir, sprites.ANIMATION.MAIN));    

        // normalize and update 2.5D visualisation
        this.setZIndex(this.data.position.z * 1000000 
                       + this.pos.y 
                       + this.data.physics.box.h/2 + this.data.physics.box.anchor.y);
    }

    hideEquipment() {
        if (this.equipmentActor) {
            this.scene.remove(this.equipmentActor);
            this.equipmentActor = undefined;
        }        
    }
    removeItself() {
        this.hideEquipment();
        super.removeItself();
    }

    /**
     * Update player's actor based on commands received (e.g. move, push, etc.)
     * @param {Game} engine
     */
    updateFromCommands(engine: Game, delta: number) {
        let dir: geo.Direction = deepCopy(geo.DIRECTION.NONE)
        // TODO kneeled
        if (this.needRelease) {
            this.needRelease = false;
        }
        else {
        // if (!this.needRelease) {
            let playerDir = getPlayerDirection(engine);
            let command   = getPlayerCommand(engine);
            let isIdle    = geo.isIdle(playerDir)
            if (!isIdle && command == COMMAND.WAIT) {
                this.needRelease = true;
            } else {
                // SHOW/HIDE EQUIPMENT
                if (command == COMMAND.EQUIPMENT && isIdle) {
                    if (this.equipmentActor) {
                        this.hideEquipment();    
                    } else {
                        interop.loadEquipment(this.data.id)
                    }
                }
                // ENTER -> DEEPER
                if (command == COMMAND.ENTER && !isIdle) {
                    this.needRelease = true;
                    interop.attempt(msg.ATTEMPT.ENTER, playerDir);
                }
                // LEAVE -> TRANSFER UP
                if (command == COMMAND.LEAVE && isIdle) {
                    interop.transferUp();
                }
                // KNEEL
                if (command == COMMAND.KNEEL) {
                    this.needRelease = true;
                    this.isKneeled = true;
                    editor.focusEditor(this);
                }
                // PICKUP
                if ((command == COMMAND.PICKUP) && !isIdle) {
                    this.needRelease = true;
                    interop.attempt(msg.ATTEMPT.PICKUP, playerDir);
                } 
                // PUSH
                if (command == COMMAND.PUSH && !isIdle) {
                    // geo.accumulateDirection(dir, playerDir);
                    interop.attempt(msg.ATTEMPT.PUSH, playerDir);
                } 
                // MOVE               
                if (command == COMMAND.NONE && !isIdle) {
                    geo.accumulateDirection(dir, playerDir);
                }                
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
        this.visualDir = sprites.DIR[geo.directionName(dir)];
        // velocity
        const velocity = GUI_VELOCITY * physics.velocity(this.data.physics, (this.scene as GameScene).planeData.physics, delta);
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
        if (!this.sprite.sprite.hasDiagonals && sprites.isDiagonal(position.direction)) {
            this.visualDir = sprites.straightenDiagonalName(position.direction);
        } else {
            this.visualDir = sprites.DIR[geo.directionName(position.direction)];            
        }

    }

}
