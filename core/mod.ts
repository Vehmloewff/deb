/// <reference lib="dom" />

import { applyCSS, minify } from '../lib/css.ts'
import { makeElement } from './element.ts'
import normalizeCss from '../css/normalize.css.ts'

export * from './element.ts'
export * from './observable.ts'

export interface AppRootOptions {
	selectorOverride?: string
	elementOverride?: HTMLElement
	normalizeCSS?: boolean
}

export function AppRoot(options: AppRootOptions = {}) {
	if (options.normalizeCSS) applyCSS(minify(normalizeCss))
	return makeElement(document.body)
}

export type ElementCreationTypes = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap

export function Element(type: ElementCreationTypes) {
	return makeElement(document.createElement(type))
}
