import { makeElement } from './element.ts'
import { getTheme } from './theme.ts'

// deno-lint-ignore no-undef
export function appRoot(rootHTMLElement = document.body) {
	return makeElement(rootHTMLElement).style({
		color: getTheme().foreground1,
		background: getTheme().background1,
		fontSize: getTheme().paragraphFontSize,
		fontWeight: getTheme().paragraphFontWeight,
	})
}
