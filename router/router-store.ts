import { StateRouter, State, StateTemplateParams, StateGoOptions } from './mod.ts'

let router: StateRouter | null = null

export function setRouter(stateRouter: StateRouter) {
	router = stateRouter
}

export function getRouter() {
	return procure()
}

export function addState<T extends StateTemplateParams, NT>(state: State<T, NT>): void
export function addState(state: State) {
	procure().addState(state)
}

export function go(state: string | null, params: StateTemplateParams = {}, options: StateGoOptions = {}) {
	procure().go(state, params, options)
}

export function evaluateCurrentRoute(fallbackStateName: string, fallbackStateParams: StateTemplateParams = {}) {
	procure().evaluateCurrentRoute(fallbackStateName, fallbackStateParams)
}

export function stateIsActive(stateName: string | null, stateParams: StateTemplateParams = {}): boolean {
	return procure().stateIsActive(stateName, stateParams)
}

export function makePath(stateName: string | null, stateParams: StateTemplateParams = {}) {
	return procure().makePath(stateName, stateParams)
}

export function getActiveState(): { name: string; params: StateTemplateParams } {
	return procure().getActiveState()
}

function procure() {
	if (!router) throw new Error(`The state router has not been set.  Did you forget to call 'setRouter' first?`)
	return router
}
