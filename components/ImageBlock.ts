import { Element } from '../core/mod.ts'
import { Block } from '../mod.ts'
import { BlockStyles } from '../types.ts'

export function ImageBlock(img: string | Uint8Array) {
	const element = Block()
	const imageElement = Element('img')
	const raw = imageElement.raw as HTMLImageElement

	if (typeof img !== 'string') {
		const blob = new Blob([img], { type: 'image/bmp' })
		img = window.URL.createObjectURL(blob)
	}

	raw.src = img
	raw.style.width = '100%'

	return {
		...element.$(imageElement),
		style(styles: { wrapper: BlockStyles }) {
			element.style(styles.wrapper)
		},
	}
}
