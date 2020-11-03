import 'https://deno.land/x/hackle/init.ts'
import { Application, Context, Router, send } from 'https://deno.land/x/oak@v6.3.1/mod.ts'
import { acceptWebSocket, WebSocket } from 'https://deno.land/std@0.73.0/ws/mod.ts'
import { makeArray } from 'https://deno.land/x/dirt@0.3.0/utils.ts'
import { join } from 'https://deno.land/std@0.73.0/path/mod.ts'

let openSockets: WebSocket[] = []

export interface StaticServerOptions {
	/**
	 * If `true`, Deb will listen for websocket requests to `/_livereload.ws` for livereload purposes
	 * @default false
	 */
	dev?: boolean

	/**
	 * The port on which to start the server
	 * @default 3000
	 */
	port?: number
}

/**
 * Creates a server for serving static content.
 */
export async function createStaticServer(serve: string | string[], options: StaticServerOptions = {}) {
	const app = new Application()

	app.addEventListener('listen', ({ hostname, port, secure }) => {
		hackle.info(`Listening on: ${secure ? 'https://' : 'http://'}${hostname ?? 'localhost'}:${port}`)
	})

	app.use(async (ctx, next) => {
		await next()
		hackle.info(`GET "${ctx.request.url.pathname}"`)
	})

	const staticMiddleware = (root: string) => async (ctx: Context, next: () => Promise<void>) => {
		try {
			await send(ctx, ctx.request.url.pathname, {
				root,
				index: 'index.html',
			})
		} catch (e) {
			await next()
		}
	}

	makeArray(serve).forEach(path => {
		app.use(staticMiddleware(join(Deno.cwd(), path)))
	})

	const router = new Router()

	app.use(router.routes())
	app.use(router.allowedMethods())

	app.use(async (ctx, next) => {
		if (ctx.request.url.pathname !== '/_livereload.ws') return await next()

		const { conn, r: bufReader, w: bufWriter, headers } = ctx.request.serverRequest
		const sock = await acceptWebSocket({
			conn,
			bufReader,
			bufWriter,
			headers,
		})

		hackle.debug('new livereload client connected')
		openSockets.push(sock)

		try {
			for await (const ev of sock) {
				// if (typeof ev === 'string') {
				// 	// text message
				// 	hackle.debug('ws:Text', ev)
				// 	await sock.send(ev)
				// } else if (ev instanceof Uint8Array) {
				// 	// binary message
				// 	hackle.debug('ws:Binary', ev)
				// } else if (isWebSocketPingEvent(ev)) {
				// 	const [, body] = ev
				// 	// ping
				// 	hackle.debug('ws:Ping', body)
				// } else if (isWebSocketCloseEvent(ev)) {
				// 	// close
				// 	const { code, reason } = ev
				// 	hackle.debug('ws:Close', code, reason)
				// }
			}
		} catch (err) {
			console.error(`failed to receive frame: ${err}`)

			if (!sock.isClosed) {
				await sock.close(1000).catch(console.error)
			}
		}
	})

	app.use(ctx => {
		ctx.response.body = 'Invalid path.  Route was not found on server.'
		ctx.response.status = 404
	})

	app.listen({ port: options.port || 3000 })

	return app
}

export function sendReloadMessage() {
	openSockets = openSockets.filter(socket => {
		if (socket.isClosed) return false

		hackle.debug('Reloading client')
		socket.send('should-reload')
		return true
	})
}
