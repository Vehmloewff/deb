/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any no-undef

import { MaybeStorable, sureGet, groupSubscribe, Storable, isStorable } from './storable.ts'
import { themeChanges } from './theme-acceptor.ts'

export type ElementStyles = {
	[P in keyof CSSStyleDeclaration]?: MaybeStorable<CSSStyleDeclaration[P]>
}

export type BuiltinEventMap = {
	[P in keyof HTMLElementEventMap]: HTMLElementEventMap[P]
}

export type CustomEventMap = {
	[key: string]: any
}
export type EventMap = BuiltinEventMap & CustomEventMap

export type EventListeners<T extends HTMLElement> = {
	[P in keyof EventMap]?: MaybeStorable<(e: EventMap[P], el: Element<T>) => Promise<void> | void>
}

export type StyleScopes = 'hover' | 'active' | 'focused' | string
export type Child = MaybeStorable<BareElement | string>

export interface Element<T extends HTMLElement = HTMLElement> {
	style(styles: ElementStyles): Element<T>
	styleScope(name: StyleScopes, styles: ElementStyles): Element<T>
	activateStyleScope(scope: StyleScopes): void
	deactivateStyleScope(scope: StyleScopes): void
	conditional(condition: MaybeStorable<any>, children: Child[]): Element<T>
	$(...children: Child[]): Element<T>
	children(children: Child[]): Element<T>
	forEach<IT>(items: MaybeStorable<IT[]>, fn: (item: IT, index: number) => BareElement | string): Element<T>
	on(eventListeners: EventListeners<T>): Element<T>
	emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void
	listen<K extends keyof EventListeners<T>>(event: K, listener: EventListeners<T>[K]): () => void
	raw: T
}

export interface BareElement<T extends HTMLElement = HTMLElement> {
	raw: T
}

export function makeElement<K extends keyof HTMLElementTagNameMap>(type: K | HTMLElementTagNameMap[K]): Element<HTMLElementTagNameMap[K]> {
	const raw = typeof type === 'string' ? document.createElement(type) : type
	const sm = stylesManager({ applyStyles })
	const em = eventsManager({
		registerEvent(name, fn) {
			raw.addEventListener(name, fn)
		},
		removeEventListener(name, fn) {
			raw.removeEventListener(name, fn)
		},
	})

	function applyStyles(styles: Partial<CSSStyleDeclaration>) {
		// Remove all existing styles
		raw.style.cssText = ``

		// Add everything back on
		for (const style in styles) {
			const value = styles[style]
			if (value === undefined) continue

			raw.style[style] = value
		}
	}

	const result: Element<HTMLElementTagNameMap[K]> = {
		style,
		styleScope,
		activateStyleScope: sm.activateStyleScope,
		deactivateStyleScope: sm.deactivateStyleScope,
		$,
		conditional,
		children,
		forEach,
		on,
		emit: em.emit,
		listen: em.listen,
		raw,
	}

	// I'm re-stating these functions so that they can return `child` for chaining purposes
	function style(styles: ElementStyles) {
		sm.style(styles)
		return result
	}
	function styleScope(name: string, styles: ElementStyles) {
		sm.styleScope(name, styles)
		return result
	}

	let childrenAndConditions: { condition: MaybeStorable<any>; children: Child[] }[] = []
	let destroyPreviousChildren: (() => void) | null = null

	function $(...children: Child[]) {
		childrenAndConditions.push({
			condition: true,
			children,
		})

		renderChildren()

		return result
	}

	function conditional(condition: MaybeStorable<any>, children: Child[]) {
		childrenAndConditions.push({
			condition,
			children,
		})

		groupSubscribe(() => renderChildren(), condition)

		return result
	}

	function children(children: Child[]) {
		childrenAndConditions = [{ condition: true, children }]
		renderChildren()

		return result
	}

	function forEach<IT>(items: MaybeStorable<IT[]>, fn: (item: IT, index: number) => Child) {
		let oldMap: null | { item: IT; child: Child }[] = null
		let indexInConditions: null | number = null

		groupSubscribe(() => {
			const newItems = sureGet(items)
			const newChildrenCast: (Child | null)[] = []

			newItems.forEach(() => newChildrenCast.push(null))

			if (oldMap)
				oldMap.forEach(({ item, child }) => {
					const newItemIndex = newItems.indexOf(item)
					if (newItemIndex === -1) return

					newChildrenCast.splice(newItemIndex, 1, child)
				})

			const newChildren = newChildrenCast.map((newChild, index) => {
				if (newChild) return newChild

				return fn(newItems[index], index)
			})

			if (indexInConditions === null) {
				indexInConditions = childrenAndConditions.length

				childrenAndConditions.push({
					condition: newChildren.length !== 0,
					children: newChildren,
				})
			} else {
				childrenAndConditions[indexInConditions] = { condition: newChildren.length !== 0, children: newChildren }
			}

			renderChildren()

			oldMap = newItems.map((item, index) => ({ item, child: newChildren[index] }))
		}, items)

		return result
	}

	function renderChildren() {
		if (destroyPreviousChildren) destroyPreviousChildren()

		for (const { condition, children } of childrenAndConditions) {
			if (sureGet(condition)) {
				const unsubscribers: (() => void)[] = []

				destroyPreviousChildren = () => {
					children.forEach(child => {
						// @ts-expect-error the emit property just might be on the child
						if (typeof child !== 'string' && child.emit) child.emit('destroy', raw)
					})

					raw.innerHTML = ``
				}

				children.forEach((child, index) => {
					if (isStorable(child)) {
						let oldEl: null | BareElement = null

						unsubscribers.push(
							child.subscribe(child => {
								if (oldEl) {
									// @ts-expect-error the emit property just might be on the child
									if (oldEl.emit) oldEl.emit('destroy', raw)

									oldEl.raw.remove()
								}

								insertElement(result, index, child)

								if (typeof child !== 'string') oldEl = child
							})
						)
					} else insertElement(result, null, child)
				})

				break
			}
		}
	}

	function on(eventListeners: EventListeners<any>) {
		em.on(eventListeners)
		return result
	}

	let clickInside = false

	em.on({
		mouseover: () => sm.activateStyleScope('hover'),
		mouseout: () => sm.deactivateStyleScope('hover'),
		click: () => {
			clickInside = true
			sm.activateStyleScope('after')
			sm.activateStyleScope('focus')
		},
		mousedown: () => sm.activateStyleScope('active'),
		mouseup: () => sm.deactivateStyleScope('active'),
		focus: () => sm.activateStyleScope('focus'),
		focusIn: () => sm.activateStyleScope('focus'),
		blur: () => sm.deactivateStyleScope('focus'),
		clickOutside: () => sm.deactivateStyleScope('focus'),
	})

	document.addEventListener('click', e => {
		if (clickInside) return (clickInside = false)
		em.emit('clickOutside', e)
	})

	sm.activateStyleScope('default')

	return result
}

interface StylesManagerParams {
	applyStyles(styles: Partial<CSSStyleDeclaration>): void
}

function stylesManager(params: StylesManagerParams) {
	const styleScopes: Map<string, ElementStyles> = new Map()
	const activeScopes: StyleScopes[] = []

	const scopeIsActive = (scope: string) => activeScopes.indexOf(scope) !== -1
	const lastUnSubscribers: (() => void)[] = []

	function editStyle() {
		lastUnSubscribers.forEach(fn => fn())
		const activeStyles: Partial<CSSStyleDeclaration> = {}

		activeScopes.forEach(scope => {
			const styles = styleScopes.get(scope)
			if (!styles) return

			for (const style in styles) {
				const value = styles[style]

				lastUnSubscribers.push(
					groupSubscribe(changed => {
						if (changed === 0) editStyle()
					}, value)
				)

				activeStyles[style] = sureGet(value)
			}
		})

		params.applyStyles(activeStyles)
	}

	function style(styles: ElementStyles) {
		styleScopes.set('default', styles)
		if (scopeIsActive('default')) editStyle()
	}
	function styleScope(name: string, styles: ElementStyles) {
		styleScopes.set(name, styles)
		if (scopeIsActive(name)) editStyle()
	}

	function activateStyleScope(scope: string) {
		if (activeScopes[activeScopes.length - 1] === scope) return

		const index = activeScopes.indexOf(scope)
		if (index === -1) activeScopes.push(scope)
		else {
			activeScopes.splice(index, 1)
			activeScopes.push(scope)
		}

		if (styleScopes.has(scope)) editStyle()
	}

	function deactivateStyleScope(scope: string) {
		const index = activeScopes.indexOf(scope)
		if (index === -1) return

		activeScopes.splice(index, 1)

		if (styleScopes.has(scope)) editStyle()
	}

	themeChanges().subscribe(() => editStyle())

	return { style, styleScope, activateStyleScope, deactivateStyleScope }
}

interface EventsManagerParams {
	registerEvent(name: string, fn: (eventData: any) => void): void

	removeEventListener(name: string, fn: (eventData: any) => void): void
}

function eventsManager(params: EventsManagerParams, element: Element<any>) {
	const listeners: Record<string, ((e: any) => void)[]> = {}

	function on(eventListeners: EventListeners<any>) {
		for (const event in eventListeners) {
			const listener = eventListeners[event as keyof EventListeners<any>]
			if (!listener) continue
			listen(event, listener)
		}
	}

	function emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
		if (!listeners[event as string]) return
		listeners[event as string].forEach(fn => fn(data))
	}

	function listen<K extends keyof EventListeners<any>>(event: K, listener: EventListeners<any>[K]) {
		if (!listeners[event as string]) listeners[event as string] = []

		const fn = (e: any) => {
			if (!listener) return

			sureGet(listener as Storable<any>)(e, element)
		}

		listeners[event as string].push(fn)
		params.registerEvent(event as string, fn)

		return () => {
			const index = listeners[event as string].indexOf(fn)
			if (index === -1) throw new Error(`The listener was there, then it wasn't!`)

			listeners[event as string].splice(index, 1)
			params.removeEventListener(event as string, fn)
		}
	}

	return {
		on,
		emit,
		listen,
	}
}

function insertElement(parent: BareElement, index: number | null, child: BareElement | string) {
	const childElement = typeof child === 'string' ? document.createTextNode(child) : child.raw

	const beforeElement = index === null ? null : parent.raw.children.item(index + 1) || null

	parent.raw.insertBefore(childElement, beforeElement)
}
