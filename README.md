# mobile-agent-platform

A JavaScript Mobile Agent Platform that allows an agent to migrate across a network. A "Supervisor" node dispatches the "Mobile Agent" which can then autonomously move between "Worker" nodes, carrying/transferring its state and methods to the new node.

Install:
`npm i mobile-agent-platform`

## Example Usage:
### Supervisor:

```javascript
const {Supervisor, Agent} = require('mobile-agent-platform');

const port = 3000

const supervisor = Supervisor("192.168.100.0", port);
let agent = Agent({
    supervisor,
    name: "Example Agent",
    nodePath: ['http://192.168.100.1:4000/agent', 'http://192.168.100.2:4000/agent', 'http://192.168.100.3:4000/agent'],
    main: (state, args) => {
        console.log(`${time}: Running ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);
    }
});

agent.move();
```

### Worker:

```javascript
const { Worker } = require('mobile-agent-platform');

let worker = Worker();
```