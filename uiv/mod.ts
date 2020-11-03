import { Input, inputWholeString } from '../components/Input.ts'
import { Block } from '../components/mod.ts'
import { Observable } from '../core/mod.ts'
import { CoreElement, Icon, Label } from '../mod.ts'

export function makeUiVisualizer(name: string, ...components: UivComponent[]) {
	return Block()
		.style({ alignX: 'start' })
		.$(
			// sidebar
			Block()
				.style({
					width: 230,
					background: 'paleRed',
					alignY: 'top',
					stackY: true,
					padding: { top: 5, bottom: 5, right: 16, left: 16 },
				})
				.vertical()
				.$(
					// sidebar header
					Block()
						.style({ height: 40 })
						.$(
							Block()
								.style({ alignX: 'start' })
								.$(Label(name).style({ weight: 'bold', allowSelection: true })),
							Block()
								.packX()
								.$(Icon('dots-horizontal').style({ size: 24 }))
						),
					// sidebar search
					Block()
						.style({
							padding: 5,
							border: { color: 'black', width: 1, style: 'solid' },
							borderRadius: 4,
							focused: { border: { color: 'blue', width: 1, style: 'solid' } },
							height: 20,
						})
						.$(Input(inputWholeString(`hello there`)).style({ caret: { color: 'blue' } }))
				),
			// main
			Block().style({ background: 'paleBlue' })
		)
}

export interface UivComponent {
	name: string
	stories: UivStory[]
}

export function uivComponent(name: string, ...stories: UivStory[]): UivComponent {
	return {
		name,
		stories,
	}
}

export interface UivStory {
	description: string
	component: CoreElement
	props: (
		| {
				name: string
				type: 'string'
				observable: Observable<string>
		  }
		| { name: string; type: 'number'; min: number | null; max: number | null; observable: Observable<number> }
		| { name: string; type: 'select'; values: string[]; observable: Observable<string> }
	)[]
}

export interface UivStoryActions {
	editString(name: string, observable: Observable<string>): void
	editNumber(name: string, observable: Observable<number>, options?: { min?: number; max?: number }): void
	selectStrings(name: string, observable: Observable<string>, values: string[]): void
}

export function uivStory(description: string, fn: (actions: UivStoryActions) => CoreElement): UivStory {
	const props: UivStory['props'] = []

	const actions: UivStoryActions = {
		editString(name, observable) {
			props.push({ name, type: 'string', observable })
		},
		editNumber(name, observable, options = {}) {
			props.push({ name, type: 'number', observable, min: options.min || null, max: options.max || null })
		},
		selectStrings(name, observable, values) {
			props.push({ name, type: 'select', observable, values: values })
		},
	}

	const component = fn(actions)

	return {
		description,
		component,
		props,
	}
}
