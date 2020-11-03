/// <reference lib="dom" />

export function minify(css: string) {
	return css
		.replace(/\t/g, '')
		.replace(/\n/g, '')
		.replace(/\/\*([\s\S]*?)\*\//g, '')
		.replace(/;\s*/g, ';')
		.replace(/;}/g, '}')
		.replace(/\s*{/g, '{')
		.replace(/:\s*/g, ':')
}

export function applyCSS(css: string) {
	const el = document.createElement('style')
	el.textContent = minify(css)
	document.head.appendChild(el)
}
