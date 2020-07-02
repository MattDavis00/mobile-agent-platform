# mobile-agent-platform

A JavaScript Mobile Agent Platform that allows an agent to migrate across a network. A `Supervisor` node dispatches the `Agent` which can then autonomously move between `Worker` nodes, carrying/transferring its state and methods to the new node.

Install:
`npm i mobile-agent-platform`

## Example Usage:
### Supervisor Node:

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
        //Output every second
        state.setInterval(() => {
            //Output to the Supervisor node console
            state.output(`Running ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);
        }, 1000)

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