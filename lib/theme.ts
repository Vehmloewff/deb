import { Storable, storable } from './storable.ts'
import { colors } from './color.ts'

export interface DefaultTheme {
	background1: Storable<string>
	background2: Storable<string>
	background3: Storable<string>
	background4: Storable<string>
	background5: Storable<string>
	background6: Storable<string>

	foreground1: Storable<string>
	foreground2: Storable<string>
	foreground3: Storable<string>
	foreground4: Storable<string>
	foreground5: Storable<string>
	foreground6: Storable<string>

	action1: Storable<string>
	action2: Storable<string>
	action3: Storable<string>

	action1Light: Storable<string>

	danger: Storable<string>
	warn: Storable<string>
	clear: Storable<string>

	codeFontSize: Storable<string>

	paragraphFontSize: Storable<string>
	paragraphFontWeight: Storable<string>

	header1FontSize: Storable<string>
	header2FontSize: Storable<string>
	header3FontSize: Storable<string>
	header4FontSize: Storable<string>
	header5FontSize: Storable<string>
	header6FontSize: Storable<string>
	headerFontWeight: Storable<string>

	roundBorder: Storable<string>
	smallAverageBorder: Storable<string>
	mediumAverageBorder: Storable<string>
	largeAverageBorder: Storable<string>
	sharpBorder: Storable<string>
}

export const defaultTheme: DefaultTheme = {
	background1: storable(colors.white),
	background2: storable(`rgba(0, 0, 0, 0.1)`),
	background3: storable(`rgba(0, 0, 0, 0.2)`),
	background4: storable(`rgba(0, 0, 0, 0.3)`),
	background5: storable(`rgba(0, 0, 0, 0.4)`),
	background6: storable(`rgba(0, 0, 0, 0.5)`),

	foreground1: storable(colors.black),
	foreground2: storable(`rgba(255, 255, 255, 0.1)`),
	foreground3: storable(`rgba(255, 255, 255, 0.2)`),
	foreground4: storable(`rgba(255, 255, 255, 0.3)`),
	foreground5: storable(`rgba(255, 255, 255, 0.4)`),
	foreground6: storable(`rgba(255, 255, 255, 0.5)`),

	action1: storable(colors.cobalt),
	action2: storable(colors.deepOrange),
	action3: storable(colors.paleRed),

	action1Light: storable(`#0050ef12`),

	danger: storable(colors.red),
	warn: storable(colors.orange),
	clear: storable(colors.green),

	codeFontSize: storable('14px'),

	paragraphFontSize: storable('16px'),
	paragraphFontWeight: storable('regular'),

	header1FontSize: storable('34px'),
	header2FontSize: storable('28px'),
	header3FontSize: storable('24px'),
	header4FontSize: storable('20px'),
	header5FontSize: storable('18px'),
	header6FontSize: storable('16px'),
	headerFontWeight: storable('bold'),

	roundBorder: storable('50%'),
	smallAverageBorder: storable('3px'),
	mediumAverageBorder: storable('4px'),
	largeAverageBorder: storable('6px'),
	sharpBorder: storable('2px'),
}

let currentTheme: DefaultTheme = defaultTheme

export function setTheme<T extends DefaultTheme>(theme: T) {
	currentTheme = theme
}

export function getTheme(): DefaultTheme {
	return currentTheme
}
