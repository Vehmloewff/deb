export const colors = {
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

type RGBA = [number, number, number, number]

function parseHex(hex: string): RGBA {
	const hexCharacters = 'a-f\\d'
	const match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`
	const match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`
	const nonHexChars = new RegExp(`[^#${hexCharacters}]`, 'gi')
	const validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, 'i')

	if (typeof hex !== 'string' || nonHexChars.test(hex) || !validHexSize.test(hex)) {
		throw new TypeError(`Invalid hex color: ${hex}`)
	}

	hex = hex.replace(/^#/, '')
	let alpha = 1

	if (hex.length === 8) {
		alpha = Number.parseInt(hex.slice(6, 8), 16) / 255
		hex = hex.slice(0, 6)
	}

	if (hex.length === 4) {
		alpha = Number.parseInt(hex.slice(3, 4).repeat(2), 16) / 255
		hex = hex.slice(0, 3)
	}

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
	}

	const number = Number.parseInt(hex, 16)
	const red = number >> 16
	const green = (number >> 8) & 255
	const blue = number & 255

	return [red, green, blue, alpha]
}

function parseRgbString(rgbString: string): RGBA {
	const errorOut = () => {
		throw new Error(`Invalid rgb string: ${rgbString}`)
	}
	const numbers = rgbString
		.replace(/rgba?/, '')
		.trim()
		.slice(1, -1)
		.split(',')
		.map(s => Number(s.trim()))

	numbers.forEach((num, index) => {
		if (isNaN(num)) errorOut()

		if (index === 3 && (num > 1 || num < 0)) errorOut()
		else if (num > 255 || num < 0) errorOut()
	})

	if (numbers.length < 3 || numbers.length > 4) errorOut()
	if (numbers.length === 3) numbers.push(1)

	// @ts-expect-error validation is above
	return numbers
}

function parseColor(color: string): RGBA {
	color = color.trim()
	if (color.startsWith('#')) return parseHex(color)
	if (color.startsWith('rgb')) return parseRgbString(color)
	if (color.startsWith('hsl')) throw new Error(`HSL colors are not supported: ${color}`)
	throw new Error(`Invalid color: ${color}`)
}
function stringifyColor(rgba: RGBA): string {
	if (rgba[3] === 1) return `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`
	return `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`
}

function lighten(color: string, amount = 20) {
	const parsed = parseColor(color)

	parsed[0] += amount
	parsed[1] += amount
	parsed[2] += amount

	return stringifyColor(parsed)
}

function darken(color: string, amount = 20) {
	const parsed = parseColor(color)

	parsed[0] -= amount
	parsed[1] -= amount
	parsed[2] -= amount

	return stringifyColor(parsed)
}

function mediumize(color: string, amount = 20) {
	if (colorIsDark(color)) return lighten(color, amount)
	return darken(color, amount)
}

function similarize(color: string, amount = 20) {
	if (colorIsDark(color)) return darken(color, amount)
	return lighten(color, amount)
}

function lowerAlpha(color: string, amount = 0.1) {
	return setAlpha(color, getAlpha(color) - amount)
}
function raiseAlpha(color: string, amount = 0.1) {
	return setAlpha(color, getAlpha(color) + amount)
}

function colorIsDark(color: string) {
	const [r, g, b] = parseColor(color)

	// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
	const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

	return hsp < 127.5
}

function setAlpha(color: string, alpha: number) {
	if (alpha > 1) alpha = 1
	else if (alpha < 0) alpha = 0

	const parsed = parseColor(color)
	parsed[3] = alpha

	return stringifyColor(parsed)
}
function getAlpha(color: string): number {
	return parseColor(color)[3]
}

export const colorModifiers = {
	colorIsDark,
	setAlpha,
	getAlpha,
	raiseAlpha,
	lowerAlpha,
	similarize,
	mediumize,
	darken,
	lighten,
	stringifyColor,
	parseColor,
}
