const express = require('express');

function Supervisor(ip = "localhost", port = 3000, protocol = "http://") {
    const supervisor = {
        port,
        endpoint: `${protocol}${ip}:${port}`,
        app: express(),
    };

    const app = supervisor.app;

    app.get('/', (req, res) => res.send(`Supervisor listening at ${supervisor.endpoint}`));

    app.listen(port, () => console.log(`Supervisor listening at ${supervisor.endpoint}`));

    return supervisor;
}

module.exports = Supervisor;