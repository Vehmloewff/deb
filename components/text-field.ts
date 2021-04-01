import {
	makeText,
	makeElement,
	MaybeStorable,
	groupSubscribe,
	sureGet,
	makeDivision,
	getTheme,
	derive,
	isStorable,
	Storable,
	storable,
} from '../mod.ts'

export interface TextFieldOptions {
	label?: MaybeStorable<string>
	placeholder?: MaybeStorable<string>
	help?: MaybeStorable<string>
	hideCharacters?: MaybeStorable<boolean>
	error?: MaybeStorable<boolean>
	// inputAppend?: MaybeStorable<BareElement>
	// inputPrepend?: MaybeStorable<BareElement>
	disableTwoWayBinding?: boolean
	multiline?: boolean
}

export function makeTextField(text: MaybeStorable<string>, options: TextFieldOptions = {}) {
	const error = options.error || storable(false)

	const container = makeElement('label')
	const label = makeDivision().$(
		makeText(options.label ? options.label : '').style({
			fontSize: getTheme().smallTextSize,
			fontWeight: 'bold',
			textTransform: 'uppercase',
			color: derive(error, e => (e ? getTheme().danger : getTheme().textFieldHelpColor)),
		})
	)
	const input = makeElement(options.multiline ? 'textarea' : 'input').style({
		width: '100%',
		padding: 'none',
		margin: 'none',
		border: 'none',
		outline: 'none',
		resize: 'none',
		height: options.multiline ? '44px' : 'unset',
		background: 'rgba(0, 0, 0, 0)',
		caretColor: derive(error, e => (e ? getTheme().danger : getTheme().action1)),
	})

	groupSubscribe(
		() => {
			if (options.hideCharacters && sureGet(options.hideCharacters)) input.raw.setAttribute('type', 'password')
			else input.raw.setAttribute('type', 'text')

			if (options.placeholder) input.raw.setAttribute('placeholder', sureGet(options.placeholder))
		},
		options.hideCharacters,
		options.placeholder
	)

	let editCausedByInput = false

	groupSubscribe(() => {
		if (editCausedByInput) return (editCausedByInput = false)
		input.raw.value = sureGet(text)
	}, text)

	input.on({
		input(e) {
			if (isStorable(text) && !options.disableTwoWayBinding) {
				editCausedByInput = true
				;(text as Storable<string>).set(input.raw.value)
			}
			container.emit('input', e)

			const floor = (num: number, floor: number) => (num < floor ? floor : num)

			input.raw.style.height = `0px`
			input.raw.style.height = `${floor(input.raw.scrollHeight, 44)}px`
		},
	})

	container.$(
		label,
		makeDivision()
			.style({
				background: getTheme().textFieldBackground,
				borderRadius: getTheme().mediumAverageBorder,
				padding: '6px 10px',
				border: derive(error, e => `1px solid ${e ? getTheme().danger : 'rgba(0, 0, 0, 0)'}`),
			})
			.styleScope('focus', {
				border: derive(error, e => `1px solid ${e ? getTheme().danger : getTheme().textFieldHighlights}`),
			})
			.$(makeDivision().$(input))
	)

	if (options.help)
		container.$(
			makeDivision()
				.style({
					fontSize: getTheme().tinyTextSize,
					color: derive(error, e => (e ? getTheme().danger : getTheme().textFieldHelpColor)),
					paddingTop: '6px',
				})
				.$(makeText(options.help))
		)

	function focus() {
		input.raw.focus()
	}

	return {
		focus,
		...container,
	}
}
