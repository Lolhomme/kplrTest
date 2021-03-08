require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import ticketController from './src/routers/controllers/ticketController';
import { Express } from 'express-serve-static-core';
import cluster from "cluster";
import { Pool, PoolClient } from 'pg';

export default class Server {
    private app: Express;

    constructor() {
        this.app = express();
        this.config();
        this.routerConfig();
        this.dbSetup();
    }

    private config() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.text({ limit: '50mb' }));
    }

    private dbSetup() {
        const pool = new Pool ();
        pool.connect(async(err: Error, client: PoolClient, done) => {
            if (err) throw new Error(err.message);
            console.log('Connected');
            try {
                
                const query: string = `
                CREATE TABLE IF NOT EXISTS product
                (
                    id varchar(255) NOT NULL,
                    productname text NOT NULL,
                    price decimal NOT NULL,
                    PRIMARY KEY (id)
                )`;
                const query2: string = `
                CREATE TABLE IF NOT EXISTS ticket
                (
                    id SERIAL PRIMARY KEY,
                    ordernumber integer UNIQUE NULL,
                    vat decimal NOT NULL,
                    total decimal NOT NULL,
                    metadata text NULL
                )`;
                const query3: string = `
                CREATE TABLE IF NOT EXISTS product_ticket
                (
                    id SERIAL PRIMARY KEY,
                    product_id varchar(255) NOT NULL,
                    ticket_id integer NOT NULL,
                    CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES product(id) ON DELETE CASCADE,
                    CONSTRAINT fk_ticket FOREIGN KEY(ticket_id) REFERENCES ticket(id) ON DELETE CASCADE
                )`;
                await client.query(query);
                await client.query(query2);
                await client.query(query3);
                console.log('Table ticket is successfully created');
                console.log('Table product is successfully created');
                console.log('Table product_ticket is successfully created');
              } catch (err) {
                console.log(err.stack);
                return;
              } finally {
                  done();
              }
        }); 
    }

    private routerConfig() {
        this.app.use('/ticket', ticketController);
    }

    public start = (port: number, numCPUs: number): Promise<void> => {
        return new Promise((resolve, reject) => {
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
                this.app.listen(port, () => {
                    console.log(`Example app listening at http://localhost:${port}`)
                }).on('error', (err: Object) => reject(err))
            }
        });
    }
}