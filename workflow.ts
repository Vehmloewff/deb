import { join, dirname } from 'https://deno.land/std@0.75.0/path/mod.ts'
import { exists } from 'https://deno.land/std@0.75.0/fs/mod.ts'
export * from './lib/static-server.ts'

export interface BundleAppOptions extends DomBundleOptions {
	outFolder?: string
	template?: Template
	/**
	 * If `true`, Deb will insert into the bundle a snippet of code that enables live reloading
	 * @default false
	 */
	dev?: boolean
}

/**
 * Builds the app for a browser.
 * Requires the `allow-read` and `allow-env` permissions
 */
export async function buildStaticWebApp(entryFile: string, options: BundleAppOptions = {}) {
	const outFolder = options.outFolder || '.config/out'
	const appBundleJS = join(outFolder, 'app.js')

	if (!(await exists(outFolder))) await Deno.mkdir(outFolder, { recursive: true })

	await Promise.all([
		domBundle(entryFile, appBundleJS, options),
		Deno.writeTextFile(join(outFolder, 'index.html'), options.template || makeTemplate('Deb App')),
	])

	if (options.dev) {
		const liveReloadPath = join(dirname(import.meta.url.slice(5)), 'lib', 'livereload.js')
		const liveReloadCode = await Deno.readTextFile(liveReloadPath)
		await Deno.writeTextFile(appBundleJS, `\n;\n${liveReloadCode}`, { append: true })
	}
}

// /**
//  * Builds the app for a server to serve the client
//  */
// export async function buildWebApp(clientEntry: string, serverEntry: string, options: BuildWebAppOptions) {}

export interface DomBundleOptions {
	unstable?: boolean
	importmap?: string
	/** @default false */
	ignoreTsconfig?: boolean
}

/**
 * Bundles a Deno file and it's dependencies using the `DOM` lib for the web
 */
export async function domBundle(entryFile: string, outFile: string, options: DomBundleOptions = {}): Promise<boolean> {
	const fileName = `deno-deb-${Deno.cwd().replace(/\//g, '-')}-tsconfig.json`
	const fileDir = Deno.env.get('TMPDIR') || '/tmp'
	const filePath = join(fileDir, fileName)
	const tsconfig = options.ignoreTsconfig ? {} : await getTsConfig()

	await Deno.writeTextFile(
		filePath,
		JSON.stringify(Object.assign({}, tsconfig, { compilerOptions: { lib: ['dom', 'esnext', 'deno.ns'] } }))
	)

	const status = await Deno.run({
		cmd: [
			'deno',
			'bundle',
			...(options.unstable ? ['--unstable'] : []),
			...(options.importmap ? ['--importmap', options.importmap] : []),
			'--config',
			filePath,
			entryFile,
			outFile,
		],
	}).status()

	if (status.success) return true
	return false
}

async function getTsConfig() {
	const tsconfigPath = `${Deno.cwd()}/tsconfig.json`
	if (await exists(tsconfigPath))
		try {
			return JSON.parse(await Deno.readTextFile(tsconfigPath))
		} catch (e) {
			return {}
		}
	else return {}
}

export type Template = string

export interface MakeTemplateOptions {
	/**
	 * An html string that will be rendered until the app makes it's first load
	 */
	splash?: string
	/**
	 * Additional stylesheets to be loaded into `<link>` tags
	 */
	stylesheets?: string[]
	/**
	 * Additional JS files to be loaded into `<stript>` tags
	 */
	scripts?: { url: string; defer: boolean }[]
}

/**
 * Generates an HTML string
 * @param title The text to go in the `<title>` tag in the head
 */
export function makeTemplate(title: string, options: MakeTemplateOptions = {}): Template {
	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport"content="width=device-width,initial-scale=1.0"><title>${title}</title>${
		options.stylesheets ? options.stylesheets.map(url => `<link rel="stylesheet"href="${url}">`).join('') : ''
	}<script defer src="app.js"></script>${
		options.scripts ? options.scripts.map(({ defer, url }) => `<script ${defer ? 'defer ' : ''}src="${url}"></script>`).join('') : ''
	}</head><body>${options.splash || ''}</body></html>`
}
