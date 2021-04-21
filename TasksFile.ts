import { writeText } from 'https://denopkg.com/Vehmloewff/deno-utils/mod.ts'
import { makeTemplate, bundle, staticServer } from './workflow.ts'

/** Build examples for usage */
export async function buildExamples() {
	await writeText(
		'out/index.html',
		makeTemplate({
			js: 'bundle.js',
			title: 'Example',
			livereload: true,
			css: 'normalize',
		})
	)

	await Promise.all([
		bundle({ input: 'examples/basic.ts', output: 'out/bundle.js', watch: true }),
		staticServer({ livereload: true, port: 3000, root: 'out', pushState: true }),
	])
}
