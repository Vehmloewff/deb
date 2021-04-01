import { makeElement, MaybeStorable, derive } from '../mod.ts'

export function makeSpacer(height: MaybeStorable<number>) {
	return makeElement('div').style({ height: derive(height, h => `${h}px`) })
}

export function makeVerticalSpacer(width: MaybeStorable<number>) {
	return makeElement('div').style({ width: derive(width, h => `${h}px`), display: 'inline-block' })
}
