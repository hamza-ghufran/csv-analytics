const cluster = require('cluster');

let workers = [];

export const setupWorkerProcesses = () => {
  let numCores = require('os').cpus().length;
  console.log('Master cluster setting up ' + (numCores) + ' workers');

  for (let i = 0; i < (numCores); i++) {
    workers.push(cluster.fork());
    //here are the masters

    workers[i].on('message', function (message) {
      console.log(message)
    });

    workers[i].send({ msg: 'test' })
  }

  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is listening');
  });

  cluster.on('exit', function (worker, code, signal) {
    cluster.fork();
    workers.push(cluster.fork());
    workers[workers.length - 1].on('message', function (message) {
      console.log(message);
    });
  });
};

const setupServer = () => {

  if (cluster.isMaster) {
    setupWorkerProcesses();
  }
};
