#dicontainer

Tiny dependency container

- Handles resolution of dependencies
- Lazy instantiation (services arent created until they are needed)
- Understands Angular.js providers/services/factories/globals
- Provides simple React.js compatible Mixin for attaching services
- Tests for circular dependencies
- less than 1kb (gzipped)


###Basic Usage

####Setup

```
var Container = require('dicontainer');

var appContainer = new Container(logFunction /* optional */);
```

####Registration

`container.register(name, factory /* or service/provider */);`

```

function MathService(other) {}
MathService.prototype.add = function (a,b) { return a+b; };
MathService.$inject = ['OtherService']; 

appContainer.register('MathService', MathService); // Dependencies are read from $inject property

// --- or ----

function MathService(other) {}
MathService.prototype.add = function (a,b) { return a+b; };

appContainer.register('MathService', MathService, ['OtherService']); // Dependencies are specified as array

// --- or ----

function MathService(other) {}
MathService.prototype.add = function (a,b) { return a+b; };

appContainer.register('MathService', ['OtherService', MathService]); // Dependencies and service are specified as array

```

####Resolution

`var instance = container.resolve(name);`

```

var MathService = appContainer.resolve('MathService');
MathService.add(1,2);

```


####Mixin

Service instances are attached to this.services

```
var Calculator = React.createClass({
	
	mixins: [appContainer.Mixin('MathService', 'OtherService')]

	render: function () {
		this.services.MathService.add()
	}
});
```

####Building & testing

```
npm install // lint, test & compile dist
npm test // test in terminal
npm run test-local // run test in browser
```

