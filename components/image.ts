import { makeElement, MaybeStorable, groupSubscribe, sureGet } from '../mod.ts'

export interface MakeImageOptions {
	alt?: MaybeStorable<string>
}

export function makeImage(src: MaybeStorable<string>, options: MakeImageOptions = {}) {
	const img = makeElement('img')

	groupSubscribe(
		() => {
			img.raw.src = sureGet(src)
			if (options.alt) img.raw.setAttribute('alt', sureGet(options.alt))
		},
		src,
		options.alt
	)

	return img
}
