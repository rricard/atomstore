"use strict";

import { Iterable, fromJS } from "immutable";

export class AtomStore {
  /**
   * @constructor
   * Constructs a new AtomStore from an immutable object.
   * If the object is mutable, it will be converted automatically to an Immutable.js object.
   */
  constructor(immutableObject) {
    if(immutableObject instanceof Iterable) {
      this._ref = immutableObject;
    } else {
      this._ref = fromJS(immutableObject);
    }
    this._lock = false;
  }

  /**
   * @return The referenced immutable structure
   */
  deref() {
    return this._ref;
  }

  /**
   * Atomically sets the value of atom to newval if and only if the current value of the atom is identical to oldval.
   * @param oldval The expected current value of the atom
   * @param newval The targeted value of the atom
   * @return The success of the operation
   */
  compareAndSet(oldval, newval) {
    // Really bad mutex implementation (multithreaded node.js won't work, but this may not happen)
    // TODO: do something better
    while(this._lock) {}
    this._lock = true;

    var updated = false;
    if(this.deref() === oldval) {
      if(newval instanceof Iterable) {
        this._ref = newval;
      } else {
        this._ref = fromJS(newval);
      }
      updated = true;
    }
    this._lock = false;
    return updated;
  }

  /*
   * Atomically swaps the value of atom to be: f.apply(currentValueOfAtom, args)
   * Note that f may be called multiple times, and thus should be free of side effects.
   * @param f The pure function to apply on the swap
   * @param *args The other expected args to apply on the swap
   * @return The swapped new value
   */
  swap(f) {
    while(!this.compareAndSet(this._ref, f.apply(this._ref, arguments))) {}
    return this._ref;
  }
}
