import { makeElement, MaybeStorable, groupSubscribe, sureGet, getTheme } from '../mod.ts'

export function makeCodeBlock(code: MaybeStorable<string>, language: string) {
	const codeEl = makeElement('code')
	const preEl = makeElement('pre')

	groupSubscribe(() => (codeEl.raw.innerHTML = sureGet(code)), code)

	return preEl
		.style({
			background: getTheme().codeBlockBackground,
			padding: '10px',
			borderRadius: getTheme().mediumAverageBorder,
			margin: '0',
			overflowX: 'auto',
			color: getTheme().codeBlockForeground,
			fontSize: getTheme().smallTextSize,
		})
		.$(codeEl)
}
