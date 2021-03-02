import cluster from "cluster";
import * as express from 'express';
import {cpus} from "os";

const numCPUs = cpus().length;
const port: number = 3000;

if (cluster.isMaster) {
    console.log(`This machine has ${numCPUs} CPUs.`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("online", (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
        console.log("Starting a new worker...");
        cluster.fork();
    });

} else {
    const app = express.default();
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}