/*
 * Minimal setup: Player and Piano, and GUI
 */
export const setup = [

// Start up sequence of console commands
`
create book Indiana
offline Indiana
create thing Piano as Piano in Indiana @ 200 200
create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
online Indiana
gui P1
`
,
// Startup Written Word for the binded thing
`
`
];


