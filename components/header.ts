import { makeElement, getTheme } from '../mod.ts'

export function makeHeader(type: number) {
	if (type < 1 || type > 6) throw new Error(`Header type must be a number between 1 and 6`)

	// @ts-expect-error validation is above
	return makeElement(`h${type}`).style({ fontSize: getTheme()[`header${type}FontSize`], fontWeight: getTheme().headerFontWeight })
}
