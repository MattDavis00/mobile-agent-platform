# mobile-agent-platform

A JavaScript Mobile Agent Platform that allows an agent to migrate across a network. A `Supervisor` node dispatches the `Agent` which can then autonomously move between `Worker` nodes, carrying/transferring its state and methods to the new node.

Install:
`npm i mobile-agent-platform`

## Example Usage:
### Supervisor Node:

```javascript
const {Supervisor, Agent} = require('mobile-agent-platform');

const port = 3000

//Create a new supervisor that listens on http://localhost:3000
const supervisor = Supervisor("192.168.100.0", port);

// Creates a new agent that prints a message every second using the state.output method.
let agent = Agent({
    supervisor,
    name: "Example Agent",
    // The path that the agent will follow
    nodePath: [
        'http://192.168.100.1:4000/agent',
        'http://192.168.100.2:4000/agent',
        'http://192.168.100.3:4000/agent',
        'http://192.168.100.4:4000/agent',
        'http://192.168.100.5:4000/agent'
    ],
    main: (state, args) => {
        //Output every second
        state.setInterval(() => {
            //Output to the Supervisor node console
            state.output(`Running ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);
        }, 1000)

        //Move to the next node after 5 seconds
        state.setTimeout(() => state.move(), 5000);
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
//Will accept Agents trying to move to this Worker and will handle reinitialising the Agent.
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