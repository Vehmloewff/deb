import { Color } from '../color.ts'
import { derive, MaybeObservable } from '../core/mod.ts'
import { Block } from '../mod.ts'
import { BlockStyles } from '../types.ts'

export interface CaretStyles {
	width?: MaybeObservable<number>
	color?: MaybeObservable<Color>
	borderRadius?: BlockStyles['borderRadius']
	smoothTransition?: MaybeObservable<boolean>
}

export function Caret() {
	const container = Block().style({
		absolute: true,
		position: { top: 0, left: 0 },
		height: 0,
		opacity: 0,
		width: 2,
		background: 'black',
		transition: [{ style: 'opacity', time: 200 }],
	})

	let interval: any

	function startBlinking() {
		let on = true
		interval = setInterval(() => {
			if (on) {
				container.style({ opacity: 0 })
				on = false
			} else {
				container.style({ opacity: 1 })
				on = true
			}
		}, 500)
	}

	function stopBlinking() {
		clearInterval(interval)
		container.style({ opacity: 1 })
	}

	return {
		...container,
		style(styles: CaretStyles) {
			container.style({ width: styles.width, borderRadius: styles.borderRadius, background: styles.color })
			if (styles.smoothTransition)
				container.style({
					transition: derive(styles.smoothTransition, transition => ({ style: ['left', 'top'], time: transition ? 75 : 0 })),
				})
			return this
		},
		move(x: number, y: number, height: number) {
			stopBlinking()
			container.style({ position: { top: y, left: x }, height })
			startBlinking()
		},
		hide() {
			stopBlinking()
			container.style({ display: false })
		},
		show() {
			startBlinking()
			container.style({ display: true })
		},
	}
}
