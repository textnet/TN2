/*
 * Testing backpack slotting
 */
export const setup = [

// Start up sequence of console commands
`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
create thing Chest1 as Chest in Indiana @ 200 100
create thing Chest2 as Chest in Indiana @ 200 100
create thing Chest3 as Chest in Indiana @ 200 100
create thing Chest4 as Chest in Indiana @ 200 100
create thing Chest5 as Chest in Indiana @ 200 100
create thing Player as Jones in Indiana @ 100 200

create equipment for Indiana.Player as Equipment
create slot Hands as Slot in Indiana.Player @ -48 11
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


