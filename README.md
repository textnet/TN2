# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.

## Handling events
+ Written Anima: implement 
    + event handlers: on/off
    + timer event
    + make sure it is unsubscribable
+ Anima controller: handling events
- Proxy controller -> send events via network
- check that creation of things leads to events


## Up Next Implementation
- SPATIALS: place/fit, written getters
- Properties
- Move
- Enter / Leave
- Push
- Pick
- ....
- implement the rest of the WW library



## TODO: Document
- Each book is created from a default template
- Every other thing created from another thing inherits all its properties
- If there is no prototype thing, then it uses `Something`
- Supported commands and Written Word


## TODO: Operations between libraries
- anima reboots when thing's text is changed (reacts on event of changing text)
- peer book goes offline: move all my guests to limbo
- peer book goes online: move guests back
- send message: event happens on the plane where are guests from other book
+ send message: console/anima issues a command to my guest visiting another book



## Stages
1. (+) Library stub
2. (+) Naive Books in the Library
3. (+) Network of Books (discovery, online, offline)
5. (+) Things (create, destroy) — with Planes
6. (+) Text consoles (connect, disconnect)
7. (>) Text controls over things (A LOT OF WORK HERE: events, collisions, network communication)
8. Imagination Limbo (=off-book behaviour)
9. (>) Anima (written word)
10. GUI


## Old things
    npm install   -- after cloning the repo
    ./start.sh    -- to enter the debug cycle
    yarn dist     -- to make distro package

# Until found a way to split into to different builders
### Before launching Electron
    ./node_modules/.bin/electron-rebuild
### Before launching Headless


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
    copy thing <id> from <id> in <book>

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
