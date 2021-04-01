import { makeElement, MaybeStorable, makeText, getTheme, derive, colorModifiers, sureGet } from '../mod.ts'

export interface MakeButtonOptions {
	secondary?: boolean
	disabled?: MaybeStorable<boolean>
	large?: boolean
	block?: boolean
	href?: MaybeStorable<string>
}

export function makeButton(label: MaybeStorable<string>, options: MakeButtonOptions = {}) {
	const disabled = options.disabled || false
	const secondary = options.secondary || false

	const button = makeElement('button')
		.style({
			border: 'none',
			background: derive(disabled, disabled => {
				if (secondary)
					return disabled
						? colorModifiers.lowerAlpha(getTheme().secondaryButtonBackground, 0.5)
						: getTheme().secondaryButtonBackground
				return disabled ? colorModifiers.lowerAlpha(getTheme().buttonBackground, 0.5) : getTheme().buttonBackground
			}),
			padding: `0px ${options.large ? 24 : 16}px`,
			height: `${options.large ? 40 : 30}px`,
			display: options.block ? 'flex' : 'inline-flex',
			width: options.block ? '100%' : 'unset',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: getTheme().mediumAverageBorder,
			cursor: 'pointer',
			opacity: '1',
			transition: 'background 200ms',
			color: secondary ? getTheme().secondaryButtonForeground : getTheme().buttonForeground,
			pointerEvents: derive(disabled, disabled => (disabled ? 'none' : 'auto')),
			outline: 'none',
		})
		.styleScope('hover', {
			background: secondary
				? colorModifiers.lowerAlpha(getTheme().secondaryButtonBackground, 0.2)
				: colorModifiers.lowerAlpha(getTheme().buttonBackground, 0.2),
		})
		.styleScope('active', { background: secondary ? getTheme().secondaryButtonBackground : getTheme().buttonBackground })
		.on({
			click: () => {
				if (options.href) location.href = sureGet(options.href)
			},
		})
		.$(makeText(label))

	return button
}
