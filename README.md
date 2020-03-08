# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.


## Model: Things and Planes
* [x] document physics and sprite approaches
* [x] thing model with sprites and physics
* [x] plane model
* [x] thing templates
* [x] create Book-Thing and place it in the right place
* [ ] create thing command
* [ ] destroy thing command

## To think about

* how to setup planes in things? who owns that setup? book? how meta-players can change that?
    - 
* how to inherit gravity etc.? When placing a thing onto a plane — take properties of the thing above?
    * still, how do we start?
    * need special commands?

I need to implement many commands here
--------------------------------------
    see sources
    create thing <id>
    destroy thing <full-id>

    create plane <name> on <thingId>
    destroy plane <name> on <thingId>
    create thing <thingId> as <thingTemplate>
    copy thing <thingId> <newId>
    destroy thing <thingId>
    on <planetId> gravity <name> is (<x>,<y>,<z>) acceleration <number> minimal <mass>
    on <planetId> gravity <name> clear
    on <planetId> season <name> [clear]
    thing <thingId> has mass <name> <number>
    thing <thingId> has force <name> <number>
    thing <thingId> is called <name>
    thing <thingId> has box (<x>,<y>)
    thing <thingId> has <property> <value>
    thing <thingId> is [not] <property>



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
5. Things (create, destroy) — with Planes
6. Text consoles (connect, disconnect)
7. Text controls over things (A LOT OF WORK HERE: events, collisions, network communication)
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

