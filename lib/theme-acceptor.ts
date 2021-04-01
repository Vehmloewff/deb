import { makeThemeAcceptor } from './theme.ts'

const { acceptTheme, getTheme, themeChanges } = makeThemeAcceptor()

export { acceptTheme, getTheme, themeChanges }
