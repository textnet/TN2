# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron/Node prototype of the TXTNET.

## TODO and ISSUES
- Enter / Leave
    + attempt action
    + process enter attempt
    - surface action
    - WrittenWord support
        - attempt `attempt{action="enter", dir="up"}`, `enter{dir="up"}`
        - surface `surface{}`
- test limbo between two books
    - player goes offline while being in another book => disappears in limbo
    - player's book goes offline => player disappears in limbo
    - destination's book goes offline => player is transferred to limbo, create portal
    - destination's book goes online => (???)
    - player gets out of limbo, portal is lost.
- when teleporting, entering, or leaving, drop waypoints
- BUG: when leaving by Cmd+Q — disconnect everyone!

## Current Stage 11. Interbook and Limbo, also Enter/Leave
+ teleport command
+ observe thing
+ transfer events from the remote book to the local anima
+ `attempt` framework
+ enter/leave with WrittenWord support
- limbo portals
- test limbo-ing

## Stage 12. Control over things
- written movers
    - move_to
    - move_by (duration)
    - turn_to 
    - halt
- Push
- Pick / Putdown = inventory!
- Throw
- Update Properties
    - plane props: spawn, format
- Update Physics: Thing, Plane
    - get plane physics
- Update Constraints
- Update Colors
- Update Text
    - anima reboots when thing's text is changed (reacts on event of changing text)
- Seasonality events

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
11. [ ] Interbook operations and limbo, entering and leaving
12. [ ] Basic actions: run, push, updates (both GUI and Written Word)
13. [ ] Inventory concept and actions (incl. throw)
14. [ ] Text editor and kneeling
15. [ ] Physics: gravity, speed, friction, seasonality
16. [ ] Clean up and document
17. [ ] Design docs for `TN2 Release 1`

## Rough planning for Q2 and Q3
- April: GUI, limbo, basic actions (move, run, push, updates)
- May: Inventory, Text editor and menu
- June: Gravity and Seasonality 
- July: Documenting
- July/August/September: Release 1


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

    planes

    bind <consoleId>
    unbind
    gui <consoleId>
    observe <consoleId>

## Written Console
NB: After binding your terminal to a console you have Written Word interface.
You can still invoke regular commands prepended with `/`. E.g. `/exit`.

## Not supported commands
    destroy thing <id>
    add plane <name> to <thing>
    remove plane <name> from <thing>
