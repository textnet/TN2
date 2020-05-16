# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron/Node prototype of the TXTNET.

## Equipment Sprites
+ create sprites with specific inventory sizing/rendering
    + tent with its roll
    + heap of hay
+ render
    + replace sprite when in hands
    + replace sprite when in slots
+ equipment fitting
    + check on equip
    + check on transfer
    + pass customThingBox around fitting
+ autoscale property of a thing
    + always fit slots
    + scale sprite to fit it right there

+ make sure it works
    * equipment         (no slots, just pickup/putdow)
    * equipment_slots   (slots, no sprites)
    * equipment_scale   (fit in the slot)
    * equipment_sprites (show sprites in equipment, autopickup)
    * backpack          (autopickup in backpack pocket slots)
    * backpack_big      (autopickup in massive backpack)
- written word methods to adjust equipment params
- written methods to compose equipment slots (and things?)
- written slot equip

## ISSUES
- BUG: transfer up -- too many times -- exception
- BUG: transfer/loadPlane: equipped items are not visible   

## Stage 13. Inventory
+ EQUIP action
+ UN_EQUIP action
+ Visualisation
+ Equipment Slots
+ Equipment SHOW/HIDE
- Equipment Sprites
- USE action
- THROW action



## Stage 14. Text
- `get_text` and `get_line`
- Update Text
    - anima reboots when thing's text is changed (reacts on event of changing text)
- universal filter with callback
    - `filter(id, name, plane, slot, callback)` -- gets item from anywhere (async)
    - `filter_text(id, name, plane, slot, line, anchor)` -- gets text from that item


## Stage 15. Gravity, speed, friction, seasonality, misc
- Seasonality events
- Transfer of forces in the inventory
- render borders of small planes


## TODO: Document
- Each book is created from a default template
- Every other thing created from another thing inherits all its properties
- If there is no prototype thing, then it uses `Something`
- Supported commands and Written Word
- event roles: object, subject, host, observer
- NB: need to figure out position.z VS. physics.Z

## Stages
1. [x] Library stub
2. [x] Naive Books in the Library
3. [x] Network of Books (discovery, online, offline)
4. [x] Take a break.
5. [x] Things (create, destroy) — with Planes
6. [x] Text consoles (connect, disconnect)
7. [x] Imagination Limbo (=off-book behaviour)
8. [x] Anima basics (written word)
9. [x] Basic Controls in text console
10. [x] GUI and moving
11. [x] Interbook operations and limbo, entering and leaving
12. [x] Push action and basic updates (both GUI and Written Word)
13. [ ] Inventory concept and actions (incl. throw)
14. [ ] Text editor and kneeling
15. [ ] Physics: gravity, speed, friction, seasonality (show in the title first)
16. [ ] Clean up and document
17. [ ] Design docs for `TN2 Release 1`

## Rough planning for Q2 and Q3
+ April: GUI, limbo, basic actions (move, push), basic updates, start inventory
- May: Inventory
- June: Text editor and menu, Graphics, Documentation, Playtests, 
- July: Fixes, Gravity & Seasonality
- August/September: R1


## How to set things up
    npm install   -- after cloning the repo
    ./start.sh    -- to enter the debug cycle
    yarn dist     -- to make distro package
    yarn headless -- to start the headless console version

# Until found a way to split into to different builders
Because Electron node is not compatible with NPM node, there you have to rebuild it everytime you switch between electron and headless modes.

### Before launching Electron
    ./node_modules/.bin/electron-rebuild
### Before launching Headless
    npm rebuild

### Creating new actions
- subject to be refactored, way too many files have to be changed
- **Generic action**
    - behavior/actions/<action>.ts -> create new action handler
    - behavior/actions —> 1) add the above to handlers
    - behavior/actions —> 2) add ACTION.<action> constant
    - behavior/actions —> 3) add Action* interface
    - NB: you can't save things in actions, as action happens on a plane. You need to use **updates**
- **Call the action from GUI**
    - gui/messages.ts -> add SERVER.<action> so it will be called for the server
    - gui/renderer/send.ts -> create interop for sending the action to the server
    - gui/server/<action>.ts -> send action via Action API
    - gui/server/setup.ts -> add the <action>.ts module
    - gui/command.ts -> add COMMAND.<action> and the control combination for the action
    - gui/actors/thing.ts -> add handled of the above that calls the interop
- **Call the action from Written Word**
    - written/library/<action>.ts -> implement action as calling the generic action/update
    - written/library.ts -> connect with signature
- **Add events**
    - behaviour/events.ts -> add EVENT.<event> constant
    - behaviour/events.ts -> add Event<event> interface
    - behaviour/actions/<action.ts> -> fire up events

## Console commands supported
    exit
    network

    create book <id>
    destroy book <id>
    online <bookId>
    offline <bookId>
    books

    create console <id> <thingId>
    destroy console <id>
    consoles

    inspect <id> from <bookId>

    things
    things in <book>
    create thing <id>
    create thing <id> in <book>
    copy <id> from <id> in <book>

    create equipment for <thing>
    equipment of <thing> <slotName>
    create slot <name> as <template> in <thing> @ <x> <y>

    planes

    bind <consoleId>
    unbind
    gui <consoleId>
    observe <consoleId>

## Written Console
NB: After binding your terminal to a console you have Written Word interface.
You can still invoke regular commands prepended with `/`. E.g. `/exit`.

## GUI Controls
+ `Cursor keys` = move around
- `Shift+Enter` = push/touch; if picked up — throw
- `Alt+Enter`   = pick up / put down
+ `Ctrl+Cursor` = enter into a thing in the direction of cursor
+ `Ctrl+Esc`    = undo the above — get up one level of things
- `Ctrl+Enter`  = kneel to Written Word; or raise up
- `Shift+Alt+Enter` = pull (no plans to implement)
- `Ctrl+Space`  = start/stop flying (no plans to implement)

