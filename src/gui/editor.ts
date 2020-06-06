/**
 * Module that holds all editor-related logic.
 * We use Ace9 as TextNet Editor.
 */
import * as jquery from "jquery";
import * as ex from "excalibur"
import * as ace from "brace"

import { ThingActor } from "./actors/thing"
import { Game, GameScene } from "./game"
import * as model from "../model/interfaces"
import { config } from "../config"

/**
 * We extend Ace9 Editor with a link to the player actor.
 * We'll use it to reposition the cursor/actor pair.
 */
export interface Editor extends ace.Editor {
    playerActor?: ThingActor;
}

/**
 * Updates editor's text from the scene's world data.
 * @param {GameScene} scene
 */
export function updateEditorContent(scene: GameScene) {
    if (!scene.editor) return;
    if (scene.editor.getValue() != scene.planeData.text) {
        scene.editor.setValue(scene.planeData.text, -1) 
    }
}

/**
 * Adjusts editor to the position of the camera — ensures it
 * scrolls together with player moving.
 * @param {Editor}    editor
 * @param {ex.Vector} focus (of the camera)
 */
export function adjustEditorFocus(editor: Editor, focus: ex.Vector) {
    const homeY   = config.gui.height/2 + config.gui.padding.vertical;
    const cameraY = focus.y;
    let distance = cameraY - homeY + config.gui.padding.vertical;
    if (distance - editor["renderer"].getScrollTop() != 0) {
        editor["renderer"].scrollToY(distance)
    }
}

// /**
//  * Positions the text cursor to closely match the position of the player.
//  * @param {Editor}        editor
//  * @param {ArtifactActor} actor
//  */
// export function positionCursor(editor: Editor, actor: ArtifactActor) {
//     const height = actor.pos.y + visualBounds.margin + visualBounds.top;
//     const width  = actor.pos.x - visualBounds.left;
//     const col = Math.floor( width / editorSettings.characterWidth ) -1;
//     const row = Math.floor( height/ editorSettings.lineHeight )
//     editor.moveCursorTo(row, col);
// }

// /**
//  * Calculates a position in the game World for the current text cursor.
//  * @param {Editor} editor
//  */
// export function positionFromCursor(editor: Editor) {
//     const cursor = editor.getCursorPosition()
//     const position: Position = {
//         x: (cursor.column+1) * editorSettings.characterWidth + visualBounds.left,
//         y: cursor.row        * editorSettings.lineHeight     - visualBounds.margin 
//                                                              - visualBounds.top,
//         dir: DIR.DOWN,
//     } 
//     return position;
// }

/**
 * Focuses the editor: positions its text cursor, makes game transparent, 
 * makes text editable, etc.
 * @param {ThingActor} actor
 */
export function focusEditor(actor: ThingActor) {
    const scene: GameScene = actor.scene as GameScene;
    // updateEditor(scene); // TODO
    const editor = scene.editor;
    // positionCursor(editor, actor); TODO
    editor.playerActor = actor;
    editor.setReadOnly(false);
    editor.setOption("showGutter", true);
    editor.renderer["$cursorLayer"].element.style.visibility = "visible"
    editor.focus();
    jquery("canvas").css({  opacity: 0.2 })
    jquery("#editor").css({ opacity: 1 })
    jquery("#editor").find(".ace_gutter").css({ opacity: 1 })
}

/**
 * Takes the focus from the editor, makes it readonly, make game visible, etc.
 * @param {Editor} editor
 */
export function blurEditor(editor) {
    editor.playerActor = null;
    editor.setReadOnly(true);
    editor.blur();
    jquery("canvas").css({  opacity: 1 })
    jquery("#editor").css({ opacity: 0.7, 
        // width: worldWidth+visualBounds.left+visualBounds.right, 
    })
    jquery("#editor").find(".ace_gutter").css({ opacity: 0 })
    editor.renderer.$cursorLayer.element.style.visibility = "hidden"
}

/**
 * Initialise the editor, create HTML wrappers, put CSS around, etc.
 * @param {Editor} editor
 */
export function initEditor(game: Game) {
    require('brace/theme/monokai');
    for (let language in model.FORMAT) {
        require('brace/mode/'+model.FORMAT[language]);
    }
    jquery("head").prepend([
        '<meta name="viewport" content="width=',
        config.gui.width,
        ', initial-scale=2">',
        ].join(""))
    jquery("body").prepend([
        "<div id=editor-wrapper>",
        "<div id=editor></div>",
        "</div>"
        ].join(""));
    customizeCSS();
    var editor: Editor = ace.edit('editor');
    editor.setFontSize(config.gui.editor.fontSize+"px");
    editor.setOption("printMargin", false);
    editor.setOption("fixedWidthGutter", true);
    editor.setOption("highlightActiveLine", false);
    editor.setOption("minLines", 10);
    editor.container.style.lineHeight = config.gui.editor.lineHeight+"px";
    editor.getSession().setUseWrapMode(true);
    editor.getSession().setTabSize(4);
    editor.getSession().setUseSoftTabs(true);
    function standup() {
        // TODO
        // const scene = game.gameScene()
        // const text = editor.getValue()
        // const x = 100;
        // const y = 100;
        // const pos = positionFromCursor(editor);
        // sendInterop.stand(editor.playerActor, text, pos)
        blurEditor(editor);
    }
    editor.commands.addCommand({
        name: "textnetStandup",
        bindKey: {win: 'Ctrl-Enter',  mac: 'Ctrl-Enter'},
        exec: standup,
        readOnly: false
    });
    editor.commands.addCommand({
        name: "textnetStandup2",
        bindKey: {win: 'Escape',  mac: 'Escape'},
        exec: standup,
        readOnly: false
    });
    editor.getSession().setMode('ace/mode/markdown');
    editor.setTheme('ace/theme/monokai');
    blurEditor(editor)
    return editor as Editor;
}

/**
 * Internal: stylize bare HTML with CSS. Called from `initEditor`
 */
function customizeCSS() {
    // jquery("body").css({ padding: 0, margin: 0, background:"#24251F" });
    jquery("#editor").css({
        zIndex: 1000,
        width: config.gui.width,
        left: 0,
        top: config.gui.planeTitle.height,
        bottom: 0,
        position:"absolute"
    })
    jquery("#wrapper").css({
        left:0, right:0, top: 0, bottom: 0,
        position: "absolute"
    })
    jquery("canvas").css({
        zIndex: 1000,
        position: "absolute",
    })
}