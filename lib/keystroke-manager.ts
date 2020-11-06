/// <reference lib="dom" />

export interface KeystrokeManagerOptions {
	allowNewlines?: boolean
	allowTabs?: boolean
}

export interface KeystrokeHandlers {
	/** A single character should be deleted */
	remove(): void
	/** A whole word should be deleted */
	powerRemove(): void
	/** A character, or set of characters, were added */
	add(chars: string[]): void

	moveCaretUp(): void
	moveCaretDown(): void
	moveCaretRight(): void
	powerMoveCaretRight(): void
	moveCaretLeft(): void
	powerMoveCaretLeft(): void
}

export function keystrokeManager(element: HTMLElement, handlers: KeystrokeHandlers, options: KeystrokeManagerOptions = {}) {
	const inputEl = document.createElement('textarea')

	inputEl.oninput = () => emitCharacters(inputEl.value)
	inputEl.onkeydown = e => {
		keyPressed(e.key, e.ctrlKey)
		if (shouldIgnoreKey(e.key)) e.preventDefault()
	}

	inputEl.style.position = `absolute`
	inputEl.style.left = `-999em`

	inputEl.setAttribute('autocomplete', 'off')
	inputEl.setAttribute('spellcheck', 'false')
	inputEl.setAttribute('autocorrect', 'off')

	element.appendChild(inputEl)

	element.addEventListener('keydown', () => inputEl.focus())
	element.addEventListener('click', () => inputEl.focus())

	function keyPressed(key: string, ctrlKey: boolean) {
		if (key === 'Backspace' || key === 'Delete') {
			if (ctrlKey) handlers.powerRemove()
			else handlers.remove()
		} else if (key === 'ArrowUp') handlers.moveCaretUp()
		else if (key === 'ArrowDown') handlers.moveCaretDown()
		else if (key === 'ArrowRight') {
			if (ctrlKey) handlers.powerMoveCaretRight()
			else handlers.moveCaretRight()
		} else if (key === 'ArrowLeft') {
			if (ctrlKey) handlers.powerMoveCaretLeft()
			else handlers.moveCaretLeft()
		}
	}

	function shouldIgnoreKey(key: string): boolean {
		if (options.allowTabs && key === 'Tab') {
			emitCharacters('\t')
			return true
		} else if (!options.allowNewlines && (key === 'Enter' || key === 'Return')) return true
		return false
	}

	function emitCharacters(characters: string) {
		if (characters.length) handlers.add(characters.split(''))
		inputEl.value = ``
	}
}
