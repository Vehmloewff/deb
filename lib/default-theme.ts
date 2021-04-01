import { colors } from './color.ts'

export class DefaultThemeValues {
	// Background colors
	background1 = colors.white
	background2 = 'rgb(245, 245, 245)'
	background3 = 'rgb(235, 235, 235)'
	background4 = 'rgb(225, 225, 225)'
	background5 = 'rgb(215, 215, 215)'
	background6 = 'rgb(105, 105, 105)'

	// Foreground colors
	foreground1 = colors.black
	foreground2 = 'rgb(20, 20, 20)'
	foreground3 = 'rgb(40, 40, 40)'
	foreground4 = 'rgb(60, 60, 60)'
	foreground5 = 'rgb(80, 80, 80)'
	foreground6 = 'rgb(100, 100, 100)'

	// Action colors
	action1 = colors.cobalt
	action2 = colors.deepOrange
	action3 = colors.paleRed

	// Message colors
	notice = colors.cobalt
	danger = colors.red
	warn = colors.orange
	success = colors.green

	// Font styles
	tinyTextSize = '12px'
	smallTextSize = '14px'
	paragraphFontSize = '16px'
	paragraphFontWeight = 'regular'
	header1FontSize = '34px'
	header2FontSize = '28px'
	header3FontSize = '24px'
	header4FontSize = '20px'
	header5FontSize = '18px'
	header6FontSize = '16px'
	headerFontWeight = 'bold'

	// Border radius'
	roundBorder = '50%'
	smallAverageBorder = '3px'
	mediumAverageBorder = '4px'
	largeAverageBorder = '6px'
	sharpBorder = '2px'

	// Buttons
	buttonBackground = this.action1
	buttonForeground = colors.white
	secondaryButtonBackground = this.background4
	secondaryButtonForeground = colors.black

	// Inputs
	textFieldBackground = this.background3
	textFieldForeground = this.foreground1
	textFieldHighlights = this.action1
	textFieldLabelColor = this.foreground6
	textFieldHelpColor = this.foreground6

	// Message Blocks
	quoteBlockHighlights = 'rgba(255,232,105,1)'
	quoteBlockForeground = this.foreground1
	noticeBlockHighlights = this.notice
	noticeBlockForeground = this.foreground1
	warnBlockHighlights = this.warn
	warnBlockForeground = this.foreground1
	dangerBlockHighlights = this.danger
	dangerBlockForeground = this.foreground1
	successBlockHighlights = this.success
	successBlockForeground = this.foreground1

	// Alerts
	noticeAlertBackground = this.notice
	noticeAlertForeground = colors.white
	warnAlertBackground = this.warn
	warnAlertForeground = colors.white
	dangerAlertBackground = this.danger
	dangerAlertForeground = colors.white
	successAlertBackground = this.success
	successAlertForeground = colors.white

	// Code blocks
	codeBlockForeground = this.foreground1
	codeBlockBackground = this.background3

	// Code spans
	inlineCodeBackground = this.background3
	inlineCodeForeground = this.foreground1

	// Links
	linksColor = this.action1
}
