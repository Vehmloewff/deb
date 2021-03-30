import { makeElement, getTheme } from '../mod.ts'

export function makeParagraph() {
	return makeElement('p').style({ fontSize: getTheme().paragraphFontSize, fontWeight: getTheme().paragraphFontWeight })
}
