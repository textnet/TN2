# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron/Node prototype of the TXTNET.

## Stage 14: Text editor and Kneeling
+ show text editor again
+ non-empty book
+ scroll as I go down.
+ make sure Written Word doesn't break
- kneel — enter the text
- unkneel — get back
- rebuild anima on kneeling
- actions to store text (also partials)
- `get_text` and `get_line`
- reposition cursor
- move sample text from the default book into a script
- horizontal scrolling

- universal filter with callback
    - `filter(id, name, plane, slot, callback)` -- gets item from anywhere (async)
    - `filter_text(id, name, plane, slot, line, anchor)` -- gets text from that item


## Finalizing things

- command do load a thing by url
- written word for ^



## Other things
- Seasonality events
- Transfer of forces in the inventory
- render borders of small planes
- Written methods to create and copy things, incl. slots


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
13. [x] Inventory concept and actions (incl. use)
14. [ ] Text editor and kneeling
15. [ ] Clean up and document; make graphics
16. [ ] Design docs for `TN2 Release 1`
17. [ ] Playtesting and fixes
18. [ ] Physics: gravity, speed, friction, seasonality (show in the title first)

## Rough release planning
- June: Minimal menu, Graphics, Documentation
- July: Playtests, Fixes
- August: Playtests, Fixes, Seasonality
- September: R1


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
+ `Shift+Enter` = push/touch; if picked up — use
+ `Alt+Enter`   = pick up / put down
+ `Ctrl+Cursor` = enter into a thing in the direction of cursor
+ `Ctrl+Esc`    = undo the above — get up one level of things
- `Ctrl+Enter`  = kneel to Written Word; or raise up

No plans to implement in first releases

- `Shift+Alt+Enter` = pull
- `Ctrl+Space`  = start/stop flying



------------------------------------------------------------
Loading things by URL