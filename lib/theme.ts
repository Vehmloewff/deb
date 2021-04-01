import { Storable, storable } from './storable.ts'
import { DefaultThemeValues } from './default-theme.ts'

export interface Theme<T extends DefaultThemeValues = DefaultThemeValues> {
	update(fn: (currentTheme: T) => T): void
	get(): T
	changes: Storable<number>
}

export function makeTheme<T extends DefaultThemeValues>(theme: T): Theme<T> {
	const changes = storable(0)

	function get() {
		return theme
	}

	function update(fn: (currentTheme: T) => T) {
		theme = fn(theme)
		changes.set(changes.get() + 1)
	}

	return {
		changes,
		get,
		update,
	}
}

export function makeThemeAcceptor<T extends DefaultThemeValues>() {
	let acceptedTheme: Theme<T> | null = null

	function acceptTheme(theme: Theme<T>) {
		acceptedTheme = theme
	}

	function getTheme(): T {
		if (!acceptedTheme) throw new Error(`No theme has been accepted`)
		return acceptedTheme.get()
	}

	function themeChanges(): Storable<number> {
		if (!acceptedTheme) throw new Error(`No theme has been accepted`)
		return acceptedTheme.changes
	}

	return {
		acceptTheme,
		getTheme,
		themeChanges,
	}
}
