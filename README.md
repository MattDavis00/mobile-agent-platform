# mobile-agent-platform

A JavaScript Mobile Agent Platform that allows an agent to migrate across a network. A `Supervisor` node dispatches the `Agent` which can then autonomously move between `Worker` nodes, carrying/transferring its state and methods to the new node.

Install:
`npm i mobile-agent-platform`

## Example Usage:
### Supervisor Node:

The following example shows how to declare an `Agent` that will traverse across 5 nodes.
Upon executing on each node it will display a "Running" message, before moving to the next node after 2 seconds.

```javascript
const {Supervisor, Agent} = require('mobile-agent-platform');

const port = 3000

//Create a new supervisor that listens on http://192.168.100.0:3000
const supervisor = Supervisor("192.168.100.0", port);

// Creates a new agent that prints a message every second using state.output
let agent = Agent({
    supervisor,
    // A friendly name for the Agent
    name: "Example Agent",
    // The path that the agent will follow
    nodePath: [
        'http://192.168.100.1:4000/agent',
        'http://192.168.100.2:4000/agent',
        'http://192.168.100.3:4000/agent',
        'http://192.168.100.4:4000/agent',
        'http://192.168.100.5:4000/agent'
    ],
    // The main method that gets called when the Agent is initialized
    main: (state, args) => {
        //Output to the Supervisor node console
        state.output(`Running ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);

        //Move to the next node after 2 seconds
        state.setTimeout(() => state.move(), 2000);
    }
});

//Start the agent, moves to the first node.
agent.dispatch();
```

### Worker Nodes:

```javascript
const { Worker } = require('mobile-agent-platform');

//Create a new Worker node that listens on port 4000 by default.
//Can be changed using Worker(portNum)
//Will accept Agents trying to move to this Worker and will handle reinitializing the Agent.
let worker = Worker();
```

### Expected Output:

```
Supervisor listening at http://192.168.100.0:3000
Worker0 - 18:49:25 | Stopping Example Agent on node http://192.168.100.1:4000/agent with id 0
Worker0 - 18:49:26 | Running Example Agent on node http://192.168.100.1:4000/agent with id 0
Worker1 - 18:49:27 | Stopping Example Agent on node http://192.168.100.2:4000/agent with id 1
Worker1 - 18:49:28 | Running Example Agent on node http://192.168.100.2:4000/agent with id 1
Worker2 - 18:49:29 | Stopping Example Agent on node http://192.168.100.3:4000/agent with id 2
Worker2 - 18:49:30 | Running Example Agent on node http://192.168.100.3:4000/agent with id 2
Worker3 - 18:49:31 | Stopping Example Agent on node http://192.168.100.4:4000/agent with id 3
Worker3 - 18:49:32 | Running Example Agent on node http://192.168.100.4:4000/agent with id 3
Worker4 - 18:49:33 | Stopping Example Agent on node http://192.168.100.5:4000/agent with id 4
Worker4 - 18:49:34 | Running Example Agent on node http://192.168.100.5:4000/agent with id 4
Worker0 - 18:49:35 | Stopping Example Agent on node http://192.168.100.1:4000/agent with id 0
Worker0 - 18:49:36 | Running Example Agent on node http://192.168.100.1:4000/agent with id 0
Worker1 - 18:49:37 | Stopping Example Agent on node http://192.168.100.2:4000/agent with id 1
Worker1 - 18:49:38 | Running Example Agent on node http://192.168.100.2:4000/agent with id 1
Worker2 - 18:49:39 | Stopping Example Agent on node http://192.168.100.3:4000/agent with id 2
Worker2 - 18:49:40 | Running Example Agent on node http://192.168.100.3:4000/agent with id 2
......
Path is cyclic in nature by default
```

## Authentication:
The package makes use of JSON Web Tokens to verify that an `Agent` being received at a `Worker` node has not been tampered with, and is coming from a verified source.
For this to work, every node (including both `Supervisor` and `Worker` nodes) must have a shared `TOKEN_SECRET` environment variable.
Within the main directory of your project you must have a `.env` file containing the following.

`.env` file:
```
# We recommend choosing a strong secret for example:
TOKEN_SECRET:OFhvMqCBvh9XrkAbOKEjUmy3PW02jA9gOB8u3hAo0VVSsvQ0oNioeiiEiuJSyZWPRoI6ETa824p9HWr7W6T8XCL60jr9z2cSYH8YfJflaP15ea0YiKiHlSHmgD91L9Y0
```

## Persistent Store Example:

`state.declareStore({key: value, key: value, key: value})` can be used to declare a new variable that will persist across nodes.
`state.store.key` can be used to access and/or mutate these values once declared.

```javascript
let agent = Agent({
    supervisor,
    name: "Example Agent",
    // The path that the agent will follow
    nodePath: ['http://localhost:4000/agent', 'http://localhost:4001/agent', 'http://localhost:4002/agent', 'http://localhost:4003/agent', 'http://localhost:4004/agent'],
    main: (state, args) => {
        //Declare as many variables as you like
        //Will declare if the key is undefined, otherwise it will not mutate the value.
        state.declareStore({counter: 0, anotherVariable: "Another Value"});
        
        //Increment counter and output every second
        state.setInterval(() => {
            state.store.counter++;
            //Output to the Supervisor node console
            state.output(`Counter: ${state.store.counter}`);
        }, 1000)

        //Move to the next node after 2 seconds
        state.setTimeout(() => state.move(), 2000);
    }
});
```

```
Supervisor listening at http://localhost:3000
Supervisor - 20:12:31 | Dispatching Example Agent from supervisor node http://localhost:3000
Worker 0 - 20:12:32 | Counter: 1
Worker 0 - 20:12:33 | Stopping Example Agent on node http://localhost:4000/agent
Worker 1 - 20:12:34 | Counter: 2
Worker 1 - 20:12:35 | Stopping Example Agent on node http://localhost:4001/agent
Worker 2 - 20:12:36 | Counter: 3
Worker 2 - 20:12:37 | Stopping Example Agent on node http://localhost:4002/agent
```

## Adding Custom Methods:

Custom methods can be added by adding your method to the `methods` attribute like so.
That method can then be called by using `state.methods.NAME`.

```javascript
let agent = Agent({
    supervisor,
    name: "Old Name",
    nodePath: ['http://localhost:4000/agent', 'http://localhost:4001/agent', 'http://localhost:4002/agent', 'http://localhost:4003/agent', 'http://localhost:4004/agent'],
    main: (state, args) => {

        // Change the name to "New Name" when the agent has reached the 3rd node.
        if (state.currentNode === 2)
            state.methods.changeName(state, "New Name");
        
        // Print the Agent's current name.
        state.output(`The Agent's current name is ${state.name}`)
        
        //Move to the next node after 2 seconds
        state.setTimeout(() => state.move(), 2000);
    },
    methods: {
        changeName: function(state, newName) {
            state.name = newName;
        }
    }
});
```

### Expected Output:

```
Supervisor - 18:40:43 | Dispatching Old Name from supervisor node http://localhost:3000
Worker 0 - 18:40:43 | The Agent's current name is Old Name
Worker 0 - 18:40:45 | Stopping Old Name on node http://localhost:4000/agent
Worker 1 - 18:40:45 | The Agent's current name is Old Name
Worker 1 - 18:40:47 | Stopping Old Name on node http://localhost:4001/agent
Worker 2 - 18:40:47 | The Agent's current name is New Name
Worker 2 - 18:40:49 | Stopping New Name on node http://localhost:4002/agent
Worker 3 - 18:40:49 | The Agent's current name is New Name
Worker 3 - 18:40:51 | Stopping New Name on node http://localhost:4003/agent
Worker 4 - 18:40:51 | The Agent's current name is New Name
Worker 4 - 18:40:53 | Stopping New Name on node http://localhost:4004/agent
```

## Overriding Default Agent Methods:

If you wish to override some of the already implemented methods such as init or stop you can do so by passing these as attributes to the constructor.

### Example:
```javascript
let agent = Agent({
    supervisor,
    name: "Example Agent",
    nodePath: ['http://localhost:4000/agent', 'http://localhost:4001/agent', 'http://localhost:4002/agent', 'http://localhost:4003/agent', 'http://localhost:4004/agent'],
    main: (state, args) => {

        state.output("Ran main!");
        
        //Move to the next node after 2 seconds
        state.setTimeout(() => state.move(), 2000);
    },
    init: function(state, args) {
        state.output("Custom init....");
        state.main();
    }
});
```

### Expected Output:
```
Supervisor - 19:31:55 | Dispatching Example Agent from supervisor node http://localhost:3000
Worker 0 - 19:31:55 | Ran main!
Worker 0 - 19:31:55 | Custom init....
Worker 0 - 19:31:57 | Stopping Example Agent on node http://localhost:4000/agent
Worker 1 - 19:31:57 | Custom init....
Worker 1 - 19:31:57 | Ran main!
Worker 1 - 19:31:59 | Stopping Example Agent on node http://localhost:4001/agent
Worker 2 - 19:31:59 | Custom init....
Worker 2 - 19:31:59 | Ran main!
Worker 2 - 19:32:01 | Stopping Example Agent on node http://localhost:4002/agent
.....
Continues
```