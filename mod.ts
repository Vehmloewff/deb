import { makeTheme } from './lib/theme.ts'
import { DefaultThemeValues } from './lib/default-theme.ts'
import { acceptTheme } from './lib/theme-acceptor.ts'

export const defaultTheme = makeTheme(new DefaultThemeValues())
acceptTheme(defaultTheme)
console.log('hi there')

export * from './lib/app-root.ts'
export * from './lib/element.ts'
export * from './lib/storable.ts'
export * from './lib/theme.ts'
export * from './lib/theme-acceptor.ts'
export * from './lib/default-theme.ts'
export * from './lib/color.ts'

export * from './components/link.ts'
export * from './components/division.ts'
export * from './components/button.ts'
export * from './components/header.ts'
export * from './components/paragraph.ts'
export * from './components/render-markdown.ts'
export * from './components/span.ts'
export * from './components/inline-code.ts'
export * from './components/code-block.ts'
export * from './components/image.ts'
export * from './components/text.ts'
export * from './components/text-field.ts'
export * from './components/spacer.ts'
