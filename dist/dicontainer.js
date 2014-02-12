if (typeof exports === 'object' && typeof define !== 'function') {
  var define = function (factory) {
    factory(require, exports, module);
  };
}
define(function (require, exports, module) {

  var _isArray = Array.isArray || function(obj) {
    return toString.call(obj) === "[object Array]";
  };

  function _isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  function _construct(constructor, args) {
    function F() {
      return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
  }

  function _provide(registration) {
    var
      len, instance,
      i = 0, args = [],
      deps = registration.dependencies,
      factory = registration.factory;
    if (deps && (len = deps.length)) {
      for (; i < len; i++) {
        args.push(this.resolve(deps[i]));
      }
    }
    instance = !_isFunction(factory)
      ? factory : (factory.apply(null, args) || _construct(factory, args));

    return instance.$get ? instance.$get.apply(instance, args) : instance;
  };

//  -- API --

  function Container(mixinPropName) {
    this._instances = {};
    this._factories = {};
    this._mixinPropName = mixinPropName || 'services';
  }

  Container.prototype.register = function register(name, factory, dependencies) {
    if (name in this._factories) {
      console.warn(name + ' already registered in container');
    } else {
      if (_isArray(factory)) {
        dependencies = factory;
        factory = dependencies.pop();
      }
      this._factories[name] = {
        factory: factory,
        dependencies: dependencies || factory.$inject || []
      };
    }
  };

  Container.prototype.resolve = function resolve(name) {
    if (name in this._instances) {
      return this._instances[name];
    } else if (name in this._factories) {
      return this._instances[name] = _provide.call(this, this._factories[name]);
    } else {
      throw new Error(name + ' is not registered in container');
    }
  };

  Container.prototype.Mixin = function () {
    var
      deps = arguments || [], len = deps.length,
      container = this;
    return {
      componentWillMount: function () {
        var i = 0, prop;
        if (!!this[container._mixinPropName]) {
          return console.warn('Unable to mixin, "' + container._mixinPropName + '" property already exists on class');
        }
        this[container._mixinPropName] = prop = {};
        for (; i < len; i++) {
          prop[deps[i]] = container.resolve(deps[i]);
        }
      }
    }
  };

  module['exports'] = Container;
});
