import { sh, readText, writeText, writeJson } from 'https://denopkg.com/Vehmloewff/deno-utils/mod.ts'
import { Application, send } from 'https://deno.land/x/oak@v6.5.1/mod.ts'
import { join } from 'https://deno.land/std@0.92.0/path/mod.ts'
import { acceptWebSocket, WebSocket } from 'https://deno.land/std@0.92.0/ws/mod.ts'

export interface BundleOptions {
	input: string
	output: string
	watch?: boolean
	importMap?: string
}

export async function bundle(options: BundleOptions) {
	const configPath = await Deno.makeTempFile()
	await writeJson(configPath, { compilerOptions: { lib: ['dom', 'esnext', 'deno.ns'] } })

	if (options.watch) {
		let rewriteCaused = false
		watchFs(
			options.output,
			() => {
				if (rewriteCaused) return (rewriteCaused = false)
				supportTopLevelAwaitInBundle(options.output)
				return (rewriteCaused = true)
			},
			200
		)
	}

	await sh(
		`deno bundle ${options.input} ${options.output} --config ${configPath} --no-check --unstable ${options.watch ? '--watch' : ''} ${
			options.importMap ? `--import-map="${options.importMap}"` : ''
		}`
	)

	if (!options.watch) await supportTopLevelAwaitInBundle(options.output)
}

const livereloadScript = `function startSocketListener() {
	const socket = new WebSocket(\`ws://\${location.hostname}:\${location.port}/livereload.ws\`)

	socket.addEventListener('message', e => {
		if (e.data === 'connected') return console.log('[dev] livereload enabled')

		if (e.data === 'should-reload') {
			console.log('[dev] changes detected via livereload server.  Reloading...')
			window.location.reload()
		} else {
			console.warn('[dev] received an unexpected message from the livereload server.', e.data)
		}
	})

	socket.addEventListener('error', e => {
		console.log('[dev] could not connect to livereload server.', e)
	})

	socket.addEventListener('close', e => {
		console.log('[dev] livereload server disconnected!')
		tryReconnect()
	})
}

function tryReconnect() {
	console.log('[dev] running a livereload reconnect attempt in 5s...')
	setTimeout(() => {
		console.log('[dev] reconnecting livereload server...')
		startSocketListener()
	}, 5000)
}

startSocketListener()`

export interface MakeTemplateOptions {
	css?: string | 'normalize'
	title: string
	js: string
	livereload?: boolean
}

export function makeTemplate(options: MakeTemplateOptions) {
	const css = options.css
		? options.css === 'normalize'
			? `<link href="https://necolas.github.io/normalize.css/8.0.1/normalize.css" rel="stylesheet">`
			: `<link href="${options.css}" rel="stylesheet">`
		: ''
	const livereload = options.livereload ? `<script>\n${livereloadScript}\n</script>` : ''

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	${css}
	<title>${options.title}</title>
	<script defer src="${options.js}"></script>
	${livereload}
</head>
<body></body>
</html>`
}

export interface StaticServerOptions {
	port: number
	root: string
	pushState?: boolean
	openLivereloadWs?: boolean
	livereload?: boolean
}

let openSockets: WebSocket[] = []

export async function staticServer(options: StaticServerOptions) {
	const app = new Application()

	if (options.openLivereloadWs || options.livereload)
		app.use(async (ctx, next) => {
			if (ctx.request.url.pathname !== '/livereload.ws') return await next()

			const { conn, r: bufReader, w: bufWriter, headers } = ctx.request.serverRequest
			const sock = await acceptWebSocket({
				conn,
				bufReader,
				bufWriter,
				headers,
			})

			openSockets.push(sock)

			sock.send('connected')

			try {
				for await (const ev of sock) {
					// do nothing
				}
			} catch (err) {
				console.error(`failed to receive frame: ${err}`)

				if (!sock.isClosed) {
					await sock.close(1000).catch(console.error)
				}
			}
		})

	app.use(async (ctx, next) => {
		try {
			await send(ctx, ctx.request.url.pathname, {
				root: join(Deno.cwd(), options.root),
				index: 'index.html',
			})
		} catch (e) {
			if (!/no such file/i.test(e.message)) throw e

			if (!options.pushState) return next()

			ctx.response.body = await readText(join(Deno.cwd(), options.root, 'index.html'))
			ctx.response.headers.set('Content-Type', 'text/html')
			ctx.response.status = 200
		}
	})

	app.addEventListener('listen', () => {
		console.log(`Listening on https://localhost:${options.port}`)
	})

	if (options.livereload) {
		watchFs(options.root, () => sendReloadMessage())
	}

	await app.listen({ port: options.port })
}

export function sendReloadMessage() {
	console.log('[dev] sending reload message to clients...')

	openSockets = openSockets.filter(socket => {
		if (socket.isClosed) return false

		socket.send('should-reload')

		return true
	})
}

export async function watchFs(path: string, fn: () => void, delay = 300) {
	const watcher = Deno.watchFs(path)
	let timeout

	for await (const event of watcher) {
		clearTimeout(timeout)
		timeout = setTimeout(fn, delay)
	}
}

let lastBundle = ``

export async function supportTopLevelAwaitInBundle(bundlePath: string) {
	const bundle = await Deno.readTextFile(bundlePath)

	if (bundle === lastBundle) return
	if (bundle.startsWith('(async')) return

	lastBundle = `(async function(){\n${bundle}\n}())`
	await writeText(bundlePath, lastBundle)
}
