require('dotenv').config();
import server from './server';
import {cpus} from "os";

const port = parseInt(process.env.PORT || '3000');
const numCPUs = cpus().length;

const starter = new server().start(port, numCPUs)
  .then(port => console.log(`Running on port ${port}`))
  .catch(error => {
    console.log(error)
  });

export default starter;