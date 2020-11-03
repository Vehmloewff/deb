/// <reference lib="dom" />

import { groupSubscribe, ensureObservable, MaybeObservable, observable, Observable } from './observable.ts'
import { domTriggeredEvents, ElementStylesAllRequired, ElementStyles, TriggeredEvents, EventDispatches } from './types.ts'

export interface CoreElement<T = HTMLElement> {
	raw: T
}

export function makeElement<T extends HTMLElement>(htmlNode: T) {
	let hovering = observable(false)
	let active = observable(false)
	let focused = observable(false)

	htmlNode.addEventListener('mouseenter', () => hovering.set(true))
	htmlNode.addEventListener('mouseleave', () => hovering.set(false))

	htmlNode.addEventListener('mousedown', () => active.set(true))
	htmlNode.addEventListener('mouseup', () => active.set(false))
	htmlNode.addEventListener('touchstart', () => active.set(true))
	htmlNode.addEventListener('touchend', () => active.set(false))

	// htmlNode.addEventListener('focus', () => focused.set(true))
	// htmlNode.addEventListener('blur', () => focused.set(false))
	let clickInside = false
	htmlNode.addEventListener('click', () => {
		clickInside = true
		focused.set(true)
	})
	window.addEventListener('click', () => {
		if (clickInside) clickInside = false
		else focused.set(false)
	})

	interface Listener {
		once: boolean
		fn: (e: any) => void
	}
	const listeners: { [k: string]: Listener[] } = {}

	let mounted = false
	let destroyed = false

	function addListener(name: string, fn: (e: any) => void, once = false) {
		if ((name === 'mount' && mounted) || (name === 'destroy' && destroyed)) fn(undefined)
		listeners[name] = [...(listeners[name] || []), { once, fn }]
	}

	function dispatchEvent(name: string, data: any) {
		if (name === 'mount') mounted = true
		else if (name === 'destroy') destroyed = true

		listeners[name] = (listeners[name] || []).filter(listener => {
			listener.fn(data)
			return !listener.once
		})
	}

	async function awaitEvent(name: string): Promise<any> {
		return new Promise(resolve => addListener(name, data => resolve(data), true))
	}

	domTriggeredEvents.forEach(name => {
		htmlNode.addEventListener(name, (e: any) => dispatchEvent(name, e))
	})

	return {
		raw: htmlNode,
		$(...children: (CoreElement | string)[]) {
			children.forEach(child => {
				if (typeof child === 'string') htmlNode.textContent = htmlNode.textContent + child
				else {
					htmlNode.appendChild(child.raw)

					// @ts-expect-error
					if (child.dispatchEvent) child.dispatchEvent('mount')
				}
			})

			return this
		},
		style(map: ElementStyles) {
			interface SetStyleValues<T = MaybeObservable<string | number>> {
				default: T
				hovering: T
				focused: T
				active: T
			}

			const setStyle = (key: keyof ElementStylesAllRequired, value: SetStyleValues) => {
				const defaultStore = ensureObservable(value.default)
				const hoveringStore = ensureObservable(value.hovering)
				const activeStore = ensureObservable(value.active)
				const focusedStore = ensureObservable(value.focused)

				const set = (value: string | number) => {
					if (typeof value === 'number') value = `${value}px`
					htmlNode.style[key] = value
				}

				groupSubscribe(
					() => {
						if (active.get()) set(activeStore.get())
						else if (hovering.get()) set(activeStore.get())
						else if (focused.get()) set(focusedStore.get())
						else set(defaultStore.get())
					},
					hovering,
					active,
					focused,
					defaultStore,
					hoveringStore,
					activeStore,
					focusedStore
				)
			}

			const getStyle = (obj: any, style: string) => {
				if (!obj) return undefined
				return obj[style]
			}

			Object.keys(map).forEach(k => {
				const key = k as keyof typeof map
				let value = map[key]

				if (value === undefined) return

				if (key === 'hovering' || key === 'active' || key === 'focused') return

				setStyle(key, {
					default: value as any,
					hovering: getStyle(map?.hovering, key),
					active: getStyle(map?.active, key),
					focused: getStyle(map?.focused, key),
				})
			})

			return this
		},
		on(handlers: TriggeredEvents) {
			for (let name in handlers) {
				const handler = handlers[name as keyof typeof handlers]
				if (!handler) continue

				addListener(name, e => handler(e))
			}

			return this
		},
		once(handlers: TriggeredEvents) {
			for (let name in handlers) {
				const handler = handlers[name as keyof typeof handlers]
				if (!handler) continue

				addListener(name, e => handler(e), true)
			}

			return this
		},
		use(fn: (self: CoreElement) => void) {
			fn(this)

			return this
		},
		async awaitEvent<K extends keyof TriggeredEvents>(name: K): Promise<EventDispatches[K]> {
			return await awaitEvent(name)
		},
		dispatchEvent<K extends keyof TriggeredEvents>(name: K, data: EventDispatches[K]) {
			dispatchEvent(name, data)
		},
		hovering,
		active,
		focused,
	}
}
