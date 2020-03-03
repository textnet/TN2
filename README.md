# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.


## Boilerplate
* [x] storage abstraction
* [x] basic Node: create/destroy naive planets
* [x] basic Node: create/destroy consoles (w/o binding)
* [ ] network layer for Planets
    - discovery: p2p and local
    - local planets: skip p2p
    - network planets
    - cross-planet messaging

## На чём остановился

- удалять планеты и консоли по одной
- при создании планеты запускать её
- при удалении планеты останавливать её
- отладочный вывод соединений планет

Что непонятно: что планета должна делать, когда к ней прилетает сообщение и т.п.

## Когда какая-то планета пропадает с горизонта
- нужно перевести в лимбо всех своих персонажей, которые гостили на этой планете!

## Когда какая-то планета появляется на горизонте
- нужно вывести из лимбо персонажей, которые были на этой планете ранее

## Когда надо посылать сообщения и кому?
- если на текущем плане есть персонаж с чужой планеты, то надо посылать в эту планету сообщения с этого плана.
- если планета недоступна, то ничего никуда посылать не нужно.



## Stages
1. Node stub
2. Planets on the node
3. Network of planets (discovery, online, offline)
5. Things (create, destroy) — with Planes
6. Consoles (create, destroy, connect, disconnect)
7. Text commands
8. Limbo
9. Anima
10. GUI


## Old things
    npm install   -- after cloning the repo
    ./start.sh    -- to enter the debug cycle
    yarn dist     -- to make distro package

