#dicontainer

Simple dependency container (with React.js Mixin). Roughly aligns with Angular.js factories, services & providers.

###Basic Usage

####Setup

var Container = require('dicontainer');

```
var appContainer = new Container();
```

####Registration

container.register(name, factory);

```

function MathService(other) {}
MathService.prototype.add = function (a,b) { return a+b; };
MathService.$inject = ['OtherService']; 

appContainer.register('MathService', MathService); // Dependencies are read from $inject property

// --- or ----

function MathService(other) {}
MathService.prototype.add = function (a,b) { return a+b; };

appContainer.register('MathService', MathService, ['OtherService']); // Dependencies are specified

```

####Resolution

var instance = container.resolve(name);

```

var MathService = appContainer.resolve('MathService');
MathService.add(1,2);

```


###React.js Mixin