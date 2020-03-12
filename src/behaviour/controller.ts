import { EventEmitter } from 'events'
import { BookServer } from "../model/book"
import { ThingData, PlaneData, PLANE } from "../model/interfaces"
import * as actions from "./actions"
import * as events from "./events"
import * as updates from "./updates"
import * as cl from "../commandline/commandline"
import { Anima } from "../anima/anima"
import { getBookId } from "../model/identity"

export const CONTROLLER = {
    UNBOUND: true,
}

export class Controller {
    B: BookServer;
    actorId: string;
    emitter: EventEmitter;
    anima?: Anima;
    consoleId?: string;

    constructor(server: BookServer, thingId: string) {
        this.B = server;
        this.actorId = thingId;
        this.emitter = new EventEmitter();
    }

    async connectConsole(consoleId: string) {
        this.consoleId = consoleId;
    }

    async connectAnima(anima: Anima) {
        this.anima = anima;
    }

    async emit(event: events.Event) {
        const tids = {}
        tids[events.EVENT_ROLE.SUBJECT] = event.actorId;
        tids[events.EVENT_ROLE.OBJECT]  = event.thingId;
        if (event.planeId) {
            const hostPlane = await this.B.planes.load(event.planeId);
            tids[events.EVENT_ROLE.HOST] = hostPlane.ownerId;
        }        
        this.emitter.emit(event.event, {
            data: event,
            targetIds: tids
        })
        // if console -> somehow send to bound console.
        // if proxy   -> send via internet
    }
    on(name: string, listener) {
        this.emitter.on(name, listener);
    }
    off(name: string, listener) {
        this.emitter.off(name, listener);
    }
    
    async connect() {
        const thing = await this.B.things.load(this.actorId);
        if (thing.hostPlaneId == thing.planes[PLANE.LIMBO]) {
            let plane = await this.B.planes.load(thing.lostPlaneId);
            if (plane) {
                // 1. get out of limbo
                await actions.action(this.B, { 
                    action: actions.ACTION.LEAVE,
                    actorId: this.actorId,
                    thingId: this.actorId,
                    planeId: thing.hostPlaneId,
                } as actions.ActionLeave)
                // 2. move to new plane
                await actions.action(this.B, { 
                    action: actions.ACTION.ENTER,
                    actorId: this.actorId,
                    thingId: this.actorId,
                    planeId: plane.id,
                } as actions.ActionEnter)
            }            
        }
        await this.B.bind(this)
    }
    async disconnect(unbound?: boolean) {
        if (unbound != CONTROLLER.UNBOUND) { 
            await this.B.unbind(this);
        }
        const thing = await this.B.things.load(this.actorId);
        if (this.consoleId || getBookId(thing.hostPlaneId) != this.B.data.id) {
            // 1. get out of the plane
            await actions.action(this.B, { 
                action: actions.ACTION.LEAVE,
                actorId: this.actorId,
                thingId: this.actorId,
                planeId: thing.hostPlaneId,
            } as actions.ActionLeave)
            // 2. move to limbo
            await actions.action(this.B, { 
                action: actions.ACTION.ENTER,
                actorId: this.actorId,
                thingId: this.actorId,
                planeId: thing.planes[PLANE.LIMBO],
            } as actions.ActionEnter)
        }
    }
}

/*
    NOTE TO CHECK:
        - what happens when both books are online, but the console isn't: where does the thing resides?
        - is it possible -- when going offline -- to still leave on the table?
        - somehow need to cancel putting things on the plane which are marked as on other plane (ignore at some level?)
*/
/*



1. Книги общаются между собой
1.1. «Пришли мне предмет/план Х» (требует обязательного callback)
1.2. «Предмет Y с моего плана хочет выполнить действие Z» (сообщает команду, но не результат)
1.3. «На плане E, где есть твои предметы F,G,H, случилось событие Q» (одностороннее)
1.4. Даже когда всё действие происходит в одной книге, оно происходит через цепь событий

2. Команды отдают анимы и консоли через контроллер
2.1. Контроллер существует в runtime.
2.2. Контроллер анимы создаётся в момент оживления
2.3. Контроллер консоли создаётся в момент выхода консоли в онлайн
2.3.1. В момент открытия окна GUI
2.3.2. В момент команды bind текстовой консоли headless
2.4. Контроллер имеет два интерфейса ввода команд
2.4.1. Written Word интерфейс для анимы и текстовой консоли
2.4.2. Bespoke интерфейс для графического контроллера (оптимизация)

3. События всегда происходят на плане
3.1. Из-за чьих-то действий (анимы или консоли)
3.1.1. Предмет, находящийся на этом плане
3.1.2. Предмет-владелец плана
3.2. Из-за действий физических сил (гравитации и времени)
3.2.1. Генератор времени находится в каждой книге
3.2.2. Генератор сезонности находится на каждом плане
3.2.3. Генератор гравитации находится на каждом плане




Как реализовывать?

- Опиши все команды и события как конфигурацию (DSL интерфейсов)
- Ввод команд в консоли
- Преобразование Written Word -> команда 
– Книга А посылает команду
– Книга Б принимает команду
– Книга Б обрабатывает команду
...
– Книга Б порождает событие
– Книга Б отправляет событие
– Книга А принимает событие
- Преобразование Событие -> Written
- Вывод в консоль
...
– Книга А генерирует время и раздаёт его всем анимам
– Книга А генерирует время и воздействует временем на все объекты с ненулевой скоростью или ускорением
    - только в том случае, если эти события кто-то получит
    - на плане должны присутствовать анимы или консоли
– Книга А генерирует событие смены сезона и воздействует гравитацией на все объекты с ненулевой массой
    - только в том случае, если эти события кто-то получит
    - на плане должны присутствовать анимы или консоли


Квант времени внутри книги
==========================
Для каждой консоли/анимы в гостях
    На плане, на котором они находятся
        Для каждого объекта с ненулевой массой: установить скорость/ускорение
        Для каждого объекта с заданной траекторией: вычислить вектор скорости/ускорения
        Для каждого объекта с ненулевой скоростью: передвинуть
Для каждой собственной анимы: выдать время


План реализации
===============
1. Напиши загрузку через сеть и проверь её (через командную строку — усложни inspect)
3. bind/unbind в командной строке
4. Напиши базовый контроллер
5. Подними written-anima
6. Свяжи консоль и written-anima
2. Опиши все команды и события как конфигурацию DSL
7. Начни реализовывать команды и события
8. Реализуй подписку на события для аним и консолей
9. Убедись, что written-anima полностью функциональна внутри предметов
10. Реализуй время
11. Реализуй физику: столкновения, скорость, ускорение, гравитацию
12. Физически-обусловленные события
13. Движение по траектории




Что такое анима?
================
= анима — это среда для запуска Written Word или любого другого языка
- written-anima - Lua Environment

Как работает контроллер
=======================
- контроллер принимает команды
- контроллер привязан к предмету
- контроллер перезапускается всегда, когда у предмета меняется явным образом текст
- контроллер разбирает текст и вычленяет из него Written Word и другие языки
- контроллер создаёт среду для запуска Written Word (и также для других языков)
- контроллер создаёт аниму (определённого типа: e.g. Written Word) и загружает в неё код.
- контроллер принимает подписку на события от анимы
- контроллер обращается к аниме, когда приходит событие

Где связь с консолью
====================
- когда консоль выходит в онлайн, контроллер создаёт аниму для неё (если не было раньше)
- текстовая консоль говорит команды через аниму
- графическая консоль общается с контроллером более прямо — сразу в DSL-формате









*/