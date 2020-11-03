import { MaybeObservable } from './observable.ts'

export interface ElementStyles extends Partial<ElementStylesAllRequired> {
	active?: Partial<ElementStylesAllRequired>
	hovering?: Partial<ElementStylesAllRequired>
	focused?: Partial<ElementStylesAllRequired>
}

export interface ElementStylesAllRequired {
	alignContent: MaybeObservable<string>
	alignItems: MaybeObservable<string>
	alignSelf: MaybeObservable<string>
	alignmentBaseline: MaybeObservable<string>
	all: MaybeObservable<string>
	animation: MaybeObservable<string>
	animationDelay: MaybeObservable<string>
	animationDirection: MaybeObservable<string>
	animationDuration: MaybeObservable<string>
	animationFillMode: MaybeObservable<string>
	animationIterationCount: MaybeObservable<string>
	animationName: MaybeObservable<string>
	animationPlayState: MaybeObservable<string>
	animationTimingFunction: MaybeObservable<string>
	backfaceVisibility: MaybeObservable<string>
	background: MaybeObservable<string>
	backgroundAttachment: MaybeObservable<string>
	backgroundClip: MaybeObservable<string>
	backgroundColor: MaybeObservable<string>
	backgroundImage: MaybeObservable<string>
	backgroundOrigin: MaybeObservable<string>
	backgroundPosition: MaybeObservable<string>
	backgroundPositionX: MaybeObservable<string>
	backgroundPositionY: MaybeObservable<string>
	backgroundRepeat: MaybeObservable<string>
	backgroundSize: MaybeObservable<string>
	baselineShift: MaybeObservable<string>
	blockSize: MaybeObservable<string>
	border: MaybeObservable<string>
	borderBlockEnd: MaybeObservable<string>
	borderBlockEndColor: MaybeObservable<string>
	borderBlockEndStyle: MaybeObservable<string>
	borderBlockEndWidth: MaybeObservable<string | number>
	borderBlockStart: MaybeObservable<string>
	borderBlockStartColor: MaybeObservable<string>
	borderBlockStartStyle: MaybeObservable<string>
	borderBlockStartWidth: MaybeObservable<string | number>
	borderBottom: MaybeObservable<string>
	borderBottomColor: MaybeObservable<string>
	borderBottomLeftRadius: MaybeObservable<string>
	borderBottomRightRadius: MaybeObservable<string>
	borderBottomStyle: MaybeObservable<string>
	borderBottomWidth: MaybeObservable<string | number>
	borderCollapse: MaybeObservable<string>
	borderColor: MaybeObservable<string>
	borderImage: MaybeObservable<string>
	borderImageOutset: MaybeObservable<string>
	borderImageRepeat: MaybeObservable<string>
	borderImageSlice: MaybeObservable<string>
	borderImageSource: MaybeObservable<string>
	borderImageWidth: MaybeObservable<string | number>
	borderInlineEnd: MaybeObservable<string>
	borderInlineEndColor: MaybeObservable<string>
	borderInlineEndStyle: MaybeObservable<string>
	borderInlineEndWidth: MaybeObservable<string | number>
	borderInlineStart: MaybeObservable<string>
	borderInlineStartColor: MaybeObservable<string>
	borderInlineStartStyle: MaybeObservable<string>
	borderInlineStartWidth: MaybeObservable<string | number>
	borderLeft: MaybeObservable<string>
	borderLeftColor: MaybeObservable<string>
	borderLeftStyle: MaybeObservable<string>
	borderLeftWidth: MaybeObservable<string | number>
	borderRadius: MaybeObservable<string>
	borderRight: MaybeObservable<string>
	borderRightColor: MaybeObservable<string>
	borderRightStyle: MaybeObservable<string>
	borderRightWidth: MaybeObservable<string | number>
	borderSpacing: MaybeObservable<string>
	borderStyle: MaybeObservable<string>
	borderTop: MaybeObservable<string>
	borderTopColor: MaybeObservable<string>
	borderTopLeftRadius: MaybeObservable<string>
	borderTopRightRadius: MaybeObservable<string>
	borderTopStyle: MaybeObservable<string>
	borderTopWidth: MaybeObservable<string | number>
	borderWidth: MaybeObservable<string | number>
	bottom: MaybeObservable<string | number>
	boxShadow: MaybeObservable<string>
	boxSizing: MaybeObservable<string>
	breakAfter: MaybeObservable<string>
	breakBefore: MaybeObservable<string>
	breakInside: MaybeObservable<string>
	captionSide: MaybeObservable<string>
	caretColor: MaybeObservable<string>
	clear: MaybeObservable<string>
	clip: MaybeObservable<string>
	clipPath: MaybeObservable<string>
	clipRule: MaybeObservable<string>
	color: MaybeObservable<string>
	colorInterpolation: MaybeObservable<string>
	colorInterpolationFilters: MaybeObservable<string>
	columnCount: MaybeObservable<string>
	columnFill: MaybeObservable<string>
	columnGap: MaybeObservable<string>
	columnRule: MaybeObservable<string>
	columnRuleColor: MaybeObservable<string>
	columnRuleStyle: MaybeObservable<string>
	columnRuleWidth: MaybeObservable<string | number>
	columnSpan: MaybeObservable<string>
	columnWidth: MaybeObservable<string | number>
	columns: MaybeObservable<string>
	content: MaybeObservable<string>
	counterIncrement: MaybeObservable<string>
	counterReset: MaybeObservable<string>
	cssFloat: MaybeObservable<string>
	cssText: MaybeObservable<string>
	cursor: MaybeObservable<string>
	direction: MaybeObservable<string>
	display: MaybeObservable<string>
	dominantBaseline: MaybeObservable<string>
	emptyCells: MaybeObservable<string>
	fill: MaybeObservable<string>
	fillOpacity: MaybeObservable<string>
	fillRule: MaybeObservable<string>
	filter: MaybeObservable<string>
	flex: MaybeObservable<string>
	flexBasis: MaybeObservable<string>
	flexDirection: MaybeObservable<string>
	flexFlow: MaybeObservable<string>
	flexGrow: MaybeObservable<string>
	flexShrink: MaybeObservable<string>
	flexWrap: MaybeObservable<string>
	float: MaybeObservable<string>
	floodColor: MaybeObservable<string>
	floodOpacity: MaybeObservable<string>
	font: MaybeObservable<string>
	fontFamily: MaybeObservable<string>
	fontFeatureSettings: MaybeObservable<string>
	fontKerning: MaybeObservable<string>
	fontSize: MaybeObservable<string | number>
	fontSizeAdjust: MaybeObservable<string>
	fontStretch: MaybeObservable<string>
	fontStyle: MaybeObservable<string>
	fontSynthesis: MaybeObservable<string>
	fontVariant: MaybeObservable<string>
	fontVariantCaps: MaybeObservable<string>
	fontVariantEastAsian: MaybeObservable<string>
	fontVariantLigatures: MaybeObservable<string>
	fontVariantNumeric: MaybeObservable<string>
	fontVariantPosition: MaybeObservable<string>
	fontWeight: MaybeObservable<string>
	gap: MaybeObservable<string>
	glyphOrientationVertical: MaybeObservable<string>
	grid: MaybeObservable<string>
	gridArea: MaybeObservable<string>
	gridAutoColumns: MaybeObservable<string>
	gridAutoFlow: MaybeObservable<string>
	gridAutoRows: MaybeObservable<string>
	gridColumn: MaybeObservable<string>
	gridColumnEnd: MaybeObservable<string>
	gridColumnGap: MaybeObservable<string>
	gridColumnStart: MaybeObservable<string>
	gridGap: MaybeObservable<string>
	gridRow: MaybeObservable<string>
	gridRowEnd: MaybeObservable<string>
	gridRowGap: MaybeObservable<string>
	gridRowStart: MaybeObservable<string>
	gridTemplate: MaybeObservable<string>
	gridTemplateAreas: MaybeObservable<string>
	gridTemplateColumns: MaybeObservable<string>
	gridTemplateRows: MaybeObservable<string>
	height: MaybeObservable<string | number>
	hyphens: MaybeObservable<string>
	imageOrientation: MaybeObservable<string>
	imageRendering: MaybeObservable<string>
	inlineSize: MaybeObservable<string>
	justifyContent: MaybeObservable<string>
	justifyItems: MaybeObservable<string>
	justifySelf: MaybeObservable<string>
	left: MaybeObservable<string | number>
	letterSpacing: MaybeObservable<string>
	lightingColor: MaybeObservable<string>
	lineBreak: MaybeObservable<string>
	lineHeight: MaybeObservable<string | number>
	listStyle: MaybeObservable<string>
	listStyleImage: MaybeObservable<string>
	listStylePosition: MaybeObservable<string>
	listStyleType: MaybeObservable<string>
	margin: MaybeObservable<string | number>
	marginBlockEnd: MaybeObservable<string | number>
	marginBlockStart: MaybeObservable<string | number>
	marginBottom: MaybeObservable<string | number>
	marginInlineEnd: MaybeObservable<string | number>
	marginInlineStart: MaybeObservable<string | number>
	marginLeft: MaybeObservable<string | number>
	marginRight: MaybeObservable<string | number>
	marginTop: MaybeObservable<string | number>
	marker: MaybeObservable<string>
	markerEnd: MaybeObservable<string>
	markerMid: MaybeObservable<string>
	markerStart: MaybeObservable<string>
	mask: MaybeObservable<string>
	maskComposite: MaybeObservable<string>
	maskImage: MaybeObservable<string>
	maskPosition: MaybeObservable<string>
	maskRepeat: MaybeObservable<string>
	maskSize: MaybeObservable<string>
	maskType: MaybeObservable<string>
	maxBlockSize: MaybeObservable<string>
	maxHeight: MaybeObservable<string | number>
	maxInlineSize: MaybeObservable<string>
	maxWidth: MaybeObservable<string | number>
	minBlockSize: MaybeObservable<string>
	minHeight: MaybeObservable<string | number>
	minInlineSize: MaybeObservable<string>
	minWidth: MaybeObservable<string | number>
	objectFit: MaybeObservable<string>
	objectPosition: MaybeObservable<string>
	opacity: MaybeObservable<string>
	order: MaybeObservable<string>
	orphans: MaybeObservable<string>
	outline: MaybeObservable<string>
	outlineColor: MaybeObservable<string>
	outlineOffset: MaybeObservable<string>
	outlineStyle: MaybeObservable<string>
	outlineWidth: MaybeObservable<string | number>
	overflow: MaybeObservable<string>
	overflowAnchor: MaybeObservable<string>
	overflowWrap: MaybeObservable<string>
	overflowX: MaybeObservable<string>
	overflowY: MaybeObservable<string>
	overscrollBehavior: MaybeObservable<string>
	overscrollBehaviorBlock: MaybeObservable<string>
	overscrollBehaviorInline: MaybeObservable<string>
	overscrollBehaviorX: MaybeObservable<string>
	overscrollBehaviorY: MaybeObservable<string>
	padding: MaybeObservable<string | number>
	paddingBlockEnd: MaybeObservable<string | number>
	paddingBlockStart: MaybeObservable<string | number>
	paddingBottom: MaybeObservable<string | number>
	paddingInlineEnd: MaybeObservable<string | number>
	paddingInlineStart: MaybeObservable<string | number>
	paddingLeft: MaybeObservable<string | number>
	paddingRight: MaybeObservable<string | number>
	paddingTop: MaybeObservable<string | number>
	pageBreakAfter: MaybeObservable<string>
	pageBreakBefore: MaybeObservable<string>
	pageBreakInside: MaybeObservable<string>
	paintOrder: MaybeObservable<string>
	perspective: MaybeObservable<string>
	perspectiveOrigin: MaybeObservable<string>
	placeContent: MaybeObservable<string>
	placeItems: MaybeObservable<string>
	placeSelf: MaybeObservable<string>
	pointerEvents: MaybeObservable<string>
	position: MaybeObservable<string>
	quotes: MaybeObservable<string>
	resize: MaybeObservable<string>
	right: MaybeObservable<string | number>
	rotate: MaybeObservable<string>
	rowGap: MaybeObservable<string>
	rubyAlign: MaybeObservable<string>
	rubyPosition: MaybeObservable<string>
	scale: MaybeObservable<string>
	scrollBehavior: MaybeObservable<string>
	shapeRendering: MaybeObservable<string>
	stopColor: MaybeObservable<string>
	stopOpacity: MaybeObservable<string>
	stroke: MaybeObservable<string>
	strokeDasharray: MaybeObservable<string>
	strokeDashoffset: MaybeObservable<string>
	strokeLinecap: MaybeObservable<string>
	strokeLinejoin: MaybeObservable<string>
	strokeMiterlimit: MaybeObservable<string>
	strokeOpacity: MaybeObservable<string>
	strokeWidth: MaybeObservable<string | number>
	tabSize: MaybeObservable<string | number>
	tableLayout: MaybeObservable<string>
	textAlign: MaybeObservable<string>
	textAlignLast: MaybeObservable<string>
	textAnchor: MaybeObservable<string>
	textCombineUpright: MaybeObservable<string>
	textDecoration: MaybeObservable<string>
	textDecorationColor: MaybeObservable<string>
	textDecorationLine: MaybeObservable<string>
	textDecorationStyle: MaybeObservable<string>
	textEmphasis: MaybeObservable<string>
	textEmphasisColor: MaybeObservable<string>
	textEmphasisPosition: MaybeObservable<string>
	textEmphasisStyle: MaybeObservable<string>
	textIndent: MaybeObservable<string>
	textJustify: MaybeObservable<string>
	textOrientation: MaybeObservable<string>
	textOverflow: MaybeObservable<string>
	textRendering: MaybeObservable<string>
	textShadow: MaybeObservable<string>
	textTransform: MaybeObservable<string>
	textUnderlinePosition: MaybeObservable<string>
	top: MaybeObservable<string | number>
	touchAction: MaybeObservable<string>
	transform: MaybeObservable<string>
	transformBox: MaybeObservable<string>
	transformOrigin: MaybeObservable<string>
	transformStyle: MaybeObservable<string>
	transition: MaybeObservable<string>
	transitionDelay: MaybeObservable<string>
	transitionDuration: MaybeObservable<string>
	transitionProperty: MaybeObservable<string>
	transitionTimingFunction: MaybeObservable<string>
	translate: MaybeObservable<string>
	unicodeBidi: MaybeObservable<string>
	userSelect: MaybeObservable<string>
	verticalAlign: MaybeObservable<string>
	visibility: MaybeObservable<string>
	/** @deprecated */
	webkitAlignContent: MaybeObservable<string>
	/** @deprecated */
	webkitAlignItems: MaybeObservable<string>
	/** @deprecated */
	webkitAlignSelf: MaybeObservable<string>
	/** @deprecated */
	webkitAnimation: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationDelay: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationDirection: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationDuration: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationFillMode: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationIterationCount: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationName: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationPlayState: MaybeObservable<string>
	/** @deprecated */
	webkitAnimationTimingFunction: MaybeObservable<string>
	/** @deprecated */
	webkitAppearance: MaybeObservable<string>
	/** @deprecated */
	webkitBackfaceVisibility: MaybeObservable<string>
	/** @deprecated */
	webkitBackgroundClip: MaybeObservable<string>
	/** @deprecated */
	webkitBackgroundOrigin: MaybeObservable<string>
	/** @deprecated */
	webkitBackgroundSize: MaybeObservable<string>
	/** @deprecated */
	webkitBorderBottomLeftRadius: MaybeObservable<string>
	/** @deprecated */
	webkitBorderBottomRightRadius: MaybeObservable<string>
	/** @deprecated */
	webkitBorderRadius: MaybeObservable<string>
	/** @deprecated */
	webkitBorderTopLeftRadius: MaybeObservable<string>
	/** @deprecated */
	webkitBorderTopRightRadius: MaybeObservable<string>
	/** @deprecated */
	webkitBoxAlign: MaybeObservable<string>
	/** @deprecated */
	webkitBoxFlex: MaybeObservable<string>
	/** @deprecated */
	webkitBoxOrdinalGroup: MaybeObservable<string>
	/** @deprecated */
	webkitBoxOrient: MaybeObservable<string>
	/** @deprecated */
	webkitBoxPack: MaybeObservable<string>
	/** @deprecated */
	webkitBoxShadow: MaybeObservable<string>
	/** @deprecated */
	webkitBoxSizing: MaybeObservable<string>
	/** @deprecated */
	webkitFilter: MaybeObservable<string>
	/** @deprecated */
	webkitFlex: MaybeObservable<string>
	/** @deprecated */
	webkitFlexBasis: MaybeObservable<string>
	/** @deprecated */
	webkitFlexDirection: MaybeObservable<string>
	/** @deprecated */
	webkitFlexFlow: MaybeObservable<string>
	/** @deprecated */
	webkitFlexGrow: MaybeObservable<string>
	/** @deprecated */
	webkitFlexShrink: MaybeObservable<string>
	/** @deprecated */
	webkitFlexWrap: MaybeObservable<string>
	/** @deprecated */
	webkitJustifyContent: MaybeObservable<string>
	webkitLineClamp: MaybeObservable<string>
	/** @deprecated */
	webkitMask: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImage: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImageOutset: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImageRepeat: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImageSlice: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImageSource: MaybeObservable<string>
	/** @deprecated */
	webkitMaskBoxImageWidth: MaybeObservable<string | number>
	/** @deprecated */
	webkitMaskClip: MaybeObservable<string>
	/** @deprecated */
	webkitMaskComposite: MaybeObservable<string>
	/** @deprecated */
	webkitMaskImage: MaybeObservable<string>
	/** @deprecated */
	webkitMaskOrigin: MaybeObservable<string>
	/** @deprecated */
	webkitMaskPosition: MaybeObservable<string>
	/** @deprecated */
	webkitMaskRepeat: MaybeObservable<string>
	/** @deprecated */
	webkitMaskSize: MaybeObservable<string>
	/** @deprecated */
	webkitOrder: MaybeObservable<string>
	/** @deprecated */
	webkitPerspective: MaybeObservable<string>
	/** @deprecated */
	webkitPerspectiveOrigin: MaybeObservable<string>
	webkitTapHighlightColor: MaybeObservable<string>
	/** @deprecated */
	webkitTextFillColor: MaybeObservable<string>
	/** @deprecated */
	webkitTextSizeAdjust: MaybeObservable<string>
	/** @deprecated */
	webkitTextStroke: MaybeObservable<string>
	/** @deprecated */
	webkitTextStrokeColor: MaybeObservable<string>
	/** @deprecated */
	webkitTextStrokeWidth: MaybeObservable<string | number>
	/** @deprecated */
	webkitTransform: MaybeObservable<string>
	/** @deprecated */
	webkitTransformOrigin: MaybeObservable<string>
	/** @deprecated */
	webkitTransformStyle: MaybeObservable<string>
	/** @deprecated */
	webkitTransition: MaybeObservable<string>
	/** @deprecated */
	webkitTransitionDelay: MaybeObservable<string>
	/** @deprecated */
	webkitTransitionDuration: MaybeObservable<string>
	/** @deprecated */
	webkitTransitionProperty: MaybeObservable<string>
	/** @deprecated */
	webkitTransitionTimingFunction: MaybeObservable<string>
	/** @deprecated */
	webkitUserSelect: MaybeObservable<string>
	whiteSpace: MaybeObservable<string>
	widows: MaybeObservable<string>
	width: MaybeObservable<string | number>
	willChange: MaybeObservable<string>
	wordBreak: MaybeObservable<string>
	wordSpacing: MaybeObservable<string>
	wordWrap: MaybeObservable<string>
	writingMode: MaybeObservable<string>
	zIndex: MaybeObservable<string>
	/** @deprecated */
	zoom: MaybeObservable<string>
}

export interface TriggeredEvents {
	mount?: () => void
	destroy?: () => void
	fullscreenchange?: (e: Event) => void
	fullscreenerror?: (e: Event) => void
	pointerlockchange?: (e: Event) => void
	pointerlockerror?: (e: Event) => void
	readystatechange?: (e: Event) => void
	visibilitychange?: (e: Event) => void
	abort?: (e: UIEvent) => void
	animationcancel?: (e: AnimationEvent) => void
	animationend?: (e: AnimationEvent) => void
	animationiteration?: (e: AnimationEvent) => void
	animationstart?: (e: AnimationEvent) => void
	auxclick?: (e: MouseEvent) => void
	blur?: (e: FocusEvent) => void
	cancel?: (e: Event) => void
	canplay?: (e: Event) => void
	canplaythrough?: (e: Event) => void
	change?: (e: Event) => void
	click?: (e: MouseEvent) => void
	close?: (e: Event) => void
	contextmenu?: (e: MouseEvent) => void
	cuechange?: (e: Event) => void
	dblclick?: (e: MouseEvent) => void
	drag?: (e: DragEvent) => void
	dragend?: (e: DragEvent) => void
	dragenter?: (e: DragEvent) => void
	dragexit?: (e: Event) => void
	dragleave?: (e: DragEvent) => void
	dragover?: (e: DragEvent) => void
	dragstart?: (e: DragEvent) => void
	drop?: (e: DragEvent) => void
	durationchange?: (e: Event) => void
	emptied?: (e: Event) => void
	ended?: (e: Event) => void
	error?: (e: ErrorEvent) => void
	focus?: (e: FocusEvent) => void
	focusin?: (e: FocusEvent) => void
	focusout?: (e: FocusEvent) => void
	gotpointercapture?: (e: PointerEvent) => void
	input?: (e: Event) => void
	invalid?: (e: Event) => void
	keydown?: (e: KeyboardEvent) => void
	keypress?: (e: KeyboardEvent) => void
	keyup?: (e: KeyboardEvent) => void
	load?: (e: Event) => void
	loadeddata?: (e: Event) => void
	loadedmetadata?: (e: Event) => void
	loadstart?: (e: Event) => void
	lostpointercapture?: (e: PointerEvent) => void
	mousedown?: (e: MouseEvent) => void
	mouseenter?: (e: MouseEvent) => void
	mouseleave?: (e: MouseEvent) => void
	mousemove?: (e: MouseEvent) => void
	mouseout?: (e: MouseEvent) => void
	mouseover?: (e: MouseEvent) => void
	mouseup?: (e: MouseEvent) => void
	pause?: (e: Event) => void
	play?: (e: Event) => void
	playing?: (e: Event) => void
	pointercancel?: (e: PointerEvent) => void
	pointerdown?: (e: PointerEvent) => void
	pointerenter?: (e: PointerEvent) => void
	pointerleave?: (e: PointerEvent) => void
	pointermove?: (e: PointerEvent) => void
	pointerout?: (e: PointerEvent) => void
	pointerover?: (e: PointerEvent) => void
	pointerup?: (e: PointerEvent) => void
	progress?: (e: ProgressEvent) => void
	ratechange?: (e: Event) => void
	reset?: (e: Event) => void
	resize?: (e: UIEvent) => void
	scroll?: (e: Event) => void
	securitypolicyviolation?: (e: SecurityPolicyViolationEvent) => void
	seeked?: (e: Event) => void
	seeking?: (e: Event) => void
	select?: (e: Event) => void
	selectionchange?: (e: Event) => void
	selectstart?: (e: Event) => void
	stalled?: (e: Event) => void
	submit?: (e: Event) => void
	suspend?: (e: Event) => void
	timeupdate?: (e: Event) => void
	toggle?: (e: Event) => void
	touchcancel?: (e: TouchEvent) => void
	touchend?: (e: TouchEvent) => void
	touchmove?: (e: TouchEvent) => void
	touchstart?: (e: TouchEvent) => void
	transitioncancel?: (e: TransitionEvent) => void
	transitionend?: (e: TransitionEvent) => void
	transitionrun?: (e: TransitionEvent) => void
	transitionstart?: (e: TransitionEvent) => void
	volumechange?: (e: Event) => void
	waiting?: (e: Event) => void
	wheel?: (e: WheelEvent) => void
	copy?: (e: ClipboardEvent) => void
	cut?: (e: ClipboardEvent) => void
	paste?: (e: ClipboardEvent) => void
}

export interface EventDispatches {
	mount?: void
	destroy?: void
	fullscreenchange?: Event
	fullscreenerror?: Event
	pointerlockchange?: Event
	pointerlockerror?: Event
	readystatechange?: Event
	visibilitychange?: Event
	abort?: UIEvent
	animationcancel?: AnimationEvent
	animationend?: AnimationEvent
	animationiteration?: AnimationEvent
	animationstart?: AnimationEvent
	auxclick?: MouseEvent
	blur?: FocusEvent
	cancel?: Event
	canplay?: Event
	canplaythrough?: Event
	change?: Event
	click?: MouseEvent
	close?: Event
	contextmenu?: MouseEvent
	cuechange?: Event
	dblclick?: MouseEvent
	drag?: DragEvent
	dragend?: DragEvent
	dragenter?: DragEvent
	dragexit?: Event
	dragleave?: DragEvent
	dragover?: DragEvent
	dragstart?: DragEvent
	drop?: DragEvent
	durationchange?: Event
	emptied?: Event
	ended?: Event
	error?: ErrorEvent
	focus?: FocusEvent
	focusin?: FocusEvent
	focusout?: FocusEvent
	gotpointercapture?: PointerEvent
	input?: Event
	invalid?: Event
	keydown?: KeyboardEvent
	keypress?: KeyboardEvent
	keyup?: KeyboardEvent
	load?: Event
	loadeddata?: Event
	loadedmetadata?: Event
	loadstart?: Event
	lostpointercapture?: PointerEvent
	mousedown?: MouseEvent
	mouseenter?: MouseEvent
	mouseleave?: MouseEvent
	mousemove?: MouseEvent
	mouseout?: MouseEvent
	mouseover?: MouseEvent
	mouseup?: MouseEvent
	pause?: Event
	play?: Event
	playing?: Event
	pointercancel?: PointerEvent
	pointerdown?: PointerEvent
	pointerenter?: PointerEvent
	pointerleave?: PointerEvent
	pointermove?: PointerEvent
	pointerout?: PointerEvent
	pointerover?: PointerEvent
	pointerup?: PointerEvent
	progress?: ProgressEvent
	ratechange?: Event
	reset?: Event
	resize?: UIEvent
	scroll?: Event
	securitypolicyviolation?: SecurityPolicyViolationEvent
	seeked?: Event
	seeking?: Event
	select?: Event
	selectionchange?: Event
	selectstart?: Event
	stalled?: Event
	submit?: Event
	suspend?: Event
	timeupdate?: Event
	toggle?: Event
	touchcancel?: TouchEvent
	touchend?: TouchEvent
	touchmove?: TouchEvent
	touchstart?: TouchEvent
	transitioncancel?: TransitionEvent
	transitionend?: TransitionEvent
	transitionrun?: TransitionEvent
	transitionstart?: TransitionEvent
	volumechange?: Event
	waiting?: Event
	wheel?: WheelEvent
	copy?: ClipboardEvent
	cut?: ClipboardEvent
	paste?: ClipboardEvent
}

export const domTriggeredEvents = [
	'fullscreenchange',
	'fullscreenerror',
	'pointerlockchange',
	'pointerlockerror',
	'readystatechange',
	'visibilitychange',
	'abort',
	'animationcancel',
	'animationend',
	'animationiteration',
	'animationstart',
	'auxclick',
	'blur',
	'cancel',
	'canplay',
	'canplaythrough',
	'change',
	'click',
	'close',
	'contextmenu',
	'cuechange',
	'dblclick',
	'drag',
	'dragend',
	'dragenter',
	'dragexit',
	'dragleave',
	'dragover',
	'dragstart',
	'drop',
	'durationchange',
	'emptied',
	'ended',
	'error',
	'focus',
	'focusin',
	'focusout',
	'gotpointercapture',
	'input',
	'invalid',
	'keydown',
	'keypress',
	'keyup',
	'load',
	'loadeddata',
	'loadedmetadata',
	'loadstart',
	'lostpointercapture',
	'mousedown',
	'mouseenter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pause',
	'play',
	'playing',
	'pointercancel',
	'pointerdown',
	'pointerenter',
	'pointerleave',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'progress',
	'ratechange',
	'reset',
	'resize',
	'scroll',
	'securitypolicyviolation',
	'seeked',
	'seeking',
	'select',
	'selectionchange',
	'selectstart',
	'stalled',
	'submit',
	'suspend',
	'timeupdate',
	'toggle',
	'touchcancel',
	'touchend',
	'touchmove',
	'touchstart',
	'transitioncancel',
	'transitionend',
	'transitionrun',
	'transitionstart',
	'volumechange',
	'waiting',
	'wheel',
	'copy',
	'cut',
	'paste',
]
