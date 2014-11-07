(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return (root.Container = factory());
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Container = factory();
  }
}(this, function(exports, b) {

  var _isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]";
  };

  function _noop() {}

  function _isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  function _construct(constructor, args) {
    function F() {
      return constructor.apply(this, args);
    }

    F.prototype = constructor.prototype;
    return new F();
  }

  function _validate(name, registration) {
    var i = 0,
      dep, deps = registration.dependencies,
      len;
    if (deps && (len = deps.length)) {
      for (; i < len; i++) {
        if ((dep = this._factories[deps[i]]) && !!~dep.dependencies.indexOf(name)) {
          throw new Error(name + ' registration failed because of circular dependency with "' + deps[i] + '"');
        }
      }
    }
  }

  function _provide(registration) {
    var
      len, instance, providedInstance,
      i = 0,
      args = [],
      deps = registration.dependencies,
      cfg = registration.configure,
      factory = registration.factory;

    if (deps && (len = deps.length)) {
      for (; i < len; i++) {
        args.push(this.resolve(deps[i]));
      }
    }

    instance = !_isFunction(factory) ? factory : (factory.apply(null, args) || _construct(factory, args));

    if (instance.$get) {
      cfg(instance);
      providedInstance = instance.$get.apply(instance, args);
    }

    return providedInstance || instance;
  }

  function Container(log) {
    this._instances = {};
    this._factories = {};
    this._log = (log || _noop).bind(null, 'di');
  }

  Container.prototype.register = function register(name, factory, dependencies, configure) {
    if (name in this._factories) {
      console.warn(name + ' already registered in container');
    } else {
      if (_isArray(factory)) {
        dependencies = factory;
        factory = dependencies.pop();
      }
      if (_isFunction(dependencies)) {
        configure = dependencies;
        dependencies = null;
      }
      var registration = {
        factory: factory,
        configure: configure || _noop,
        dependencies: dependencies || factory.$inject || []
      };
      _validate.call(this, name, registration);
      this._factories[name] = registration;
      this._log('register', name);
    }
  };

  Container.prototype.resolve = function resolve(name) {
    if (name in this._instances) {
      this._log('resolve', name);
      return this._instances[name];
    } else if (name in this._factories) {
      this._log('provide', name);
      return (this._instances[name] = _provide.call(this, this._factories[name]));
    } else {
      throw new Error(name + ' is not registered in container');
    }
  };

  Container.prototype.Mixin = function() {
    var
      deps = arguments || [],
      mixin = {
        services: {}
      };

    for (var i = 0, len = deps.length; i < len; i++) {
      mixin.services[deps[i]] = this.resolve(deps[i]);
    }
    return mixin;
  };

  return Container;

}));