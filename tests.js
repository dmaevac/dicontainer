var Container = require('./index.js');


function Formatter() {}
Formatter.prototype.datePad = function (s) { return (new Date()) + ': ' + s; }

function MathService(formatter) { this.formatter = formatter; }
MathService.prototype.add = function (a,b) { return this.formatter.datePad(a+b); };
MathService.$inject = ['FormattingService'];


var appContainer = new Container();
appContainer.register('FormattingService', Formatter);
appContainer.register('MathService', MathService);


var maths = appContainer.resolve('MathService');
maths.add(2,5);
