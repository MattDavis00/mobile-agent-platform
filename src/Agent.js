const axios = require('axios');
const serialize = require('serialize-javascript');

const Supervisor = require('./Supervisor');

function defaultMain(state, args) {
    console.log("Please implement the main method by passing it as a argument to the Agent constructor");
    console.log("For example: let agent = Agent({main: (state) => console.log(state.name));");
}

function defaultInit(state, args) {
    console.log("Running init.....")
    state.main();
}

function defaultStop(state, args) {
    state.output(`Stopping ${state.name} on node ${state.nodePath[state.currentNode]}`);

    // Clear all currently running intervals
    state.intervals.forEach((element) => {
        clearInterval(element);
    });
    state.intervals = [];

    state.timeouts.forEach((element) => {
        clearTimeout(element);
    });
    state.timeouts = [];
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
        intervals: [],
        timeouts: [],
        store: {}, //Persistent store for developers variables, objects, etc.
        declareStore: function(pairs) { //Declare a variable to the set value if not already defined.
            for (const [key, value] of Object.entries(pairs)) {
                if(typeof this.store[key] === "undefined")
                    this.store[key] = value;
            }
        },
        main: function(...args) {
            this.methods.main(this, args);
        },
        move: function() {
            this.stop();
            
            this.currentNode = (this.currentNode + 1) % this.nodePath.length;
            const nextNode = this.nodePath[this.currentNode];

            axios.post(nextNode, {
                token: "AReallyLongRandomAndUniqueTokenForAuth",
                payload: serialize(this)
            })
            .catch((error) => {
                console.error(error)
            })
        },
        dispatch: function() {
            this.output(`Dispatching ${this.name} from supervisor node ${this.supervisor.endpoint}`);

            this.currentNode = 0;
            const nextNode = this.nodePath[this.currentNode];

            axios.post(nextNode, {
                token: "AReallyLongRandomAndUniqueTokenForAuth",
                payload: serialize(this)
            })
            .catch((error) => {
                console.error(error)
            })
        },
        output: function(text) {
            const url = `${this.supervisor.endpoint}/console`;
            const time = new Date().toLocaleTimeString();

            // If state.output is used on a Worker node, console.log to the worker node what is being sent.
            if(this.currentNode >= 0)
                console.log(`state.output: Worker${this.currentNode} - ${time} | ${text}`);

            axios.post(url, {
                text,
                workerID: this.currentNode
            })
            .then((res) => {
                // console.log(`statusCode: ${res.status}`)
            })
            .catch((error) => {
                console.error(error)
            })
        },
        setInterval: function(callback, interval) { // Provides a safe setInterval method which will be stopped when the agent is moved to another node
            const intervalID = setInterval(callback, interval);
            this.intervals.push(intervalID);
        },
        setTimeout: function(callback, delay) {
            const timeoutID = setTimeout(callback, delay);
            this.timeouts.push(timeoutID);
        },
        init: function(...args) {
            this.methods.init(this, args)
        },
        stop: function(...args) {
            this.methods.stop(this, args)
        },
    }

    return agent;
}

module.exports = Agent;