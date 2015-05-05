"use strict";

import Immutable from "immutable";

export class Atom {
  /**
   * @constructor
   * Constructs a new Atom from an immutable object.
   * If the object is mutable, it will be converted automatically to an Immutable.js object.
   */
  constructor(immutableObject) {
    if(immutableObject instanceof Immutable.Iterable) {
      this._ref = immutableObject;
    } else {
      this._ref = Immutable.fromJS(immutableObject);
    }
    this._lock = false;
    this._listeners = Immutable.List([]);
  }

  /**
   * @return The referenced immutable structure
   */
  deref() {
    return this._ref;
  }

  /**
   * Adds a new change listener to the store
   * @param listener A callback function
   */
  addChangeListener(listener) {
    this._listeners = this._listeners.push(listener);
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
    if(this.deref().equals(oldval)) {
      if(newval instanceof Immutable.Iterable) {
        this._ref = newval;
      } else {
        this._ref = Immutable.fromJS(newval);
      }
      updated = true;
    }
    this._lock = false;
    this._listeners.forEach((listener) => {
      listener(this._ref);
    });
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
    var args = Array.prototype.slice.call(arguments, 1);
    // TODO: Make it better too
    while(!this.compareAndSet(this._ref, f.apply(this._ref, args))) {}
    return this._ref;
  }
}
