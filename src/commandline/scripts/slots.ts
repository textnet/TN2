/*
 * Testing equip unequip
 */
export const setup = [

// Start up sequence of console commands
`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
create thing Chest as Chest in Indiana @ 200 100
create thing Player as Jones in Indiana @ 100 200

create equipment for Indiana.Player as Equipment
create slot Hands as Slot in Indiana.Player @ -48 11
create slot Offhand as Slot in Indiana.Player @ 48 11
create slot Head as Slot in Indiana.Player @ 0 -85
create slot Body as Slot in Indiana.Player @ 0 -13
create slot Legs as Slot in Indiana.Player @ 0 83
create slot Backpack as Slot in Indiana.Player @ -79 138
create slot Backpack as Slot in Indiana.Player @ -37 138
create slot Backpack as Slot in Indiana.Player @   5 138
create slot Backpack as Slot in Indiana.Player @  47 138

create console P1 Indiana.Player
gui P1
-- observe Indiana.Equipment
`
,
// Startup Written Word for the binded thing
`
-- teleport{thing="Indiana.Player", to="Matrix"}
`
];


