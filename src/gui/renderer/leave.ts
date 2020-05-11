import { Game, GameScene } from "../game"
import * as msg from "../messages"
import * as interop from "./send"
import { reg } from "./setup"

reg(msg.RENDER.LEAVE, (game: Game, data: msg.Leave)=>{
    // remove actor or ask for new plane
    const scene = game.gameScene();
    if (data.thingId == scene.animaId) {
        interop.loadPlane();
    } else {
        scene.thingActors[data.thingId].removeItself();
    }
})


