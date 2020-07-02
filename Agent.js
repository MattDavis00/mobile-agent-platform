const axios = require('axios');
const serialize = require('serialize-javascript');
const Supervisor = require('./Supervisor');

function Agent(supervisor = Supervisor(), name = "Template Agent") {
    let agent = {
        supervisor, //Information about the supervisor
        name,
        nodePath: ['http://localhost:4000/agent'],
        currentNode: -1,
        ttl: 10,
        intervals: [],
        move: function() {
            this.currentNode++;
    
            const nextNode = this.nodePath[this.currentNode];
            axios.post(nextNode, {
                token: "AReallyLongRandomAndUniqueTokenForAuth",
                payload: serialize(this)
            })
            .then((res) => {
                console.log(`statusCode: ${res.statusCode}`)
                console.log(res)
                this.stop();
            })
            .catch((error) => {
                console.error(error)
            })
        },
        main: function() {
            this.setInterval(() => {
                const date = new Date();
                const time = date.toLocaleTimeString();
                console.log(`${time}: Running ${this.name} on node ${this.nodePath[this.currentNode]} with id ${this.currentNode}`);
            }, 1000)
        },
        setInterval: function(callback, interval) { // Provides a safe setInterval method which will be stopped when the agent is moved to another node
            const intervalID = setInterval(callback, interval);
            this.intervals.push(intervalID);
        },
        init: function() {
            this.ttl--;
            this.main();
        },
        stop: function() {
            const date = new Date();
            const time = date.toLocaleTimeString();
            console.log(`${time}: Stopping ${this.name} on node ${this.nodePath[this.currentNode]} with id ${this.currentNode}`);
    
            // Clear all currently running intervals
            this.intervals.forEach((element) => {
                clearInterval(element);
            });
        }
    }

    return agent;
}

module.exports = Agent;