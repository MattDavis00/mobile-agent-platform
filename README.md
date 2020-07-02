# mobile-agent-platform

A JavaScript Mobile Agent Platform that allows an agent to migrate across a network. A `Supervisor` node dispatches the `Agent` which can then autonomously move between `Worker` nodes, carrying/transferring its state and methods to the new node.

Install:
`npm i mobile-agent-platform`

## Example Usage:
### Supervisor Node:

```javascript
const {Supervisor, Agent} = require('mobile-agent-platform');

const port = 3000

const supervisor = Supervisor("192.168.100.0", port); //Create a new supervisor on this device

// Create a new Agent that prints which Worker it is running on and then moves itself onto the next in the path after 5 seconds.
let agent = Agent({
    supervisor,
    name: "Example Agent",
    nodePath: ['http://192.168.100.1:4000/agent', 'http://192.168.100.2:4000/agent', 'http://192.168.100.3:4000/agent'],
    main: (state, args) => {
        console.log(`${time}: Running ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);
        setTimeout(() => state.move(), 5000); //Move onto the next Worker after 5 seconds
    }
});

agent.move(); //Start the Agent
```

### Worker Nodes:

```javascript
const { Worker } = require('mobile-agent-platform');

let worker = Worker();
```

### Expected Output:

```
#node0: 16:01:30: Running Example Agent on node http://192.168.100.1:4000/agent with id 0
#node1: 16:01:35: Running Example Agent on node http://192.168.100.2:4000/agent with id 1
#node2: 16:01:40: Running Example Agent on node http://192.168.100.3:4000/agent with id 2
#node0: 16:01:45: Running Example Agent on node http://192.168.100.1:4000/agent with id 0
#node1: 16:01:50: Running Example Agent on node http://192.168.100.2:4000/agent with id 1
...
```