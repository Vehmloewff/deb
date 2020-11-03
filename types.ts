import { MaybeObservable, Color } from './mod.ts'

export interface Position<T = number> {
	top?: T
	right?: T
	bottom?: T
	left?: T
}

export interface BlockStyles extends BareBlockStyles {
	/**
	 * An object of styles to be applied while the element is being hovered upon by mouse
	 */
	hovering?: BlockStyles

	/**
	 * An object of styles to be applied after a mousedown or touchstart event, but before a mouseup or touchend
	 */
	active?: BlockStyles

	/**
	 * An object of styles to be applied when an element is in focus
	 */
	focused?: BlockStyles
}

export type Font = string

export type BorderStyles = 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none' | 'hidden'
export type CursorStyles =
	| 'default'
	| 'none'
	| 'context-menu'
	| 'help'
	| 'pointer'
	| 'progress'
	| 'wait'
	| 'cell'
	| 'crosshair'
	| 'text'
	| 'vertical-text'
	| 'alias'
	| 'copy'
	| 'move'
	| 'no-drop'
	| 'not-allowed'
	| 'e-resize'
	| 'n-resize'
	| 'ne-resize'
	| 'nw-resize'
	| 's-resize'
	| 'se-resize'
	| 'sw-resize'
	| 'w-resize'
	| 'ew-resize'
	| 'ns-resize'
	| 'nesw-resize'
	| 'nwse-resize'
	| 'col-resize'
	| 'row-resize'
	| 'all-scroll'
	| 'zoom-in'
	| 'zoom-out'
	| 'grab'
	| 'grabbing'

export interface BorderStyle {
	style: BorderStyles
	width: number
	color: Color
}

export interface TextShadow {
	x?: number
	y?: number
	blur?: number
	color: Color
}

export interface BoxShadow extends TextShadow {
	spread?: MaybeObservable<number>
}

export type YAlignments = 'auto' | 'center' | 'top' | 'bottom' | 'baseline'
export type XAlignments = 'start' | 'end' | 'center' | 'space-between' | 'space-around'

export interface LabelStyles {
	/**
	 * @default null
	 */
	color?: MaybeObservable<Color | null>

	/**
	 * @default null
	 */
	font?: MaybeObservable<Font | null>

	/**
	 * @default false
	 */
	weight?: MaybeObservable<number | 'bold' | 'thin' | 'regular'>

	/**
	 * @default false
	 */
	strikeThough?: MaybeObservable<boolean>

	/**
	 * @default false
	 */
	italic?: MaybeObservable<boolean>

	/**
	 * @default 16
	 */
	size?: MaybeObservable<number>

	/**
	 * @default 0
	 */
	letterSpacing?: MaybeObservable<number>

	/**
	 * @default null
	 */
	shadow?: MaybeObservable<TextShadow | TextShadow[]>

	/**
	 * @default false
	 */
	allowSelection?: MaybeObservable<boolean>

	/**
	 * @default 'center'
	 */
	textAlign?: MaybeObservable<'start' | 'end' | 'center'>

	/**
	 * If `true`, the element will take up as much space in all directions as it can
	 * @default false
	 */
	greedy?: MaybeObservable<boolean>

	/**
	 * The number of spaces a tab character should be rendered as, if you need a pixel value, `{ length: <pixels> }` should do it.
	 * @default true
	 */
	tabSize?: MaybeObservable<number | { length: number }>

	/**
	 * If `true`, all whitespace and multiple spaces will be replace with a single space
	 * @default false
	 */
	ignoreWhitespace?: MaybeObservable<boolean>

	/**
	 * If `true`, text will not wrap unless it hits upon a newline
	 * @default false
	 */
	noWrap?: MaybeObservable<boolean>

	/**
	 * What to do with the text that passes out of the text bounds.  Only valid when `nowrap` is `true`
	 * @default null // Don't catch the text overflow
	 */
	catchTextOverflow?: MaybeObservable<'ellipsis' | null>
}

export interface BareBlockStyles {
	/**
	 * @default null // Whatever is most natural
	 */
	height?: MaybeObservable<number | null>

	/**
	 * @default null // Whatever is most natural
	 */
	width?: MaybeObservable<number | null>

	/**
	 * @default null // Defer to `width`
	 */
	maxWidth?: MaybeObservable<number | null>

	/**
	 * If true, the element will take up the minimum amount of room it needs in the X direction
	 * @default false
	 */
	packX?: MaybeObservable<boolean>

	/**
	 * If `true`, the element will minimum amount of room it needs in the Y direction
	 * @default false
	 */
	packY?: MaybeObservable<boolean>

	/**
	 * How much should the element grow?
	 * @default null // Defer to `props.pack`
	 */
	grow?: MaybeObservable<number | null>

	/**
	 * @default 0
	 */
	margin?: MaybeObservable<number | Position>

	/**
	 * @default 0
	 */
	padding?: MaybeObservable<number | Position>

	/**
	 * @default 0
	 */
	border?: MaybeObservable<number | BorderStyle | Position<BorderStyle>>

	/**
	 * @default null
	 */
	background?: MaybeObservable<Color>

	//
	// Textures
	//

	/**
	 * @default 0
	 */
	blur?: MaybeObservable<number>

	/**
	 * Brightness level.  1 is original
	 * @default 1
	 */
	brightness?: MaybeObservable<number>

	/**
	 * Contrast level.  1 is original
	 * @default 1
	 */
	contrast?: MaybeObservable<number>

	/**
	 * Grayscale level.  1 is fully gray (used for black and white images) 0 is original
	 * @default 0
	 */
	grayscale?: MaybeObservable<number>

	/**
	 * Invert colors.  1 is fully rotated
	 * @default 0
	 */
	invert?: MaybeObservable<number>

	/**
	 * The amount of degrees to rotate
	 * @default 0
	 */
	hueRotate?: MaybeObservable<number>

	/**
	 * Saturation level.  1 is original
	 * @default 1
	 */
	saturate?: MaybeObservable<number>

	/**
	 * Sepia level.  1 is fully sepia
	 * @default 0
	 */
	sepia?: MaybeObservable<number>

	//
	// Transformations
	//

	/**
	 * The number of degrees to rotate the element
	 * @default 0
	 */
	rotate?: MaybeObservable<
		| number
		| {
				x?: MaybeObservable<number>
				y?: MaybeObservable<number>
				z?: MaybeObservable<number>
		  }
	>

	/**
	 * The number of times to scale an element.  1 is original
	 * @default 1
	 */
	scale?: MaybeObservable<
		| number
		| {
				x?: number
				y?: number
				z?: number
		  }
	>

	/**
	 * The number of pixels to translate an element
	 * @default 0
	 */
	translate?: MaybeObservable<
		| number
		| {
				x?: number
				y?: number
				z?: number
		  }
	>

	/**
	 * @default null
	 */
	skew?: MaybeObservable<{
		ax: number
		ay: number
	}>

	//
	// Display
	//

	/**
	 * If `false`, the element wil still take of space, but it will not be visible, i.e., it is, in all other respects, like it was not there.
	 * @default true
	 */
	visible?: MaybeObservable<boolean>

	/**
	 * If `false` the element will be "gone" as far as visibility or taking up space goes.
	 * @default true
	 */
	display?: MaybeObservable<boolean>

	//
	// Position
	//

	/**
	 * If `true`, the element will be absolutely positioned inside it's parent container
	 * @default false
	 */
	absolute?: MaybeObservable<boolean>

	// These effects will vary depending upon layout
	// If !absolute these values will move the element in relation to it's current position
	// If absolute=true these values position the element in
	//   respect to the borders of the parent
	/**
	 * These effects will vary depending upon layout
	 * If !absolute these values will move the element in relation to it's current position
	 * If absolute=true these values position the element in respect to the borders of the parent
	 */
	position?: MaybeObservable<Position>

	/**
	 * @default 0
	 */
	zIndex?: MaybeObservable<number>

	//
	// Other
	//

	/**
	 * @default null
	 */
	boxShadow?: MaybeObservable<BoxShadow[] | BoxShadow | null>

	/**
	 * Opacity level.  1 is original
	 * @default 1
	 */
	opacity?: MaybeObservable<number>

	/**
	 * Child order in the parent
	 * @default null // Whatever is natural
	 */
	order?: MaybeObservable<number>

	/**
	 * If `true`, no mouse events will be fired on this element, the will be fired on the element behind it.
	 * @default false
	 */
	hideFromMouse?: MaybeObservable<boolean>

	/**
	 * @default null // Whatever the parent is
	 */
	cursor?: MaybeObservable<CursorStyles | null>

	/**
	 * @default 0
	 */
	borderRadius?: MaybeObservable<number | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number }>

	//
	// Alignment
	//

	/**
	 * @default null // Follow whatever the parent says
	 *
	 * NOTE: Does nothing if this element's packY style is `true`
	 */
	alignSelfY?: MaybeObservable<YAlignments>

	/**
	 * Child alignment on the Y axis
	 * @default center
	 */
	alignY?: MaybeObservable<YAlignments>

	/**
	 * Child alignment on the X axis
	 * @default center
	 */
	alignX?: MaybeObservable<XAlignments>

	//
	// Child wrapping
	//

	/**
	 * @default false
	 */
	wrapChildren?: MaybeObservable<boolean>

	/**
	 * @default false
	 */
	wrapReverse?: MaybeObservable<boolean>

	//
	// Stack
	//

	/**
	 * If `true`, stack the children vertically
	 * @default false
	 */
	stackY?: MaybeObservable<boolean>

	/**
	 * @default false
	 */
	stackReverse?: MaybeObservable<boolean>

	//
	// Transitions
	//

	/**
	 * @default []
	 */
	transition?: MaybeObservable<TransitionValue | TransitionValue[]>

	//
	// Inheritance
	//
	labelDefaults?: Pick<LabelStyles, 'color' | 'font' | 'weight' | 'italic' | 'letterSpacing' | 'size' | 'allowSelection' | 'shadow'>
}

export interface TransitionValue {
	style: TransitionableKeys | TransitionableKeys[]
	time: number
}

export type TransitionableKeys =
	| 'height'
	| 'width'
	| 'margin'
	| 'margin-top'
	| 'margin-right'
	| 'margin-bottom'
	| 'margin-left'
	| 'padding'
	| 'padding-top'
	| 'padding-right'
	| 'padding-bottom'
	| 'padding-left'
	| 'border'
	| 'border'
	| 'border'
	| 'border-top'
	| 'border-top'
	| 'border-top'
	| 'border-right'
	| 'border-right'
	| 'border-right'
	| 'border-bottom'
	| 'border-bottom'
	| 'border-bottom'
	| 'border-left'
	| 'border-left'
	| 'border-left'
	| 'background'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'filter'
	| 'transform'
	| 'transform'
	| 'transform'
	| 'transform'
	| 'top'
	| 'right'
	| 'bottom'
	| 'left'
	| 'box-shadow'
	| 'opacity'
