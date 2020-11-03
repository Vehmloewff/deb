import { CoreElement, Observable, observable, getContext, setContext, Color } from './mod.ts'

export interface DefaultTheme {
	background1: Color
	background2: Color
	background3: Color
	background4: Color
	background5: Color
	background6: Color

	foreground1: Color
	foreground2: Color
	foreground3: Color
	foreground4: Color
	foreground5: Color
	foreground6: Color

	action1: Color
	action2: Color
	action3: Color

	danger: Color
	warn: Color
	clear: Color
}

export interface ObservableTheme {
	background1: Observable<Color>
	background2: Observable<Color>
	background3: Observable<Color>
	background4: Observable<Color>
	background5: Observable<Color>
	background6: Observable<Color>

	foreground1: Observable<Color>
	foreground2: Observable<Color>
	foreground3: Observable<Color>
	foreground4: Observable<Color>
	foreground5: Observable<Color>
	foreground6: Observable<Color>

	action1: Observable<Color>
	action2: Observable<Color>
	action3: Observable<Color>

	danger: Observable<Color>
	warn: Observable<Color>
	clear: Observable<Color>
}

export function setTheme<T extends CoreElement>(element: T, theme: DefaultTheme) {
	setContext(element, 'theme', theme)
	return element
}

export function getTheme<T extends ObservableTheme>(element?: CoreElement): ObservableTheme {
	const theme = {
		background1: observable('' as Color),
		background2: observable('' as Color),
		background3: observable('' as Color),
		background4: observable('' as Color),
		background5: observable('' as Color),
		background6: observable('' as Color),

		foreground1: observable('' as Color),
		foreground2: observable('' as Color),
		foreground3: observable('' as Color),
		foreground4: observable('' as Color),
		foreground5: observable('' as Color),
		foreground6: observable('' as Color),

		action1: observable('' as Color),
		action2: observable('' as Color),
		action3: observable('' as Color),

		danger: observable('' as Color),
		warn: observable('' as Color),
		clear: observable('' as Color),
	} as T

	if (!element) element = { raw: document.getElementsByClassName('app-container')[0] as HTMLElement }
	if (!element?.raw) throw new Error(`Did not provide an element, and could not guess the root.`)

	getContext(element, 'theme')
		.then(ctx => {
			if (!ctx) throw ``
			ctx.subscribe(data => {
				Object.keys(data).forEach(key => {
					// @ts-expect-error
					theme[key].set(data[key])
				})
			})
		})
		.catch(() => {
			throw new Error(`Could not get the theme.  Did you set it on the root element?`)
		})

	return theme
}

export const defaultTheme: DefaultTheme = {
	background1: 'white',
	background2: 'white',
	background3: 'white',
	background4: 'white',
	background5: 'white',
	background6: 'white',

	foreground1: 'black',
	foreground2: 'black',
	foreground3: 'black',
	foreground4: 'black',
	foreground5: 'black',
	foreground6: 'black',

	action1: 'cobalt',
	action2: 'cobalt',
	action3: 'cobalt',

	danger: 'red',
	warn: 'orange',
	clear: 'green',
}
