import { CoreElement } from '../mod.ts'
import makeAbstractStateRouter from '../.config/deps/asr.js'

export interface MakeStateRouterOptions {
	rootElement?: HTMLElement
	// /** @default false */
	// historyRouting?: boolean
	/** @default true */
	throwOnError?: boolean
	onStateChangeAttempt?(startingFunction: Function): void
	onStateChangeStart?(state: string, params: StateTemplateParams, states: State[]): void
	onStateChangeCancelled?(err: any): void
	onStateChangeEnd?(state: string, params: StateTemplateParams, states: State[]): void
	onStateChangeError?(err: any): void
	onStateError?(err: any): void
	onRouteNotFound?(state: string, params: StateTemplateParams): void
}

export interface StateTemplateParams {
	[key: string]: boolean | string
}

export interface ResolveActions<T extends StateTemplateParams = StateTemplateParams> {
	redirect(state: string, params: T): void | T
	error(code: string, message: string): void
}

export interface State<T extends StateTemplateParams = StateTemplateParams, NT = T> {
	name: string
	route: string
	defaultParams?: T
	defaultChild?: string
	resolve?(params: T, actions: ResolveActions<T>): Promise<void | NT>
	template: (params: NT) => CoreElement
}

export interface StateGoOptions {
	/**
	 * If `true`, the new state will replace the current one in the browser history.
	 * @default false
	 */
	replace?: boolean

	/**
	 * If `true`, the current querystring parameters will be used in the new state.
	 * @default false
	 */
	inherit?: boolean
}

export type StateRouter = ReturnType<typeof makeStateRouter>

export function makeStateRouter(options: MakeStateRouterOptions = {}) {
	const rootElement = options.rootElement || document.getElementById('router-outlet')
	if (!rootElement) throw new Error(`options.rootElement was not supplied, and an element with id 'router-outlet' was not found.`)

	const historyRouting = false

	const stateRouterOptions = {
		pathPrefix: historyRouting ? '' : '#',
		router: historyRouting ? '' : undefined,
		throwOnError: options.throwOnError || true,
	}

	const stateRouter = makeAbstractStateRouter(makeRenderer, rootElement, stateRouterOptions)

	function addState<T extends StateTemplateParams, NT>(state: State<T, NT>) {
		stateRouter.addState({
			name: state.name,
			route: state.route,
			defaultParameters: state.defaultParams,
			template: state.template,
			resolve(_: any, params: T, cb: any) {
				const actions: ResolveActions<T> = {
					redirect(state, params) {
						cb.redirect(state, params)
					},
					error(code, message) {
						cb.redirect(`$$error`, { code, message })
					},
				}

				if (state.resolve) state.resolve(params, actions)
			},
		})
	}

	function go(state: string | null, params: StateTemplateParams = {}, options: StateGoOptions = {}) {
		stateRouter.go(state, params, options)
	}

	function evaluateCurrentRoute(fallbackStateName: string, fallbackStateParams: StateTemplateParams = {}) {
		stateRouter.evaluateCurrentRoute(fallbackStateName, fallbackStateParams)
	}

	function stateIsActive(stateName: string | null, stateParams: StateTemplateParams = {}): boolean {
		return stateRouter.stateIsActive(stateName || stateRouter.getActiveState()?.name, stateParams)
	}

	function makePath(stateName: string | null, stateParams: StateTemplateParams = {}) {
		return stateRouter.makePath(stateName || stateRouter.getActiveState()?.name, stateParams)
	}

	function getActiveState(): { name: string; params: StateTemplateParams } {
		return stateRouter.getActiveState()
	}

	stateRouter.on('StateChangeAttempt', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateChangeAttempt) options.onStateChangeAttempt(...args)
	})
	stateRouter.on('StateChangeStart', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateChangeStart) options.onStateChangeStart(...args)
	})
	stateRouter.on('StateChangeCancelled', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateChangeCancelled) options.onStateChangeCancelled(...args)
	})
	stateRouter.on('StateChangeEnd', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateChangeEnd) options.onStateChangeEnd(...args)
	})
	stateRouter.on('StateChangeError', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateChangeError) options.onStateChangeError(...args)
	})
	stateRouter.on('StateError', (...args: any[]) => {
		// @ts-expect-error
		if (options.onStateError) options.onStateError(...args)
	})
	stateRouter.on('RouteNotFound', (...args: any[]) => {
		// @ts-expect-error
		if (options.onRouteNotFound) options.onRouteNotFound(...args)
	})

	return { addState, go, evaluateCurrentRoute, stateIsActive, makePath, getActiveState }
}

function makeRenderer(stateRouter: any) {
	return {
		render: function render(context: any) {
			const rendered = context.template(context.content)
			context.element.appendChild(rendered)
			return rendered
		},
		reset: function reset(context: any) {
			if (context.domApi.setParams) context.domApi.setParams(context.content)
		},
		destroy: function destroy(renderedTemplateApi: any) {
			renderedTemplateApi.raw.remove()
		},
		getChildElement: function getChildElement(coreElement: any) {
			const res = (coreElement.raw as Element).querySelector('#router-outlet')
			if (!res)
				throw new Error(`Every time a child route is navigated to, there must be an element with the 'route-outlet' id on it.`)
			return res
		},
	}
}
