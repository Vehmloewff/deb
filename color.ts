export const colorDefaults = {
	red: `#f44336`,
	tomato: `#ff6347`,
	pink: `#e91e63`,
	violet: `#ee82ee`,
	purple: `#9c27b0`,
	deepPurple: `#673ab7`,
	indigo: `#3f51b5`,
	blue: `#2196f3`,
	dodgerBlue: `#1e90ff`,
	lightBlue: `#87ceeb`,
	slateBlue: `#6a5acd`,
	cobalt: `#0050ef`,
	cyan: `#00bcd4`,
	aqua: `#00ffff`,
	teal: `#009688`,
	green: `#4caf50`,
	seaGreen: `#3cb371`,
	lightGreen: `#8bc34a`,
	darkGreen: `#096347`,
	lime: `#cddc39`,
	sand: `#fdf5e6`,
	khaki: `#f0e68c`,
	yellow: `#ffeb3b`,
	amber: `#ffc107`,
	orange: `#ff9800`,
	deepOrange: `#ff5722`,
	blueGray: `#607d8b`,
	blueGrey: `#607d8b`,
	brown: `#795548`,
	lightGray: `#f1f1f1`,
	lightGrey: `#f1f1f1`,
	gray: `#f1f1f1`,
	grey: `#f1f1f1`,
	darkGray: `#616161`,
	darkGrey: `#616161`,
	paleRed: `#ffdddd`,
	paleYellow: `#ffffcc`,
	paleGreen: `#ddffdd`,
	paleBlue: `#ddffff`,
	black: `#000000`,
	white: `#ffffff`,
}

export type ColorStrings =
	| 'red'
	| 'tomato'
	| 'pink'
	| 'violet'
	| 'purple'
	| 'deepPurple'
	| 'indigo'
	| 'blue'
	| 'dodgerBlue'
	| 'lightBlue'
	| 'slateBlue'
	| 'cobalt'
	| 'cyan'
	| 'aqua'
	| 'teal'
	| 'green'
	| 'seaGreen'
	| 'lightGreen'
	| 'darkGreen'
	| 'lime'
	| 'sand'
	| 'khaki'
	| 'yellow'
	| 'amber'
	| 'orange'
	| 'deepOrange'
	| 'blueGray'
	| 'blueGrey'
	| 'brown'
	| 'lightGray'
	| 'lightGrey'
	| 'gray'
	| 'grey'
	| 'darkGray'
	| 'darkGrey'
	| 'paleRed'
	| 'paleYellow'
	| 'paleGreen'
	| 'paleBlue'
	| 'black'
	| 'white'

export interface LinearGrad {
	type: 'linear-grad'
	stops: { color: Color; starts: number }[]
	angle?: number
	hint?: number
}

export interface RadialGrad {
	type: 'radial-grad'
	position?: { x: number; y: number }
	stops: { color: Color; starts: number }[]
	hint?: number
	circle?: boolean
	extent?: 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
}

export function makeLinearGrad(stops: { color: Color; starts: number }[], options: { angle?: number; hint?: number } = {}): LinearGrad {
	return {
		type: 'linear-grad',
		stops,
		...options,
	}
}

export function makeHex(hex: string): Color {
	if (!hex.startsWith('#')) hex = '#' + hex

	return {
		hex,
	}
}

export function makeRgb(red: number, green: number, blue: number, alpha?: number): Color {
	return {
		rgb: [red, green, blue, alpha],
	}
}

export type Color =
	| ColorStrings
	| {
			rgb?: [number, number, number, number?]
			hex?: string
	  }
	| LinearGrad
	| RadialGrad
	| Color[]
