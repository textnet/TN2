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
create thing Hay as Hay     in Indiana @ 225 100
create thing Tent as Tent   in Indiana @ 100 100

create thing Player as Jones in Indiana @ 100 200

create equipment for Indiana.Player as Equipment
create slot Backpack as Megaslot in Indiana.Player @ 0 11
equipment of Indiana.Player


create console P1 Indiana.Player
gui P1
`
,
// Startup Written Word for throttle(value: T)e binded thing
`
-- teleport{thing="Indiana.Player", to="Matrix"}
-- observe Indiana.Equipment
`
];


