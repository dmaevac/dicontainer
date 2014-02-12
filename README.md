#dicontainer

Simple dependency container

- Handles resolution of dependencies
- Understands Angular.js providers/services (requires $inject syntax)
- Provides simple React.js Mixin for attaching services
- Pretty tiny

*TODO*

- Handle circular dependencies


###Basic Usage

####Setup

```
var Container = require('dicontainer');

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

Attaches service instances to a React class.

Service instances are attached to this.services

```
var Calculator = React.createClass({
	
	mixins: [appContainer.Mixin('MathService', 'OtherService')]

	render: function () {
		this.services.MathService.add()
	}
});
```
