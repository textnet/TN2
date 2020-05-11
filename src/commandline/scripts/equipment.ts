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
create console P1 Indiana.Player
-- observe Indiana.Chest
gui P1

create book Matrix
create thing Piano as Piano in Matrix @ 300 100
-- observe Matrix.Piano
`
,
// Startup Written Word for the binded thing
`
-- teleport{thing="Indiana.Player", to="Matrix"}
`
];


