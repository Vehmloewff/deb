/// <reference lib="dom"/>

function startSocketListener() {
	const socket = new WebSocket(`ws://${location.hostname}:${location.port}/_livereload.ws`)

	socket.addEventListener('open', () => {
		console.log(`[dev] livereload enabled`)
	})

	socket.addEventListener('message', e => {
		if (e.data === 'should-reload') {
			console.log(`[dev] changes detected via livereload server.  Reloading...`)
			window.location.reload()
		} else {
			console.warn(`[dev] received an unexpected message from the livereload server.`, e.data)
		}
	})

	socket.addEventListener('error', e => {
		console.log(`[dev] could not connect to livereload server.`, e)
	})

	socket.addEventListener('close', e => {
		console.log(`[dev] livereload server disconnected!`)
		tryReconnect()
	})
}

function tryReconnect() {
	console.log(`[dev] running a livereload reconnect attempt in 5s...`)
	setTimeout(() => {
		console.log(`[dev] reconnecting livereload server...`)
		startSocketListener()
	}, 5000)
}

startSocketListener()
