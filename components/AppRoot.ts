import { applyCSS, minify } from '../lib/css.ts'
import { AppRoot as wrappedAppRoot, Element } from '../core/mod.ts'
import betterCSS from '../css/better.css.ts'
import { DefaultTheme, defaultTheme, setTheme } from '../mod.ts'

export interface AppRootOptions {
	theme?: DefaultTheme
}

export function AppRoot(options: AppRootOptions = {}) {
	const element = Element('div')

	element.raw.classList.add('app-container')

	wrappedAppRoot({ normalizeCSS: true }).$(element)

	applyCSS(minify(betterCSS))

	setTheme(element, options.theme || defaultTheme)

	return {
		...element,
	}
}
