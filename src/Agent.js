const axios = require('axios');
const serialize = require('serialize-javascript');
const Supervisor = require('./Supervisor');

function defaultMain(state, args) {
    console.log("Please implement the main method by passing it as a argument to the Agent constructor");
    console.log("For example: let agent = Agent({main: (state) => console.log(state.name));");
}

function defaultInit(state, args) {
    console.log("Ran init!!!!!!!!!!!")
    state.ttl--;
    state.main();
}

function defaultStop(state, args) {
    const date = new Date();
    const time = date.toLocaleTimeString();
    console.log(`${time}: Stopping ${state.name} on node ${state.nodePath[state.currentNode]} with id ${state.currentNode}`);

    // Clear all currently running intervals
    state.intervals.forEach((element) => {
        clearInterval(element);
    });
}

function Agent({
        supervisor = Supervisor(),
        name = "Default Agent",
        main = defaultMain,
        init = defaultInit,
        stop = defaultStop,
        nodePath = [],
    }) {

    let agent = {
        methods: { //All dependency methods are required to be part of the agent object for the object to be serialized correctly.
            main,
            init,
            stop,
        },
        supervisor, //Information about the supervisor
        name,
        nodePath,
        currentNode: -1,
        ttl: 10,
        intervals: [],
        main: function wrapper(...args) {
            wrapper.bind(this);
            this.methods.main(this, args);
        },
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
        setInterval: function(callback, interval) { // Provides a safe setInterval method which will be stopped when the agent is moved to another node
            const intervalID = setInterval(callback, interval);
            this.intervals.push(intervalID);
        },
        init: function wrapper(...args) {
            wrapper.bind(this);
            this.methods.init(this, args)
        },
        stop: function wrapper(...args) {
            wrapper.bind(this);
            this.methods.stop(this, args)
        },
    }

    return agent;
}

module.exports = Agent;