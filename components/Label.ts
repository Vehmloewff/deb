import { Element } from '../core/mod.ts'
import { LabelStyles, ensureObservable, groupSubscribe, MaybeObservable, sureGet } from '../mod.ts'
import { makeArray } from '../lib/utils.ts'
import { stringifyColor } from '../lib/stringify-color.ts'

export interface LabelOptions {
	/**
	 * If `true`, the text will be rendered as html
	 * @default false
	 */
	renderHtml?: MaybeObservable<boolean>
}

export function Label(text: MaybeObservable<string>, options: LabelOptions = {}) {
	const core = Element('div')
	const element = core.raw
	const styler = element.style

	element.classList.add('text')

	ensureObservable(text).subscribe(text => (options.renderHtml ? (element.innerHTML = text) : (element.textContent = text)))

	const testGo = <T>(
		value: MaybeObservable<T> | undefined,
		subscriber: (value: T) => void,
		...additionalWatches: MaybeObservable<any>[]
	) => {
		if (value !== undefined) groupSubscribe(() => subscriber(sureGet(value)), value, ...additionalWatches)

		return {
			otherwise: (fn: () => void) => {
				if (value === undefined) fn()
			},
		}
	}

	const pixeled = (value: number | null | undefined) => {
		if (value) return `${value}px`
		return ``
	}

	function style(styles: LabelStyles) {
		// color
		testGo(styles.color, color => {
			if (!color) return
			styler.background = stringifyColor(color)
			styler.webkitBackgroundClip = 'text'
			styler.webkitTextFillColor = 'transparent'
		})

		// font
		testGo(styles.font, font => (styler.fontFamily = font ? font : ''))

		// font
		testGo(styles.font, font => (styler.fontFamily = font ? font : ''))

		// weight
		testGo(styles.weight, weight => (styler.fontWeight = weight === 'thin' ? '100' : weight === 'regular' ? '400' : String(weight)))

		// decorations
		const textDecorations: string[] = []
		testGo(styles.strikeThough, strike => (strike ? textDecorations.push('line-through') : null))
		if (textDecorations.length) styler.textDecoration = textDecorations.join(' ')

		// italic
		testGo(styles.italic, italic => (styler.textDecoration = italic ? 'italic' : ''))

		// size
		testGo(styles.size, size => (styler.fontSize = pixeled(size)))

		// letterSpacing
		testGo(styles.letterSpacing, spacing => (styler.letterSpacing = pixeled(spacing)))

		// shadow
		testGo(
			styles.shadow,
			shadow =>
				(styler.textShadow = makeArray(shadow)
					.map(shadow => `${shadow.x || 0}px ${shadow.y || 0}px ${shadow.blur || 0}px ${stringifyColor(shadow.color)}`)
					.join(', '))
		)

		// allowSelection
		testGo(styles.allowSelection, allow => (allow ? (styler.userSelect = 'text') : null))

		// textAlign
		testGo(styles.textAlign, align => (styler.textAlign = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center'))

		// greedy
		testGo(styles.greedy, greedy => {
			core.awaitEvent('mount').then(() => {
				if (!greedy) return

				const parentDirection = element.parentElement?.style?.flexDirection

				if (parentDirection === 'column' || parentDirection === 'column-reverse') styler.alignSelf = 'stretch'
				else styler.flexGrow = '1'
			})
		})

		// tabSize
		testGo(styles.tabSize, size => {
			if (typeof size === 'number') styler.tabSize = String(size)
			else styler.tabSize = pixeled(size.length)
		})

		// ignoreWhitespace
		testGo(styles.ignoreWhitespace, ignore => (styler.whiteSpace = ignore ? 'normal' : ''))

		// noWrap
		testGo(styles.noWrap, noWrap => {
			if (!noWrap) return

			if (styler.whiteSpace === 'normal') styler.whiteSpace = 'nowrap'
			else styler.whiteSpace = 'pre'
		})

		// catchTextOverflow
		testGo(styles.catchTextOverflow, overflow => console.warn('catchTextOverflow is not supported at this time'))
	}

	const self = {
		raw: element,
		style(styles: LabelStyles) {
			// getContext(self, 'inheritance-label-defaults').then(ctx => {
			// 	console.log(ctx)
			// 	else ctx.subscribe(defaults => style(Object.assign({}, defaults, styles)))
			// })
			style(styles)

			return self
		},
		dispatchEvent: core.dispatchEvent,
		on: core.on,
		once: core.once,
	}

	return self
}
