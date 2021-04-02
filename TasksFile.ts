import { sh } from 'https://denopkg.com/Vehmloewff/deno-utils/mod.ts'

/** Build examples for usage */
export async function buildExamples() {
	// const configPath = await Deno.makeTempFile()
	// await Deno.writeTextFile(configPath, JSON.stringify({ compilerOptions: { lib: ['dom', 'esnext', 'deno.ns'] } }))
	// await sh(`deno bundle --unstable --watch --config ${configPath} examples/basic.ts out/bundle.js`)
	// const bundle = await Deno.readTextFile('out/bundle.js')
	// await Deno.writeTextFile('out/bundle.js', `(async function(){\n${bundle}\n}())`)
	console.log(import.meta.url)
	await Deno.mkdir('dist/out', { recursive: true })
	await Deno.writeTextFile(
		'dist/out/index.html',
		`<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="https://necolas.github.io/normalize.css/8.0.1/normalize.css" rel="stylesheet">
		<title>Example</title>
		<script defer src="bundle.js"></script>
	</head>
	<body>
		
	</body>
	</html>`,
		{ create: true }
	)
	await sh(`bundler bundle examples/basic.ts=out/bundle.js --watch`)
}

// export async function supportTopLevelAwaitInBundle() {
// 	const bundle = await Deno.readTextFile('out/bundle.js')
// 	await Deno.writeTextFile('out/bundle.js', `(async function(){\n${bundle}\n}())`)
// }
