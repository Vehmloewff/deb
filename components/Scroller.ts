import { BlockStyles } from '../types.ts'
import { Block } from './mod.ts'

export function Scroller() {
	const container = Block()
	const scrollContent = Block().style({ absolute: true, position: { top: 0, left: 0 } })
	const scrollTrackY = Block().style({ absolute: true, position: { top: 0, right: 0, bottom: 0 }, width: 10, background: 'black' })
	const scrollTrackX = Block().style({ absolute: true, position: { right: 0, bottom: 0, left: 0 }, height: 10, background: 'black' })

	Block().$(scrollContent, scrollTrackY, scrollTrackX)

	const self = {
		...container,
		$: scrollContent.$,
		style(styles: { container: BlockStyles }) {
			if (styles.container) container.style(styles.container)
		},
	}

	return self
}
