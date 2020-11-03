export type MaybeObservable<T> = Observable<T> | T

export interface Observable<T> {
	get(): T
	set(v: T): void
	subscribe(listener: Subscriber<T>): () => void
}

export interface ReadOnlyObservable<T> {
	get(): T
	subscribe(listener: Subscriber<T>): () => void
}

export type Subscriber<T> = (newVal: T, initialCall: boolean) => void

export function observable<T>(value: T): Observable<T> {
	let subscribers: Subscriber<T>[] = []

	function get(): T {
		return value
	}

	function set(newVal: T) {
		value = newVal

		subscribers.forEach(listener => listener(value, false))
	}

	function subscribe(listener: Subscriber<T>) {
		listener(value, true)

		subscribers.push(listener)

		return () => {
			const index = subscribers.indexOf(listener)
			if (index === -1) throw new Error(`Whoops, somehow lost track of the listener!`)

			subscribers.splice(index, 1)
		}
	}

	return {
		get,
		set,
		subscribe,
	}
}

export function isObservable<T>(value: MaybeObservable<T>): typeof value extends Observable<T> ? true : false
export function isObservable(value: MaybeObservable<any>): boolean {
	if (!value) return false
	if ((value as any).subscribe) return true
	return false
}

export function ensureObservable<T>(maybeStateful: MaybeObservable<T>): Observable<T> {
	if (isObservable(maybeStateful)) return maybeStateful as Observable<T>
	else return observable(maybeStateful) as Observable<T>
}

export function derive<OS, NS>(previousState: MaybeObservable<OS>, mapper: (oldValue: OS) => NS): Observable<NS> {
	return deriveMany([previousState], ([previousStateValue]) => mapper(previousStateValue))
}

type _ObservableValues<T> = T extends ReadOnlyObservable<infer U>
	? U
	: { [K in keyof T]: T[K] extends ReadOnlyObservable<infer U> ? U : never }

export function deriveMany<SA extends MaybeObservable<any>[], T>(
	previousStates: SA,
	mapper: (oldValue: _ObservableValues<SA>) => T
): Observable<T> {
	const newValue = () => mapper(previousStates.map(state => state.get()) as any)

	const newState: Observable<T> = observable(newValue())

	groupSubscribe(index => {
		if (index !== null) newState.set(newValue())
	}, ...previousStates)

	return newState
}

/**
 *
 * @param fn Calls this function every time the values of `maybeObservables` are updated.
 * The first param passed into this function is the index of the observable that changed
 * in `maybeObservables`.  `changed` will be `null` if it is the initial call.
 *
 * @param maybeObservables The observables to watch.
 */
export function groupSubscribe(fn: (changed: number | null) => void, ...maybeObservables: MaybeObservable<any>[]) {
	maybeObservables.forEach((maybeStateful, index) => {
		if (!isObservable(maybeStateful)) return

		const state = maybeStateful as Observable<any>
		state.subscribe((_, initial) => {
			if (initial) return
			fn(index)
		})
	})

	fn(null)
}

export interface TwoWayBindingOptions<O1, O2> {
	/** O1 has just emitted a new value.  What are we to set O2 to? */
	map1to2(o1Value: O1): O2
	/** O2 has just emitted a new value.  What are we to set O1 to? */
	map2to1(o2Value: O2): O1
	/** O2 has just emitted a new value, but if this function returns `true`, the emit will be ignored */
	ignoreO2Value?(o2Value: O2): boolean
	/** O1 has just emitted a new value, but if this function returns `true`, the emit will be ignored */
	ignoreO1Value?(o1Value: O1): boolean
	/** On the initial subscription, the first observable will generally set the second, but if this is `true`, the second one will set the first. */
	reverseInitialSetFlow?: boolean
}

export function twoWayBinding<O1, O2>(o1: Observable<O1>, o2: Observable<O2>, options: TwoWayBindingOptions<O1, O2>) {
	if (!options.reverseInitialSetFlow) o2.set(options.map1to2(o1.get()))
	else o1.set(options.map2to1(o2.get()))

	let internalChange = false

	o1.subscribe((val, initial) => {
		if (initial) return
		if (internalChange) return (internalChange = false)
		if (options.ignoreO1Value && options.ignoreO1Value(val)) return

		internalChange = true
		o2.set(options.map1to2(val))
	})

	o2.subscribe((val, initial) => {
		if (initial) return
		if (internalChange) return (internalChange = false)
		if (options.ignoreO2Value && options.ignoreO2Value(val)) return

		internalChange = true
		o1.set(options.map2to1(val))
	})
}

export function sureGet<T>(value: Observable<T> | T): T {
	if (isObservable(value)) return (value as Observable<T>).get()
	return value as T
}

export function readableOnly<T>(stateful: ReadOnlyObservable<T> | Observable<T>): ReadOnlyObservable<T> {
	return {
		get: stateful.get,
		subscribe: stateful.subscribe,
	}
}
