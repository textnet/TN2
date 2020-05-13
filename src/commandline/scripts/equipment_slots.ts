/*
 * Testing equip unequip
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
-- bind P1
gui P1
-- observe Indiana.Equipment
`
,
// Startup Written Word for the binded thing
`
equip{thing="Indiana.Chest1", owner="Indiana.Player", slot="Hands"}
-- equip{thing="Indiana.Chest2", owner="Indiana.Player"}
-- re_equip{owner_from="Indiana.Player", owner_to="Indiana.Player", slot_from="Body", slot_to="Head"}
-- putdown{direction="DOWN", slot="Body"}
`
];

`
equip{thing="Indiana.Chest1", owner="Indiana.Player", slot="Body"}
equip{thing="Indiana.Chest2", owner="Indiana.Player"}
re_equip{owner_from="Indiana.Player", owner_to="Indiana.Player", slot_from="Body", slot_to="Head"}
putdown{direction="DOWN", slot="Body"}
`

