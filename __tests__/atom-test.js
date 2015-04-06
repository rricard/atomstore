jest.dontMock('../dist/atomstore');
jest.dontMock('immutable');

var Atom = require('../dist/atomstore').Atom;
var Immutable = require('immutable');

describe("Atom", function() {
  it("should convert non-immutable constructions", function() {
    var map = {hello: "world"};
    var atom = new Atom(map);
    expect(atom.deref()).toEqual(Immutable.Map(map));
  });

  it("should keep immutable constructions", function() {
    var map = Immutable.Map({hello: "world"});
    var atom = new Atom(map);
    expect(atom.deref()).toBe(map);
  });

  it("should compare and set when the value matches", function() {
    var atom = new Atom({a: "b"});
    atom.compareAndSet(Immutable.Map({a: "b"}), {a: "c"});
    atom.compareAndSet(Immutable.Map({a: "c"}), {a: "d"});
    expect(atom.deref()).toEqual(Immutable.Map({a: "d"}));
  });

  it("should compare and set when the value does not match", function() {
    var atom = new Atom({a: "b"});
    atom.compareAndSet(Immutable.Map({a: "b"}), {a: "c"});
    atom.compareAndSet(Immutable.Map({a: "b"}), {a: "d"});
    expect(atom.deref()).toEqual(Immutable.Map({a: "c"}));
  });

  it("should swap as soon as possible", function() {
    function assoc(k, v) {
      return this.set(k, v);
    }
    var atom = new Atom({a: "b"});
    atom.swap(assoc, "b", "c");
    atom.swap(assoc, "c", "d");
    // Need to directly target entries in order to avoid issues with the owner id
    expect(atom.deref()._root.entries)
      .toEqual(Immutable.Map({a: "b", b: "c", c: "d"})._root.entries);
  });
});