import { makeElement, MaybeStorable, groupSubscribe, sureGet, getTheme } from '../mod.ts'

export function makeCodeBlock(code: MaybeStorable<string>, language: string) {
	const codeEl = makeElement('code')
	const preEl = makeElement('pre')

	console.log(language)

	groupSubscribe(() => (codeEl.raw.innerHTML = sureGet(code)), code)

	return preEl
		.style({
			background: getTheme().background2,
			padding: '10px',
			borderRadius: getTheme().mediumAverageBorder,
			margin: '0',
			overflowX: 'auto',
			fontSize: getTheme().codeFontSize,
		})
		.$(codeEl)
}
