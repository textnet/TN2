# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron/Node prototype of the TXTNET.


## TODO / ISSUES
+ excalibur collisions
- send data from renderer to gui console 
- bookserver collision
- book sprite


## Stage 10. GUI
- pass commands to the console
- collisions
- accept events of moving things around
- test physics


## Stage 11. Control over things
- written movers
    - move_to
    - move_by (duration)
    - turn_to 
    - halt
- Enter / Leave (add WW support)
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
1. (+) Library stub
2. (+) Naive Books in the Library
3. (+) Network of Books (discovery, online, offline)
5. (+) Things (create, destroy) — with Planes
6. (+) Text consoles (connect, disconnect)
7. (+) Imagination Limbo (=off-book behaviour)
8. (+) Anima basics (written word)
9. (+) Basic Controls over things (A LOT OF WORK HERE: actions, events, collisions)
10. (>) GUI
11. Proceed to controll all things

## Rough planning for Q2
- April: basic GUI and events
- May: Inventory, Text editor and menu
- June: Seasonality 
- June/July: polishing & documenting


## Old things
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

## Written Console
NB: After binding your terminal to a console you have Written Word interface.
You can still invoke regular commands prepended with `/`. E.g. `/exit`.

## Not supported commands
    destroy thing <id>
    add plane <name> to <thing>
    remove plane <name> from <thing>
