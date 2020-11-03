import { CoreElement, observable, Observable } from './mod.ts'

const CONTEXT_ID_ATTR = 'data-context-id'
const CONTEXT_SEPARATOR = ':$:%:*&^@:%:$:'

const contextMap: Map<string, Observable<any>> = new Map()
let counter = 0

export function setContext(element: CoreElement, key: string, context: any) {
	let contextId = element.raw.getAttribute(CONTEXT_ID_ATTR)

	if (!contextId) {
		contextId = String(counter++)
		element.raw.setAttribute(CONTEXT_ID_ATTR, contextId)
	}

	const newObservableContext = () => {
		const observableContext = observable(context)
		contextMap.set(contextId + CONTEXT_SEPARATOR + key, observableContext)
		return observableContext
	}

	const observableContext = contextMap.get(contextId + CONTEXT_SEPARATOR + key) || newObservableContext()
	observableContext.set(context)
}

export async function getContext(element: CoreElement, key: string): Promise<Observable<any> | null> {
	const testId = element.raw.getAttribute(CONTEXT_ID_ATTR)
	if (testId) return contextMap.get(testId + CONTEXT_SEPARATOR + key) || null

	if (!element.raw.parentElement) await tryOnMount(element)
	if (!element.raw.parentElement) throw new Error(`Element did not have a parent, and we could not locate an effective on-mount listener`)

	let contextId: string | null = null
	let current: HTMLElement | null = element.raw.parentElement
	while (current) {
		const id = current.getAttribute(CONTEXT_ID_ATTR)
		if (id) {
			contextId = id
			break
		}

		current = current.parentElement
	}

	if (!contextId) throw new Error(`Could not find context`)

	return contextMap.get(contextId + CONTEXT_SEPARATOR + key) || null
}

async function tryOnMount(element: CoreElement) {
	try {
		// @ts-expect-error
		await element.awaitEvent('mount')
	} catch (e) {}
}
