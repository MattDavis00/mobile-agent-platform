const express = require('express');
const axios = require('axios');
const serialize = require('serialize-javascript');
const jwt = require('jsonwebtoken');
require('dotenv').config()

function deserialize(serializedJavascript){
    return eval('(' + serializedJavascript + ')');
}

function stopAll(state) {
    state.agents.forEach((agent) => {
        agent.stop();
    });
}

function Worker
    ({
        port = 4000,
        dependencies = {}
    }) {

    let worker = {
        app: express(),
        port,
        agents: [],
        dependencies,
        stopAll: () => stopAll(worker),
    };

    const app = worker.app;
    const agents = worker.agents;
    
    // Parse body of request as a JSON object.
    app.use(express.json({limit: '50mb'}));

    app.get('/', (req, res) => res.send(`Worker listening at http://localhost:${port}`));

    app.post('/agent', (req, res) => {
        const data = req.body;
        const token = data.token;

        try {
            //Verify jwt and start Agent.
            const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
            const payload = deserialize(verifiedToken.data);

            agents.push(payload);

            const agent = agents[agents.length - 1];
            agent.init({dependencies});

            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.sendStatus(403); //Send forbidden response as jwt could not be verified with secret.
        }

    })

    app.listen(port, () => console.log(`Worker listening at http://localhost:${port}`));

    return worker;
}

module.exports = Worker;