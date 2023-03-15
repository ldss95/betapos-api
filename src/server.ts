import os from 'os'
import cluster from 'cluster'

import { app } from './app'
const { NODE_ENV, MAX_THREADS, DISABLE_MULTI_THREADS } = process.env

function runServer() {
	const port = app.get('port')
	app.listen(port, () => {
		console.log(`Listen on port: ${port}`)
	})
}

/**
 * Funcion anonima, para poder usar el return
 */
(() => {
	const isProd = ['prod', 'production'].includes(NODE_ENV!)
	if (!isProd || DISABLE_MULTI_THREADS === 'true') {
		return runServer()
	}

	const cpus = os.cpus().length
	if (cluster.isMaster) {
		for (let i = 0; i < cpus && i < Number(MAX_THREADS); i++) {
			cluster.fork()
		}
	} else {
		runServer()
	}
})()
