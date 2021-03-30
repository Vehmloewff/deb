import { makeElement, getTheme, MaybeStorable, groupSubscribe, sureGet } from '../mod.ts'

export function makeInlineCode(code: MaybeStorable<string>) {
	const el = makeElement('code').style({
		background: getTheme().background2,
		padding: '6px 6px 0px 6px',
		borderRadius: getTheme().smallAverageBorder,
		fontSize: getTheme().codeFontSize,
	})

	groupSubscribe(() => (el.raw.textContent = sureGet(code)))

	return el
}
