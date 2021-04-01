import { makeElement, getTheme, MaybeStorable, groupSubscribe, sureGet } from '../mod.ts'

export function makeInlineCode(code: MaybeStorable<string>) {
	const el = makeElement('code').style({
		background: getTheme().inlineCodeBackground,
		color: getTheme().inlineCodeForeground,
		padding: '6px 6px 0px 6px',
		borderRadius: getTheme().smallAverageBorder,
		fontSize: getTheme().smallTextSize,
	})

	groupSubscribe(() => (el.raw.textContent = sureGet(code)))

	return el
}
