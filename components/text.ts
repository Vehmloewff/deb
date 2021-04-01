import { makeElement, sureGet, groupSubscribe, MaybeStorable } from '../mod.ts'

export function makeText(text: MaybeStorable<string>) {
	const el = makeElement('span')

	groupSubscribe(() => (el.raw.textContent = sureGet(text)), text)

	return el
}
