# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.


## Anima and Written Word
+ create anima wrapper
    + when book is going online, try to create new animas
    + bind animas with controllers
    - make anima capable of rebooting
- gently move lua api
- empty library
- implement getters
- implement event handlers: on/off, timer event
- create special permanent anima for the commandline console


## More on controllers
- Anima controller: handling events
- Proxy controller -> send events via network


## Up Next
- Properties
- Move
- Enter / Leave
- Push
- Pick
- ....
- SPATIALS: place/fit


## TODO: Document
- Book is created from a default template
- Every other thing created from another thing inherits all its properties
- There is a stub template to make life easier (not)



## TODO: Operations between libraries
- peer book goes offline: move all my guests to limbo
- peer book goes online: move guests back
- send message: event happens on the plane where are guests from other book
- send message: console/anima issues a command to my guest visiting another book



## Stages
1. (+) Library stub
2. (+) Naive Books in the Library
3. (+) Network of Books (discovery, online, offline)
5. (+) Things (create, destroy) — with Planes
6. (+) Text consoles (connect, disconnect)
7. (>) Text controls over things (A LOT OF WORK HERE: events, collisions, network communication)
8. Imagination Limbo (=off-book behaviour)
9. Anima (written word)
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

## Not supported commands
    destroy thing <id>
    add plane <name> to <thing>
    remove plane <name> from <thing>
