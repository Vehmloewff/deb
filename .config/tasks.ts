import 'https://deno.land/x/hackle/init.ts'
import * as dirt from 'https://deno.land/x/dirt/mod.ts'
import { downloadFiles } from 'https://deno.land/x/downloader@1.0.2/mod.ts'
import { buildStaticWebApp, createStaticServer, sendReloadMessage } from '../workflow.ts'
import { dirname } from 'https://deno.land/std@0.71.0/path/mod.ts'

dirt.addTask('dev', async (_, ctx) => {
	createStaticServer(['.config/out', 'test/assets'], { dev: true })

	await dirt.runWatchIf(ctx.flags.watch, '**/*.ts', async () => {
		await buildStaticWebApp('test/main.ts', { dev: true })
		sendReloadMessage()
		hackle.debug(`Ready for action`)
		console.log(`\n==================== LOGS ====================\n`)
	})
})

dirt.addTask('install', async () => {
	await downloadFiles({
		dest: '.config/deps',
		files: [{ url: 'https://codeload.github.com/TehShrike/abstract-state-router/zip/v6.1.0', unzip: { nest: false } }],
	})

	await dirt.runTask('build-asr')
})

dirt.addTask('build-asr', async () => {
	const dir = '.config/deps/abstract-state-router-6.1.0'
	const pkgFile = `${dir}/package.json`
	const configFile = `${dir}/rollup.config.js`
	const jsBundle = `${dir}/bundle.js`
	const finalPath = `.config/deps/asr.js`

	// Switch to a deno-compatible build format
	const rollupConfig = await Deno.readTextFile(configFile)
	await Deno.writeTextFile(configFile, rollupConfig.replace("format: 'cjs'", "format: 'iife'").replace(/external: \[[\s\S]+\],/, ''))

	// Remove `tap-run` from the dependencies so that we don't have to install electron (which takes a long time) for no reason
	const pkg = JSON.parse(await Deno.readTextFile(pkgFile))
	delete pkg.devDependencies['tape-run']
	await Deno.writeTextFile(pkgFile, JSON.stringify(pkg))

	// Install deps and generate bundle
	await Deno.run({
		cwd: dir,
		cmd: ['npm', 'install'],
	}).status()
	await Deno.run({
		cwd: dir,
		cmd: ['npm', 'run', 'build'],
	}).status()

	// Copy the bundle to a better location and remove the whole asr repo
	await Deno.copyFile(jsBundle, finalPath)
	await Deno.remove(dir, { recursive: true })

	// `export default` the iife
	const data = await Deno.readTextFile(finalPath)
	await Deno.writeTextFile(finalPath, data.replace('var abstractStateRouter =', 'export default '))
})

dirt.go((_, ctx) => {
	if (ctx.flags.watch) dirt.restartWhenChanged()
})
