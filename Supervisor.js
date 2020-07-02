function Supervisor(ip = "localhost", port = 3000, protocol = "http://") {
    const supervisor = {
        port,
        endpoint: `${protocol}${ip}:${port}`
    }

    const express = require('express');
    const app = express();

    app.get('/', (req, res) => res.send('Hello World!'))

    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

    return supervisor;
}

module.exports = Supervisor;