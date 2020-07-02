const express = require('express');

function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
}

function stopAll(state) {
    state.agents.forEach((agent) => {
        agent.stop();
    });
}

function Worker(port = 4000) {
    let worker = {
        app: express(),
        agents: [],
        stopAll: () => stopAll(worker),
    };

    const app = worker.app;
    const agents = worker.agents;

    app.get('/', (req, res) => res.send(`Worker listening at http://localhost:${port}`));

    app.listen(port, () => console.log(`Worker listening at http://localhost:${port}`));

    // Parse body of request as a JSON object.
    app.use(express.json());
    
    app.post('/agent', (req, res) => {
        const data = req.body;

        const token = data.token;
        const payload = deserialize(data.payload);

        agents.push(payload);

        console.log(data.payload)
        console.log(payload)

        // TODO: Verifiy integrity of payload and that it came from a known source.
        const agent = agents[agents.length - 1];
        agent.init(agent);

    })

    return worker;
}

module.exports = Worker;