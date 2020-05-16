/*
 * Testing equipment-specific sprites
 */
export const setup = [

// Start up sequence of console commands
`
create book Indiana

create thing Chest as Chest in Indiana @ 300 100
create thing Hay as Hay     in Indiana @ 225 100
create thing Tent as Tent   in Indiana @ 100 100

create thing Player as Jones in Indiana @ 15 25

create equipment for Indiana.Player as Equipment
create slot Hands as Slot in Indiana.Player @ -48 11
create slot Offhand as Slot in Indiana.Player @ 48 11
create slot Head as Slot in Indiana.Player @ 0 -85
create slot Body as Slot in Indiana.Player @ 0 -13
create slot Legs as Slot in Indiana.Player @ 0 83
create slot Pocket as Slot in Indiana.Player @ -79 138
create slot Pocket as Slot in Indiana.Player @ -37 138
create slot Pocket as Slot in Indiana.Player @   5 138
create slot Pocket as Slot in Indiana.Player @  47 138
equipment of Indiana.Player

create console P1 Indiana.Player
gui P1
`
,
// Startup Written Word for the binded thing
`
-- teleport{thing="Indiana.Player", to="Matrix"}
`
];


