import { CoreElement, ensureObservable, isObservable, MaybeObservable, Observable, observable, twoWayBinding } from '../core/mod.ts'
import { keystrokeManager } from '../lib/keystroke-manager.ts'
import { relativeMouseEvent } from '../lib/relative-mouseevent.ts'
import { Block, Label } from '../mod.ts'
import { BlockStyles } from '../types.ts'
import { Caret, CaretStyles } from './Caret.ts'

export interface DataPoint {
	x: number
	y: number
}

export interface DataPosition {
	topLeft: DataPoint
	bottomLeft: DataPoint
	topRight: DataPoint
	bottomRight: DataPoint
	height: number
}

export interface ReRenderBehavior {
	extraBefore: number
	extraAfter: number
}

export interface RenderActions<T> {
	moveCaret(toIndex: number): void
	addition(data: T[], index: number): void
	deletion(index: number, count: number): void
	replacement(data: T[], startIndex: number, endIndex: number): void
	allData(): DataMap<T>[]
	getCaretPosition(): number
}

export type RepresentedDataMap<T> = { data: T; hidden: false; representative: CoreElement; position(): DataPosition }
export type DataMap<T> = RepresentedDataMap<T> | { data: T; hidden: true }

export interface InputHandlers<T> {
	/**
	 * Called every time a character is added to the input field
	 * @param char The character that is supposed to be added
	 */
	addition(char: string): T
	/**
	 * Called during every data addition. Determines the amount of data pieces to re-render when a new piece of data is added to the input
	 * @param dataAdded The new piece of data that was just added
	 * @param index The index where the data is to be added
	 */
	additionReRenderBehavior(dataAdded: T[], index: number): ReRenderBehavior
	/**
	 * Called during every data deletion. Determines the amount of data pieces to re-render when a piece of data is removed from input
	 * @param dataAdded The piece of data that is being removed
	 * @param index The index that the data is to be removed from
	 */
	deletionReRenderBehavior(dataDeleted: T[], index: number): ReRenderBehavior
	/**
	 * Called during every data replacement.  Determines the amount of data pieces to re-render when a piece of data is replaced
	 * @param dataRemoved The data that is to be replaced
	 * @param dataAdded The data that is to replace the replaced
	 * @param index The index where the replacement is supposed to happen
	 */
	replacementReRenderBehavior(dataRemoved: T[], dataAdded: T[], index: number): ReRenderBehavior
	/**
	 * Determines if the piece of data is a rendered as a word.  Used for adding, deleting, and moving the caret with the Ctrl key
	 * @param data The piece of data being tested
	 */
	isWord(data: T): boolean
	/**
	 * How the bits of data are to be displayed.
	 * Each bit of data must be represented in `mapper`, i.e. the length on `mapper` and `piecesOfData` should equal each other.
	 * @param piecesOfData The bits of data to be rendered
	 */
	render(piecesOfData: T[], actions: RenderActions<T>): { body: CoreElement[]; mapper: DataMap<T>[] }
}

const defaultHandlers = (): InputHandlers<any> => ({
	addition(char) {
		return char
	},
	additionReRenderBehavior() {
		return { extraAfter: 0, extraBefore: 0 }
	},
	deletionReRenderBehavior() {
		return { extraAfter: 0, extraBefore: 0 }
	},
	replacementReRenderBehavior() {
		return { extraAfter: 0, extraBefore: 0 }
	},
	isWord(char) {
		return /[a-zA-Z09_]/.test(char)
	},
	render(chars) {
		const mapper = chars.map(char => {
			if (typeof char !== 'string')
				throw new Error(
					`The default input handlers can only handle strings.  Write your own handlers if you want to deal with more complicated data types.`
				)

			const map: DataMap<string> = {
				data: char,
				hidden: false,
				representative: Label(char),
				position() {
					const el = this.representative.raw
					if (!el.parentElement) throw new Error(`Can't get element's position before it is mounted`)

					return {
						topRight: { y: el.offsetTop, x: el.offsetLeft + el.offsetWidth },
						bottomRight: { y: el.offsetTop + el.offsetHeight, x: el.offsetLeft + el.offsetWidth },
						topLeft: { y: el.offsetTop, x: el.offsetLeft },
						bottomLeft: { y: el.offsetTop + el.offsetHeight, x: el.offsetLeft },
						height: el.clientHeight,
					}
				},
			}

			return map
		})

		return {
			body: mapper.map(({ representative }) => representative),
			mapper,
		}
	},
})

export interface InputOptions {
	caret?(): CoreElement & {
		move(x: number, y: number, height: number): void
		style(styles: CaretStyles): any
		hide(): void
		show(): void
	}
	/** @default 18 */
	defaultCaretHeight?: number
}

export function Input<T = string>(value: MaybeObservable<T[]>, options: InputOptions = {}, handlers: InputHandlers<T> = defaultHandlers()) {
	const container = Block().style({ alignX: 'start', cursor: 'text' })
	const caret = (options.caret || Caret)()
	const inputValue = ensureObservable(value)

	container.$(caret)

	container.focused.subscribe(focused => {
		if (focused) caret.show()
		else caret.hide()
	})

	let mappings: DataMap<T>[] = []
	let caretPosition = 0

	const actions: RenderActions<T> = {
		addition(data, index) {
			const { extraBefore, extraAfter } = handlers.additionReRenderBehavior(data, index)
			if (extraBefore || extraAfter) removeData(index - extraBefore, index + extraAfter)

			const currentValue = inputValue.get()
			currentValue.splice(index, 0, ...data)
			inputValue.set(currentValue)

			addData(inputValue.get().slice(index - extraBefore, index + data.length + extraAfter), index - extraBefore)

			if (caretPosition === index) caretPosition += data.length
			positionCaret()
		},
		deletion(index, count) {
			const currentInputValue = inputValue.get()
			const { extraBefore, extraAfter } = handlers.deletionReRenderBehavior(currentInputValue.slice(index - count, index), index)

			currentInputValue.splice(index - count, count)
			removeData(index - extraBefore, extraBefore + count + extraAfter)

			if (caretPosition === index + count) caretPosition -= count
			positionCaret()
		},
		replacement(data, startIndex, endIndex) {
			const { extraBefore, extraAfter } = handlers.replacementReRenderBehavior(
				inputValue.get().slice(startIndex, endIndex),
				data,
				startIndex
			)

			removeData(startIndex - extraBefore, endIndex + extraAfter)
			addData(data, startIndex - extraBefore)
			sync()

			if (caretPosition === endIndex) caretPosition = startIndex + data.length
			positionCaret()
		},
		moveCaret(toPosition) {
			if (caretPosition === toPosition) return
			if (toPosition < 0 || toPosition > inputValue.get().length) return

			caretPosition = toPosition
			positionCaret()
		},
		allData() {
			return mappings
		},
		getCaretPosition() {
			return caretPosition
		},
	}

	if (inputValue.get().length) addData(inputValue.get(), 0)

	keystrokeManager(container.raw, {
		add(chars: string[]) {
			const data = chars.map(char => handlers.addition(char))
			actions.addition(data, caretPosition)
		},
		remove() {
			if (!caretPosition) return
			actions.deletion(caretPosition - 1, 1)
		},
		powerRemove() {
			if (!caretPosition) return
			const count = getCountToEndOfWord('left')
			actions.deletion(caretPosition - count, count)
		},
		moveCaretDown() {
			const currentYPosition = getYPosition(caretPosition)
			const index = getIndexOfDataAtYPosition(currentYPosition, caretPosition, 'right')
			actions.moveCaret(index)
		},
		moveCaretUp() {
			const currentYPosition = getYPosition(caretPosition)
			const index = getIndexOfDataAtYPosition(currentYPosition, caretPosition, 'left')
			actions.moveCaret(index)
		},
		moveCaretRight() {
			actions.moveCaret(caretPosition + 1)
		},
		powerMoveCaretRight() {
			const count = getCountToEndOfWord('right')
			actions.moveCaret(caretPosition + count)
		},
		moveCaretLeft() {
			actions.moveCaret(caretPosition - 1)
		},
		powerMoveCaretLeft() {
			const count = getCountToEndOfWord('left')
			actions.moveCaret(caretPosition - count)
		},
	})

	container.on({
		click: e => {
			const { x, y } = relativeMouseEvent(e, container.raw)

			let index = mappings.length
			let cancel = false
			for (let i in mappings) {
				const currentIndex = Number(i)
				const map = mappings[i]

				if (map.hidden) continue

				const position = map.position()

				if (position.bottomRight.y < y) {
					index = currentIndex - 1
					break
				}

				const characterWidth = position.topRight.x - position.topLeft.x
				if (position.topRight.x - characterWidth / 2 > x) {
					index = currentIndex
					break
				}
			}

			if (!cancel) actions.moveCaret(index)
		},
	})

	function getCountToEndOfWord(direction: 'right' | 'left') {
		let count = 0

		const getNewIndex = () => {
			if (direction === 'right') return caretPosition + count
			else return caretPosition - count
		}

		const isWord = () => {
			const mapper = mappings[getNewIndex()]
			if (!mapper) return false
			return handlers.isWord(mapper.data)
		}

		while (isWord()) {
			if (direction === 'right') count++
			else count--
		}

		return count
	}

	function removeData(index: number, length: number) {
		const removed = mappings.splice(index, length)
		removed.forEach(map => {
			if (!map.hidden) map.representative.raw.remove()
		})
	}

	function addData(data: T[], index: number) {
		const res = handlers.render(data, actions)
		const itemAt = getNextRepresentedElement(index, 'right')

		if (!itemAt) container.$(...res.body)
		else res.body.forEach(el => container.raw.insertBefore(el.raw, itemAt.representative.raw))

		if (res.mapper.length !== data.length)
			throw new Error(
				`Some bits of data were not represented in the 'mapper' key returned by 'handlers.render'.  We know this because the input array and the array returned in the 'mapper' key of do not have the same length.`
			)

		mappings.splice(index, 0, ...res.mapper)
	}

	function sync() {
		inputValue.set(mappings.map(({ data }) => data))
	}

	function positionCaret() {
		const dataElement = getNextRepresentedElement(caretPosition - 1, 'left')
		if (!dataElement) caret.move(0, 0, options.defaultCaretHeight || 18)
		else {
			const pos = dataElement.position()
			caret.move(pos.topRight.x, pos.topRight.y, pos.height)
		}
	}

	function getIndexOfDataAtYPosition(yPosition: number, seekIndex: number, seekDirection: 'right' | 'left'): number {
		return 0
	}

	function getNextRepresentedElement(index: number, seekDirection: 'right' | 'left'): RepresentedDataMap<T> | null {
		let item = mappings[index]

		while (item && item.hidden) {
			if (seekDirection === 'right') index++
			else index--
			item = mappings[index]
		}

		return item || null
	}

	function getYPosition(index: number): number {
		const nextRepresentedElementToRight = getNextRepresentedElement(index, 'right')

		if (!nextRepresentedElementToRight) {
			const nextRepresentedElementToLeft = getNextRepresentedElement(index, 'left')
			if (!nextRepresentedElementToLeft) return 0

			return nextRepresentedElementToLeft.position().topRight.y
		}

		return nextRepresentedElementToRight.position().topLeft.y
	}

	return {
		...container,
		style(styles: { caret?: CaretStyles; container?: BlockStyles }) {
			if (styles.container) container.style(styles.container)
			if (styles.caret) caret.style(styles.caret)
			return this
		},
	}
}

export function inputWholeString(string: MaybeObservable<string>): MaybeObservable<string[]> {
	if (!isObservable(string)) return (string as string).split('')

	const newObs = observable<string[]>([])
	twoWayBinding(string as Observable<string>, newObs, { map1to2: v => v.split(''), map2to1: v => v.join('') })

	return newObs
}
