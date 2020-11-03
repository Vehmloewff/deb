import { Color } from '../color.ts'
import { stringifyColor } from '../lib/stringify-color.ts'
import { derive, ensureObservable, MaybeObservable, Block } from '../mod.ts'

export type IconValues = 'dots-horizontal' | 'dots-vertical' | 'x' | 'check' | 'pencil'

const svgStrings: { [k in IconValues]: string } = {
	'dots-horizontal': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>`,
	'dots-vertical': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>`,
	x: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
	check: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
	pencil: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`,
}

export interface IconStyles {
	color?: MaybeObservable<Color>
	/** @default null // defer to size */
	width?: MaybeObservable<number | null>
	/** @default null // defer to size */
	height?: MaybeObservable<number | null>
	/** @default null // take up as much space as possible */
	size?: MaybeObservable<number | null>
}

export function Icon(value: MaybeObservable<IconValues | string>) {
	const svgText = derive(ensureObservable(value), value => svgStrings[value as IconValues] || value)
	const container = Block().packX().packY()
	const styler = container.raw.style

	container.raw.classList.add('icon')
	svgText.subscribe(text => (container.raw.innerHTML = text))

	const self = {
		...container,
		style(styles: IconStyles) {
			const pixeled = (val: number | null) => (val === null ? `` : `${val}px`)

			if (styles.color) ensureObservable(styles.color).subscribe(color => (styler.color = stringifyColor(color)))
			if (styles.size)
				ensureObservable(styles.size).subscribe(size => {
					styler.width = pixeled(size)
					styler.height = pixeled(size)
				})
			if (styles.width) ensureObservable(styles.width).subscribe(width => (styler.width = pixeled(width)))
			if (styles.height) ensureObservable(styles.height).subscribe(height => (styler.height = pixeled(height)))

			return self
		},
	}

	return self
}
