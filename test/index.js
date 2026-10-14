#!/usr/bin/env node
const polka = require('polka');
const send = require('@polka/send-type');
const app         = polka();
//
const { json } = require('body-parser');
const cors = require('cors')

app.use(json())

// let corsOptions = {
//     origin: 'http://localhost:*',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   }
app.use(cors())
//
const fs = require('fs')
const http = require('http')
const path = require('path')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;

const RepoBridgeOps = require('../lib/repo_bridge_ops')
const WebSocketActions = require('../lib/websocket_con')


// g_repo_bridge_ops

/*
TERMINAL ... set it up...

    // need frame for : ssh richard@76.229.181.242 -L 8080:localhost:8080 -N
    // goes to ttyd ... pick a good port (consider using some keys, etc.)


*/

// This process becomes the forever process manager for processes launched off of a very private web service.
//

// For each type of shared table launched, this process maintains a list of interface types that may be configured 
// for processes that it launches. Also, can launch other DB management processes. 
// When this launches a processes, it can check that the configuration of the process has an interface conforming 
// to the types of DB managers that this has launched.

// Principle going forward: Every single application process can attach to a DB/Shared Mem table, while every DB or table 
// is a standalone manager that provides lifecycle for the shared object. 

// This proces, the copious-transions-manager, manages the DB lifecycle processes and spawns applications configured to attach 
// to the share objects. 

// 
class WSConsole extends console.Console {
    constructor(fn,out,err) {
        super(out,err)
        this.log_custom = fn
    }

    log(...args) {
        super.log(...args)
        this.log_custom(args)
    }
}

let save_console = false
function setup_console(fn) {
    save_console = console
    //
    let custom_console = new WSConsole(fn,process.stdout,process.stderr)
    console = custom_console
}


let g_ws_socks = false
let g_config = false
//
// let g_descriptions = false

// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


// LOAD CONFIGURATION  ... if this crashes, that's fine
try {
    let conf_str = fs.readFileSync("mail_bridge.conf").toString()
    g_config = JSON.parse(conf_str) 
} catch (e) {
    console.log("THERE NEEDS TO BE A PROPERLY JSON-FORMATTED CONFIGURATION FILE, mail_bridge.conf  IN YOUR WORKING DIRECTORY")
    process.exit(0)
}




/**
 * write_out_config
 *  update the configuration file with operational changes...
 *  for example, this method is added to handle the case of ignoring directories, which in turn have .gitignore inside them.
 * 
 */
function write_out_config() {
    if ( typeof g_config === 'object' ) {
        try {
console.log("write_out_config")
            let conf_output_str = JSON.stringify(g_config,null,2)
            fs.writeFileSync("manager.conf",conf_output_str)
        } catch (e) {}
    }
}

console.dir(g_config)

//
// -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- -------- --------
//
const MANAGER_PORT = g_config.web_page_port

let g_proc_managers = {}


let g_system_coms = false
let g_all_procs = false


let g_repo_bridge_ops = new RepoBridgeOps(g_config.repo_bridge,g_all_procs,g_system_coms)


//g_repo_ops.test()

console.log(__dirname)


app.get('/', async (req, res) => {
    let obj = {
        "file": "index.html"
    }
    let status = await g_repo_bridge_ops.get_app_file(obj)
    //
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"root: could not load the requested file")
    }
    //
});



app.get('/:file', async (req, res) => {
    let file = ""
    let obj = {
        "file": req.params.file
    }
    let status = await g_repo_bridge_ops.get_app_file(obj)
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"could not load the requested file: " + file)
    }
})


// not accessible by nginx (i.e. must be on the machine in ssh ... use wget)

app.get('assets/:file', async (req, res) => {
    let obj = {
        "file": req.params.file
    }
    let status = await g_repo_bridge_ops.get_asset_file(obj)
    if ( status ) {
        let page = obj.data.toString()
        res.end(page);
    } else {
        send(res,404,"could not load the requested file: " + obj.file)
    }
})







function handler_ws_messages(message_body) {
    console.dir(message_body)
}


function ws_proc_status() {
    if ( g_proc_managers && g_ws_socks ) {
        let sendable = g_repo_ops.sendable_proc_data()
        let op_message = {
            "op" : "proc-status",
            "data" : sendable
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


function ws_console_log(data) {
    if ( g_proc_managers && g_ws_socks ) {
        let op_message = {
            "op" : "console-output",
            "data" : data
        }
        g_ws_socks.send_to_going_sessions(op_message)
    }
}


// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
if ( g_config.wss_app_port ) {   // WEB APP SCOCKETS OPTION (START)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------

    g_ws_socks = new WebSocketActions()
    
    let app_server = http.createServer(app);
    app_server.listen(g_config.wss_app_port);
    //
    var g_app_wss = new WebSocketServer({server: app_server});
    g_ws_socks.set_socket_server(g_app_wss,handler_ws_messages)
    //

    setInterval(() => { ws_proc_status() },5000)

    setup_console(ws_console_log)

// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------
}       // WEB APP SCOCKETS OPTION (END)
// ------------- ------------- ------------- ------------- ------------- ------------- ------------- -------------


//
//
//

// ---- ---- ---- ---- ----
//g_all_procs.initialize_children()
// ---- ---- ---- ---- ----
app.listen(MANAGER_PORT)
console.log(`listening on port ${MANAGER_PORT}`)
