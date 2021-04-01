import { makeElement, MaybeStorable, groupSubscribe, sureGet, getTheme } from '../mod.ts'

export interface MakeLinkOptions {
	/** @default false */
	newTab?: boolean
}

export function makeLink(href: MaybeStorable<string>, options: MakeLinkOptions = {}) {
	const $ = makeElement('a')

	groupSubscribe(() => {
		$.raw.setAttribute('href', sureGet(href))
	}, href)

	if (options.newTab) $.raw.setAttribute('target', '_blank')

	return $.style({
		color: getTheme().linksColor,
		cursor: 'pointer',
		textDecoration: 'none',
	})
		.styleScope('hover', {
			textDecoration: 'underline',
		})
		.styleScope('after', {
			opacity: '0.5',
		})
}
