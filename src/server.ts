import os from 'os';
import cluster from 'cluster';

import { app } from './app'

function runServer() {
	const port = app.get('port')
	app.listen(port, () => {
		console.log(`Listen on port: ${port}`);
	})
}

//Funcion anonima, para poder usar el return
(() => {
	const isDevelopment = ['dev', 'development'].includes(process.env.NODE_ENV!)
	if (isDevelopment) {
		return runServer()
	}

	const cpus = os.cpus().length
	if (cluster.isMaster) {
		for (let i = 0; i < cpus; i++) {
			cluster.fork();
		}
	} else {
		runServer()
	}
})()