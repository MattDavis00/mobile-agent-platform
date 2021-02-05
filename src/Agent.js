const axios = require('axios');
const serialize = require('serialize-javascript');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const Supervisor = require('./Supervisor');

function defaultMain(state, args) {
    console.log("Please implement the main method by passing it as a argument to the Agent constructor");
    console.log("For example: let agent = Agent({main: (state) => console.log(state.name));");
}

function defaultInit(state, args = {}) {
    console.log("Running init.....")
    state.dependencies = args.dependencies;
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

function transferAgent(state, args) {
    state.currentNode = (state.currentNode + 1) % state.nodePath.length;
    const nextNode = state.nodePath[state.currentNode];
    const payload = serialize(state);

    if (typeof process.env.TOKEN_SECRET === "undefined" || process.env.TOKEN_SECRET === null) {
        state.output("TOKEN_SECRET is not defined in the .env file.");
        throw new Error("TOKEN_SECRET is not defined in the .env file.");
    }

    const token = jwt.sign({
        data: payload
    }, process.env.TOKEN_SECRET, { expiresIn: '10s' });

    axios.post(nextNode, {
        token
    })
    .catch((error) => {
        state.currentNode = (state.currentNode - 1) % state.nodePath.length;
        // console.error(error.response)
        if (error?.response?.status === 403) {
            state.output(`Worker${state.currentNode + 1} rejected Agent transfer request due to bad jwt`)
        } else {
            state.output(`Worker${state.currentNode} could not establish a network connection with the next node`)
        }
    })
}

function Agent({
        supervisor = Supervisor(),
        name = "Default Agent",
        main = defaultMain,
        init = defaultInit,
        stop = defaultStop,
        nodePath = [],
        methods = {},
    }) {

    let agent = {
        methods: { //All dependency methods are required to be part of the agent object for the object to be serialized correctly.
            main,
            init,
            stop,
            transferAgent,
            ...methods
        },
        dependencies: {},
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

            this.transferAgent();
        },
        transferAgent: function(...args) {
            this.methods.transferAgent(this, args)
        },
        dispatch: function() {
            this.output(`Dispatching ${this.name} from supervisor node ${this.supervisor.endpoint}`);

            this.currentNode = -1;

            this.transferAgent();
        },
        output: function(text) {
            const url = `${this.supervisor.endpoint}/console`;
            const time = new Date().toLocaleTimeString();

            // If state.output is used on a Worker node, console.log to the worker node what is being sent.
            if(this.currentNode >= 0)
                console.log(`state.output: Worker${this.currentNode} - ${time} | `, text);

            axios.post(url, {
                text,
                workerID: this.currentNode
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
        init: function(args = {}) {
            this.methods.init(this, args)
        },
        stop: function(...args) {
            this.methods.stop(this, args)
        },
    }

    return agent;
}

module.exports = Agent;