import { CoreElement, groupSubscribe, MaybeObservable, sureGet, BareBlockStyles, BlockStyles, BorderStyle } from '../mod.ts'
import { Element } from '../core/mod.ts'
import { stringifyColor } from '../lib/stringify-color.ts'
import { makeArray } from '../lib/utils.ts'
import { Label } from './Label.ts'

export function Block() {
	const core = Element('div')
	const element = core.raw
	const styler = element.style

	element.setAttribute('tabIndex', '-1')
	element.classList.add('element')

	const self = {
		...core,
		style(styles: BlockStyles) {
			const isOk = (value: any) => value !== undefined && Object.keys(value).length

			groupSubscribe(
				changed => {
					if (changed !== null) {
						if (changed === 0 && !isOk(styles.hovering)) return
						if (changed === 1 && !isOk(styles.active)) return
						if (changed === 2 && !isOk(styles.focused)) return

						element.style.cssText = ``
					}

					style(styles)
					if (core.hovering.get() && isOk(styles.hovering)) style(styles.hovering as BareBlockStyles)
					else if (core.active.get() && isOk(styles.active)) style(styles.active as BareBlockStyles)
					else if (core.focused.get() && isOk(styles.focused)) style(styles.focused as BareBlockStyles)
				},
				core.hovering,
				core.active,
				core.focused,
				...Object.values(styles)
			)

			return self
		},
		$(...children: (CoreElement | string)[]) {
			core.$(...children.map(child => (typeof child === 'string' ? Label(child) : child)))

			return self
		},
		vertical() {
			style({ stackY: true })
			return self
		},
		packX() {
			style({ packX: true })
			return self
		},
		packY() {
			style({ packY: true })
			return self
		},
	}

	const runIfIsOk = <T>(val: T, fn: (val: T) => void) => {
		if (val !== undefined && val !== null) fn(val)
	}

	const testGo = <T>(
		value: MaybeObservable<T> | undefined,
		subscriber: (value: T) => void,
		...additionalWatches: MaybeObservable<any>[]
	) => {
		// if (value !== undefined) groupSubscribe(() => subscriber(sureGet(value)), value, ...additionalWatches)
		if (value !== undefined) subscriber(sureGet(value))

		return {
			otherwise: (fn: () => void) => {
				if (value === undefined) fn()
			},
		}
	}

	const pixeled = (value: number | null | undefined) => {
		if (value) return `${value}px`
		return ``
	}

	const parseStringPosition = (val: string): string => {
		const positionsChanged = {
			top: 'flex-start',
			bottom: 'flex-end',
			start: 'flex-start',
			end: 'flex-end',
		}

		// @ts-ignore
		return positionsChanged[val] || val
	}

	function style(styles: BareBlockStyles) {
		// height
		testGo(styles.height, height => {
			styler.height = pixeled(height)
			styles.packY = true
		})

		// width
		testGo(styles.width, width => {
			styler.width = pixeled(width)
			styles.packX = true
		})

		// maxWidth
		testGo(styles.maxWidth, width => (styler.maxWidth = pixeled(width)))

		// packX
		testGo(
			styles.packX,
			pack => {
				if (pack) {
					self.awaitEvent('mount').then(() => {
						const parentDirection = element.parentElement?.style?.flexDirection

						if (parentDirection === 'column' || parentDirection === 'column-reverse') styler.alignSelf = 'unset'
						else styler.flexGrow = 'unset'
					})
				}
			},
			styles.alignSelfY
		)

		// packY
		testGo(
			styles.packY,
			pack => {
				if (pack) {
					self.awaitEvent('mount').then(() => {
						const parentDirection = element.parentElement?.style?.flexDirection

						if (!parentDirection || parentDirection === 'row' || parentDirection === 'row-reverse') styler.alignSelf = 'unset'
						else styler.flexGrow = 'unset'
					})
				}
			},
			styles.alignSelfY
		)

		// grow
		testGo(styles.grow, grow => {
			if (!grow) return

			if (grow < 1) styler.flexShrink = String(grow * 10)
			else styler.flexGrow = String(grow)
		})

		// margin
		testGo(styles.margin, margin => {
			if (typeof margin === 'number')
				margin = {
					top: margin,
					right: margin,
					bottom: margin,
					left: margin,
				}

			styler.marginTop = pixeled(margin.top)
			styler.marginRight = pixeled(margin.right)
			styler.marginBottom = pixeled(margin.bottom)
			styler.marginLeft = pixeled(margin.left)
		})

		// padding
		testGo(styles.padding, padding => {
			if (typeof padding === 'number')
				padding = {
					top: padding,
					right: padding,
					bottom: padding,
					left: padding,
				}

			styler.paddingTop = pixeled(padding.top)
			styler.paddingRight = pixeled(padding.right)
			styler.paddingBottom = pixeled(padding.bottom)
			styler.paddingLeft = pixeled(padding.left)
		})

		// border
		// TODO: Gradients don't work
		testGo(styles.border, border => {
			if (typeof border === 'number') return (styler.borderWidth = pixeled(border))

			const stringify = (border: BorderStyle) => `${border.width}px ${border.style} ${stringifyColor(border.color)}`
			const isBorderStyle = (v: any): v is BorderStyle => 'style' in v

			if (isBorderStyle(border)) return (styler.border = stringify(border))

			if (border.top) styler.borderTop = stringify(border.top)
			if (border.right) styler.borderRight = stringify(border.right)
			if (border.bottom) styler.borderBottom = stringify(border.bottom)
			if (border.left) styler.borderLeft = stringify(border.left)
		})

		// background
		testGo(styles.background, style => (styler.background = stringifyColor(style)))

		// Textures
		const textures: string[] = []
		testGo(styles.blur, val => textures.push(`blur(${pixeled(val)})`))
		testGo(styles.brightness, val => textures.push(`brightness(${val})`))
		testGo(styles.contrast, val => textures.push(`contrast(${val})`))
		testGo(styles.grayscale, val => textures.push(`grayscale(${val})`))
		testGo(styles.invert, val => textures.push(`invert(${val})`))
		testGo(styles.hueRotate, val => textures.push(`hueRotate(${val}deg)`))
		testGo(styles.saturate, val => textures.push(`saturate(${val})`))
		testGo(styles.sepia, val => textures.push(`sepia(${val})`))
		if (textures.length) styler.filter = textures.join(', ')

		// Transformations
		const transformations: string[] = []

		// rotate
		testGo(styles.rotate, val => {
			if (typeof val === 'number') return transformations.push(`rotate(${val}deg)`)

			runIfIsOk(val.z, z => transformations.push(`rotateZ(${z}deg)`))
			runIfIsOk(val.x, x => transformations.push(`rotateX(${x}deg)`))
			runIfIsOk(val.y, y => transformations.push(`rotateY(${y}deg)`))
		})

		// scale
		testGo(styles.scale, val => {
			if (typeof val === 'number') return transformations.push(`scale(${val})`)

			const x = val.x ?? 1
			const y = val.y ?? 1
			const z = val.z ?? 1

			transformations.push(`scale3d(${x}, ${y}, ${z})`)
		})

		// translate
		testGo(styles.translate, val => {
			if (typeof val === 'number') return transformations.push(`translate(${val}px)`)

			runIfIsOk(val.z, z => transformations.push(`translateZ(${z}px)`))
			runIfIsOk(val.x, x => transformations.push(`translateX(${x}px)`))
			runIfIsOk(val.y, y => transformations.push(`translateY(${y}px)`))
		})

		// skew
		testGo(styles.skew, val => transformations.push(`skew(${val.ax}deg, ${val.ay}deg)`))

		// Apply the transformations
		if (transformations.length) styler.transform = transformations.join(', ')

		// visible
		testGo(styles.visible, isVisible => (styler.visibility = isVisible ? 'visible' : 'hidden'))

		// display
		testGo(styles.display, display => (styler.display = display ? 'flex' : 'none'))

		// absolute
		testGo(styles.absolute, isAbsolute => (styler.position = isAbsolute ? 'absolute' : 'relative'))

		// position
		testGo(styles.position, position => {
			styler.top = pixeled(position.top)
			styler.right = pixeled(position.right)
			styler.bottom = pixeled(position.bottom)
			styler.left = pixeled(position.left)
		})

		// zIndex
		testGo(styles.zIndex, index => (styler.zIndex = String(index)))

		// boxShadow
		testGo(styles.boxShadow, shadow => {
			if (!shadow) return

			styler.boxShadow = makeArray(shadow)
				.map(
					shadow =>
						`${shadow.x ?? 2}px ${shadow.y ?? 2}px ${shadow.blur ?? 10}px ${shadow.spread ?? 4}px ${stringifyColor(
							shadow.color
						)}`
				)
				.join(', ')
		})

		// opacity
		testGo(styles.opacity, opacity => (styler.opacity = String(opacity)))

		// order
		testGo(styles.order, order => (styler.order = String(order)))

		// hideFromMouse
		testGo(styles.hideFromMouse, hide => (styler.pointerEvents = hide ? 'none' : 'auto'))

		// cursor
		testGo(styles.cursor, cursor => (styler.cursor = cursor ? cursor : ''))

		// borderRadius
		testGo(styles.borderRadius, radius => {
			if (typeof radius === 'number') styler.borderRadius = pixeled(radius)
			else {
				const favor0 = (val: number | undefined) => (val ? pixeled(val) : '0')

				styler.borderRadius = `${favor0(radius.topLeft)} ${favor0(radius.topRight)} ${favor0(radius.bottomRight)} ${favor0(
					radius.bottomLeft
				)}`
			}
		})

		// alignSelfY
		testGo(styles.alignSelfY, val => (styler.alignSelf = parseStringPosition(val)))

		// stackY and stackReverse
		testGo(
			styles.stackY,
			y => {
				if (y) {
					styler.flexDirection = sureGet(styles.stackReverse) ? 'column-reverse' : 'column'
					if (
						(sureGet(styles.width) === undefined || sureGet(styles.width) === null) &&
						(sureGet(styles.packX) === undefined || sureGet(styles.packX) === null) &&
						!styler.width
					)
						styler.width = '100%'
				} else {
					styler.flexDirection = sureGet(styles.stackReverse) ? 'row-reverse' : 'row'
				}
			},
			styles.stackReverse
		).otherwise(() => {
			if (!styler.flexDirection) styler.flexDirection = sureGet(styles.stackReverse) ? 'row-reverse' : 'row'
		})

		// alignY
		testGo(styles.alignY, val =>
			!styler.flexDirection || styler.flexDirection === 'row' || styler.flexDirection === 'row-reverse'
				? (styler.alignItems = parseStringPosition(val))
				: (styler.justifyContent = parseStringPosition(val))
		)

		// alignX
		testGo(styles.alignX, val =>
			styler.flexDirection === 'column' || styler.flexDirection === 'column-reverse'
				? (styler.alignItems = parseStringPosition(val))
				: (styler.justifyContent = parseStringPosition(val))
		)

		// wrapChildren and wrapReverse
		testGo(
			styles.wrapChildren,
			wrap => (styler.flexWrap = !wrap ? 'nowrap' : sureGet(styles.wrapReverse) ? 'wrap-reverse' : 'wrap'),
			styles.wrapReverse
		)

		// transition
		testGo(styles.transition, transitions => {
			styler.transition = makeArray(transitions)
				.map(transition =>
					makeArray(transition.style)
						.map(what => `${what} ${transition.time}ms`)
						.join(', ')
				)
				.join(', ')
		})

		// inheritance
		if (styles.labelDefaults) {
			// color
			testGo(styles.labelDefaults.color, color => {
				if (!color) return
				styler.color = stringifyColor(color)
			})

			// font
			testGo(styles.labelDefaults.font, font => (styler.fontFamily = font ? font : ''))

			// weight
			testGo(
				styles.labelDefaults.weight,
				weight => (styler.fontWeight = weight === 'thin' ? '100' : weight === 'regular' ? '400' : String(weight))
			)

			// italic
			testGo(styles.labelDefaults.italic, italic => (styler.textDecoration = italic ? 'italic' : ''))

			// size
			testGo(styles.labelDefaults.size, size => (styler.fontSize = pixeled(size)))

			// letterSpacing
			testGo(styles.labelDefaults.letterSpacing, spacing => (styler.letterSpacing = pixeled(spacing)))

			// shadow
			testGo(styles.labelDefaults.shadow, shadow => {
				styler.textShadow = makeArray(shadow)
					.map(shadow => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${stringifyColor(shadow.color)}`)
					.join(', ')
			})

			// allowSelection
			testGo(styles.labelDefaults.allowSelection, allow => (allow ? (styler.userSelect = 'text') : null))
		}

		return self
	}

	return self
}
