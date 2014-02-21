var
  should = require('should'),
  Container = require('./index.js');

// Some services
function Formatter(a) {
  this.injectedA = a;
}
Formatter.prototype.datePad = function (s) {
  return (new Date()) + ': ' + s;
}

// mathservice
function MathService(formatter) {
  this.formatter = formatter;
}
MathService.prototype.add = function (a, b) {
  return a + b;
};
MathService.prototype.prettyAdd = function (a, b) {
  return this.formatter.datePad(this.add(a, b));
};
MathService.$inject = ['FormattingService'];

// ServiceProvider
function SPInject() {
  this.chips = "yum";
}
SPInject.prototype.$get = function (formatter) {
  return {
    getFoodDated: function () {
      return formatter.datePad(this.chips);
    },
    getFood: function () {
      return this.chips;
    }
  }
};
SPInject.prototype.config = function (opts) {
  this.chips = opts;
}
SPInject.$inject = ['FormattingService'];

function SPArray() {
  this.chips = "yum";
}
SPArray.prototype.$get = ['FormattingService', function (formatter) {
  return {
    getFoodDated: function () {
      return formatter.datePad(this.chips);
    },
    getFood: function () {
      return this.chips;
    }
  }
}];
SPArray.prototype.config = function (opts) {
  this.chips = opts;
}


// cyclic services
function A(b) {
  this.b = b;
}
function B(a) {
  this.a = a;
}

var C = ['AnObject', (function () {
  var s = function C(a) {
    this.a = a;
  };
  return s;
}())];

// the container
var appContainer = new Container();

// TODO: registrations with circular dependencies
appContainer.register('A', A);
//appContainer.register('B', B, ['A']);

// registration of a provider
appContainer.register('SPInject', SPInject, function (provider) {
  provider.config('yuck');
});
appContainer.register('SPArray', SPArray, function (provider) {
  provider.config('yay');
});

// registration of a class
appContainer.register('FormattingService', Formatter, ['A']);
appContainer.register('MathService', MathService);

// registration of a function
appContainer.register('Minus', function factory() {
  return function minus(a, b) {
    return a - b;
  }
});

// registration of an array based declaration
appContainer.register('ArrayBased', C);

// registration of an object
appContainer.register('AnObject', { whatdoyoulike: 'cats' });

var formatter = appContainer.resolve('FormattingService');
formatter.injectedA.should.be.ok;
formatter.injectedA.should.eql(new A());

var maths = appContainer.resolve('MathService');
maths.add(2, 5).should.eql(7);

var minus = appContainer.resolve('Minus');
minus(5, 3).should.eql(2);

var obj = appContainer.resolve('AnObject');
obj.whatdoyoulike.should.eql('cats');

var arrayBased = appContainer.resolve('ArrayBased');
arrayBased.a.should.be.ok;

var mixin = appContainer.Mixin('MathService');
mixin.services.MathService.add(2, 5).should.eql(7);

var spInjectprovided = appContainer.resolve('SPInject');
spInjectprovided.getFoodDated().should.be.ok;
spInjectprovided.getFood().should.eql('yuck');

var spArrayprovided = appContainer.resolve('SPArray');
spArrayprovided.getFoodDated().should.be.ok;
spArrayprovided.getFood().should.eql('yay');