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
import * as msg from "./messages"
import * as utils from "../utils"
import * as interop from "./renderer/send"


/**
 * We extend Ace9 Editor with a link to the player actor.
 * We'll use it to reposition the cursor/actor pair.
 */
export interface Editor extends ace.Editor {
    playerActor?: ThingActor;
    focusVector?: ex.Vector;
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
    adjustEditorFocus(scene.editor, scene.editor.focusVector, scene.planeData);
}

/**
 * Adjusts editor to the position of the camera — ensures it
 * scrolls together with player moving.
 * @param {Editor}    editor
 * @param {ex.Vector} focus (of the camera)
 */
export function adjustEditorFocus(editor: Editor, focus: ex.Vector, 
                                  planeData: msg.PlaneRenderData) {
    const homeY   = config.gui.height/2 + config.gui.padding.vertical;
    if (!focus) {
        focus = new ex.Vector(0,0);
    }
    editor.focusVector = new ex.Vector(focus.x, focus.y);
    let distance = focus.y // where camera should look
                   -planeData.textAnchor.y // shift if the text starts not from 0
                   -homeY // shift up to compensate the camera position in the center
                   +config.gui.padding.vertical // compensate for being shifted
    if (distance - editor["renderer"].getScrollTop() != 0) {
        editor["renderer"].scrollToY(distance)
    }
}

/**
 * Positions the text cursor to closely match the position of the player.
 * @param {Editor}     editor
 * @param {ThingActor} actor
 */
export function positionCursor(editor: Editor, actor: ThingActor, 
                               planeData: msg.PlaneRenderData) {
    const scene = actor.scene as GameScene;
    const homeY   = config.gui.height/2 
                    +config.gui.padding.vertical;
    let distance = editor.focusVector.y // where camera should look
                   -planeData.textAnchor.y // shift if the text starts not from 0
                   -homeY // shift up to compensate the camera position in the center
                   +config.gui.padding.vertical // compensate for being shifted
    let shift = 0;
    if (distance < 0) {
        // add lines to the top
        const rows = Math.ceil(-distance / config.gui.editor.lineHeight)+5
        const difference = rows * config.gui.editor.lineHeight
        planeData.textAnchor.y -= difference;
        const r = [];
        for (let i=0; i<rows; i++) {
            r.push("\n")
        }
        r.push(planeData.text);
        planeData.text = r.join("");
        editor["renderer"].scrollToY(distance - difference);
        shift = difference;
        distance = distance - difference;
        updateEditorContent(scene);
        adjustEditorFocus(editor, editor.focusVector, planeData);
    }    
    
    // @@ TODO add spaces
    const left = actor.pos.x
                 -scene.camera.pos.x
                 +config.gui.width/2;
    //
    const top  = actor.pos.y 
                 -scene.camera.pos.y 
                 +config.gui.height/2 
                 +config.gui.planeTitle.height
    //
    let c = editor.renderer.screenToTextCoordinates(left, top);
    let backTop = editor.renderer.textToScreenCoordinates(c["row"], c["column"])
    let bottomLineCount = Math.floor((top-backTop.pageY)/config.gui.editor.lineHeight)+5;
    if (bottomLineCount > 0) {
        const r = [];
        for (let i=0; i<bottomLineCount; i++) {
            r.push("\n")
        }
        scene.planeData.text += r.join("");
        updateEditorContent(scene)
        adjustEditorFocus(editor, editor.focusVector, planeData);
        c = editor.renderer.screenToTextCoordinates(left, top);
    }
    editor.moveCursorTo(c["row"], c["column"]);
}

/**
 * Focuses the editor: positions its text cursor, makes game transparent, 
 * makes text editable, etc.
 * @param {ThingActor} actor
 */
export function focusEditor(actor: ThingActor) {
    const scene: GameScene = actor.scene as GameScene;
    updateEditorContent(scene);
    const editor = scene.editor;
    positionCursor(editor, actor, scene.planeData);
    editor.playerActor = actor;
    editor.setReadOnly(false);
    editor.setOption("showGutter", true);
    editor.renderer["$cursorLayer"].element.style.visibility = "visible"
    editor.focus();
    jquery("canvas").css({  opacity: 0.2 })
    jquery("#editor").css({ opacity: 1 })
    jquery("#editor").find(".ace_gutter").css({ opacity: 1 })
    jquery("#editor").find(".ace_scrollbar").css({ overflow: "hidden" })
}

/**
 * Takes the focus from the editor, makes it readonly, make game visible, etc.
 * @param {Editor} editor
 */
export function blurEditor(editor) {
    if (editor.playerActor) {
        editor.playerActor.kneelUp()
        editor.playerActor = null;
    }
    editor.setReadOnly(true);
    editor.blur();
    jquery("canvas").css({  opacity: 1 })
    jquery("#editor").css({ opacity: 0.7, });
    jquery("#editor").find(".ace_gutter").css({ opacity: 0 })
    jquery("#editor").find(".ace_scrollbar").css({ overflow: "hidden" })
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
        const scene = game.gameScene()
        const text = editor.getValue()
        const anchor = scene.planeData.textAnchor;
        interop.standUp(text, anchor)
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
    jquery("#editor").css({
        zIndex: 1000,
        width: config.gui.width,
        left: 0,
        top: config.gui.planeTitle.height,
        height: config.gui.height - config.gui.planeTitle.height,
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