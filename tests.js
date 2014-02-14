var
  should = require('should'),
  Container = require('./dist/dicontainer.min.js');

// Some services
function Formatter(a) {
  this.injectedA = a;
}
Formatter.prototype.datePad = function (s) {
  return (new Date()) + ': ' + s;
}

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


function A(b) {
  this.b = b;
}
function B(a) {
  this.a = a;
}

var C = ['AnObject', (function() { var s = function C(a) { this.a = a; }; return s; }())];

// the container
var appContainer = new Container();

// TODO: registrations with circular dependencies
appContainer.register('A', A);
//appContainer.register('B', B, ['A']);


// registration of a class
appContainer.register('FormattingService', Formatter, ['A']);
appContainer.register('MathService', MathService);

// registration of a function
appContainer.register('Minus', function factory() { return function minus(a,b) { return a-b; } } );

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
minus(5,3).should.eql(2);

var obj = appContainer.resolve('AnObject');
obj.whatdoyoulike.should.eql('cats');

var arrayBased = appContainer.resolve('ArrayBased');
arrayBased.a.should.be.ok;

var mixin = appContainer.Mixin('MathService');
mixin.services.MathService.add(2, 5).should.eql(7);