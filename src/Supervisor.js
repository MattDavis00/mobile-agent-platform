const express = require('express');

function Supervisor(ip = "localhost", port = 3000, protocol = "http://") {
    const supervisor = {
        port,
        endpoint: `${protocol}${ip}:${port}`,
        app: express(),
    };

    const app = supervisor.app;

    // Parse body of request as a JSON object.
    app.use(express.json({limit: '50mb'}));

    app.get('/', (req, res) => res.send(`Supervisor listening at ${supervisor.endpoint}`));

    app.listen(port, () => console.log(`Supervisor listening at ${supervisor.endpoint}`));

    app.post('/console', (req, res) => {
        const data = req.body;

        const text = data.text;
        const workerID = data.workerID;

        const date = new Date();
        const time = date.toLocaleTimeString();
        if (workerID >= 0)
            console.log(`Worker ${workerID} - ${time} | `, text)
        else
            console.log(`Supervisor - ${time} | ${text}`)

        res.sendStatus(200);
    })

    return supervisor;
}

module.exports = Supervisor;