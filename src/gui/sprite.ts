/** 
 * Module for sprite rendering.
 * Uses `sprite` part of the Artifact structure to create Excalibur sprites.
 */

import * as ex from 'excalibur';
import { b64toBlob         } from "../utils"
import { Game              } from "./game"
import * as msg from "./messages"
import * as sprites from "../model/sprites"
import * as interop from "./renderer/send"


/**
 * Helper class that embed all animations generated for the artifact.
 */
export class ThingSprite {
    sprite: sprites.Sprite;

    sheet: ex.SpriteSheet;
    animations: Record<string, ex.Animation>;

    /**
     * Build the helper from the artifact.
     */
    constructor(sprite: sprites.Sprite) {
        let that = this;
        this.sprite = sprite;

        if (sprite.base64) {
            if (!sprite.mapping) {
                sprite.mapping = {};
                sprite.mapping[ sprites.code() ] = [0];
            }
            let rows = 0;
            for (let code in sprite.mapping) {
                if (sprite.mapping[code][0] > rows) {
                    rows = sprite.mapping[code][0];
                }
            }                
            rows +=1;
            const steps = this.sprite.steps || 1;
            let mainTexture = new ex.Texture("");
            mainTexture.setData(b64toBlob(this.sprite.base64, "image/png"))
            mainTexture.load()
            this.sheet = new ex.SpriteSheet(mainTexture, steps, rows, this.sprite.size.w, this.sprite.size.h);
        } else {
            // TODO backfill!
            interop.log("No visual sprite ready!", this.sprite)
        }
    }

    /**
     * Make all animations out of the sprite structure.
     * Used internally, don't call separately!
     */
    makeAnimations(engine: ex.Engine) {
        // create all animations
        this.animations = {};
        // 'state-direction-animation'
        for (let state in sprites.STATE) {
            for (let dir in sprites.DIR) {
                for (let animation in sprites.ANIMATION) {
                    const _code = sprites.code(sprites.STATE[state], sprites.DIR[dir], sprites.ANIMATION[animation]);
                    let code = _code;
                    if (!this.sprite.mapping[code] && animation != sprites.ANIMATION.MAIN) {
                        continue;
                    }
                    if (!this.sprite.mapping[code] && animation == sprites.ANIMATION.MAIN) {
                        code = sprites.code(sprites.STATE[state])
                        if (!this.sprite.mapping[code]) {
                            code = sprites.code();
                        }
                    }
                    if (!this.animations[code]) {
                        const row   = this.sprite.mapping[code]? this.sprite.mapping[code][0] : 0;
                        const steps = (this.sprite.mapping[code]? this.sprite.mapping[code][1] : undefined) || this.sprite.steps;
                        const startIndex = row*this.sprite.steps;
                        const endIndex = startIndex + steps;
                        this.animations[code] = this.sheet.getAnimationBetween(engine, startIndex, endIndex, sprites.SPEED);                        
                    }
                    this.animations[_code] = this.animations[code];
                }
            }
        }      
    }

    /**
     * Get Excalibur-format animation by the states.
     * @param {string} code - e.g. 'state-direction-animation'
     */
    animation(code:string) {
        return this.animations[code];
    }

}

