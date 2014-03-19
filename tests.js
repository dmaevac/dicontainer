var
  tape = require('tape'),
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

var AccountService = (function () {
  function AccountService() {
    var _this = this;
    this._opts = {
      url: 'http://localhost'
    };
    this.$get = function (formatter) {
      _this.formatter = formatter;
      var service = {
        getUrl: _this.getUrl.bind(_this)
      };

      return service;
    };
  }

  AccountService.prototype.getUrl = function (stub) {
    return this._opts.url + stub;
  };

  AccountService.prototype.options = function (opts) {
    this._opts = opts;
  };

  AccountService.$inject = ['FormattingService'];

  return AccountService;
})();

var likes = { whatdoyoulike: 'cats' };

// cyclic services
function A(b) {
  this.b = b;
}
function B(a) {
  this.a = a;
}



tape('can create a container', function (t) {
  t.plan(1);
  var appContainer = new Container();
  t.ok(appContainer);
});

tape('can register and resolve an object', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('AnObject', likes);
  var o = appContainer.resolve('AnObject');
  t.equal(o.whatdoyoulike, 'cats');
});

tape('can register and resolve a function', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('Minus', function factory() {
    return function minus(a, b) {
      return a - b;
    }
  });
  var minus = appContainer.resolve('Minus');
  t.equal(minus(5, 3), 2);
});

tape('can register and resolve a service and its dependencies', function (t) {
  t.plan(2);
  var appContainer = new Container();
  appContainer.register('A', likes);
  appContainer.register('FormattingService', Formatter, ['A']);
  var formatter = appContainer.resolve('FormattingService');
  t.ok(formatter.injectedA);
  t.equal(formatter.injectedA, likes);
});

tape('can register and resolve a service and call its methods', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('FormattingService', Formatter);
  appContainer.register('MathService', MathService);
  var maths = appContainer.resolve('MathService');
  t.equal(maths.add(2, 5), 7);
});

tape('can register a service via angular style array registration', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('AnObject', likes);
  var C = ['AnObject', (function () {
    var s = function C(a) {
      this.a = a;
    };
    return s;
  }())];
  appContainer.register('ArrayBased', C);
  var arrayBased = appContainer.resolve('ArrayBased');
  t.equal(arrayBased.a.whatdoyoulike, 'cats');
});

tape('can register an angular style provider that has an instance config function', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('FormattingService', Formatter);
  appContainer.register('AccountService', AccountService, function (provider) {
    provider.options({ url: 'base' });
  });
  var as = appContainer.resolve('AccountService');
  t.equal(as.getUrl('food'), 'basefood');
});

tape('errors when registering services with circular dependencies', function (t) {
  t.plan(1);
  var appContainer = new Container();
  appContainer.register('A', A, ['B']);
  t.throws(appContainer.register.bind(appContainer, 'B', B, ['A']))
});