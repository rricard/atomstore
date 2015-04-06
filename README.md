# atomstore

[![Circle CI](https://circleci.com/gh/rricard/atomstore/tree/master.svg?style=svg)](https://circleci.com/gh/rricard/atomstore/tree/master)

The missing piece for an immutable flux application architecture

## Introduction

This piece of architecture is intended to be used with the [Facebook Flux's](https://github.com/facebook/flux) [own dispatcher](https://github.com/facebook/flux/blob/master/src/Dispatcher.js). It solves the problem of having a mutable store when using [Immutable.js](https://github.com/facebook/immutable-js).

`Atom` is a class behaving like [Clojure's Atoms](http://clojure.org/atoms) (but it's not thread-safe for now on threaded js environments). Its goal is to ensure that you can mutate safely your store and dereference immutable objects from it.

## Install

For now, you have to use browserify in order to import atomstore

```shell
$ npm install --save atomstore
```

## Usage

Let's take [this simple example from Facebook](https://facebook.github.io/flux/docs/dispatcher.html). Here's how to use atoms with it:

```js
var Dispatcher = require('flux').Dispatcher;
var Atom = require('atomstore').Atom;
var Immutable = require('immutable');

// Init dispatcher & stores
var flightDispatcher = new Dispatcher();
var CountryStore = new Atom({country: null});
var CityStore = new Atom({city: null});
var FlightPriceStore = new Atom({price: null});

// Define the swap function. In this example: a set key function for immutable maps.
// Keep in mind that you get an immutable object in the `this` and you have to return an another immutable
function assoc(k, v) {
  return this.set(k, v);
}

// Digest a country-update
// flightDispatcher.dispatch(Immutable.Map({
//   actionType: 'country-update',
//   selectedCountry: 'australia'
// }));
CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
  if (payload.get('actionType') === 'country-update') {
    CountryStore.swap(assoc, "city", payload.get('selectedCountry'));
  }
});

// Digest a city-update
// flightDispatcher.dispatch(Immutable.Map({
//   actionType: 'city-update',
//   selectedCity: 'paris'
// }));
CityStore.dispatchToken = flightDispatcher.register(function(payload) {
  if (payload.get('actionType') === 'city-update') {
    flightDispatcher.waitFor([CountryStore.dispatchToken]);
    CityStore.swap(assoc, "city", payload.get('selectedCity'));
  }
});

// Digest a city-update or country-update in order to upgrade the price
FlightPriceStore.dispatchToken = flightDispatcher.register(function(payload) {
  switch (payload.get('actionType')) {
    case 'country-update':
    case 'city-update':
      flightDispatcher.waitFor([CityStore.dispatchToken]);
      var newPrice = getFlightPriceStore(CountryStore.deref().get('country'),
                                         CityStore.deref().get('city'));
      FlightPriceStore.swap(assoc, "price", newPrice);
      break;
  }
});
```

It may seem more verbose at first but in the end you are able to ensure that your store is updated atomically as well as keeping your application completely immutable.

## Test & contribute

```shell
$ npm install
# Test the code, will auto-compile the es6
$ npm test
# Compile the es6 manually
$ gulp es6
```

PRs are welcome. You just need to provide tests with your code and make the CI pass !

## Author

[Robin Ricard](http://www.rricard.me)

## Licence

MIT
