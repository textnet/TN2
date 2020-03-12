/**
 * Written Word: Events
 *
 * Provides support for subscribing on events.
 */

import { WrittenAnima    } from "../detect"
import { FengariMap      } from "../api"
import { supportedEvents } from "../library"
import { EVENT, EVENT_ROLE } from "../../../behaviour/events"

/**
 * Subscribe on event happening to a particular thing.
 * Read more about events in the Written Word documentation.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - event (default is "timer")
 *    - role  (default is "object")
 *    - handler function <- this is the reason why FengariMap is used here.
 * @returns {string} key to unsubscribe
 */
export function event_on(A: WrittenAnima, 
                         params: FengariMap) {
    const thingId = params.has("thing") ? params.get("thing")["id"] : undefined;
    const role    = params.has("role")  ? params.get("role")        : EVENT_ROLE.OBJECT;
    let event     = params.has("event") ? params.get("event")       : EVENT.TIMER;
    if (supportedEvents.indexOf(event) < 0) {
        event = EVENT.TIMER;
    }
    if (params.has("handler")) {
        const key = A.subscribe(thingId, event, role, params.get("handler"));
        return key;
    } else {
        return false;
    }
}


/**
 * Remove subscription for an event.
 * @param {WrittenAnima} A
 * @optional @param {object} thing
 * @optional @param {string} event
 * @optional @param {string} role
 * @optional @param {string}    key @see event_on()
 */
export function event_off( A: WrittenAnima, 
                           thing?: object, 
                           event?: string, role?: string, key?: string ) {
    const thingId = thing ? thing["id"] : undefined;
    event = event || EVENT.TIMER;
    role  = role  || EVENT_ROLE.OBJECT;
    if (key) {
        A.unsubscribe(thingId, event, role, key);
        return true;
    } else {
        return false;
    }
}

