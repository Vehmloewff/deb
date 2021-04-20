# Deb

Deno web framework (frontend)

## Application Wrapper

This enables the application to be re-rendered when the theme is updated.

```ts
import { applicationWrapper, documentBody, makeElement } from 'https://denopkg.com/Vehmloewff/deb@v0/mod.ts'

applicationWrapper(() => {
	documentBody().$(makeElement('h1').$('Hello, World!'))
})
```

## Custom Theming

The easiest way to do this is to modify the default theme.

```ts
import { defaultTheme, colorModifiers, colors } from 'https://denopkg.com/Vehmloewff/deb@v0/mod.ts'

defaultTheme.update(theme => {
	theme.background1 = colorModifiers.darken(theme.background1)
	them.action1 = colors.pink
	return theme
})
```

If you want to add your own custom keys, though, you'll need to create a theme of your own.

```ts
import { makeTheme, acceptTheme } from 'https://denopkg.com/Vehmloewff/deb@v0/mod.ts'

// Create a custom theme
const myTheme = makeTheme({
	myCustomProperty: '47px'
	...
})

// Notify deb that you have settled on a theme
acceptTheme(myTheme)

// Update my theme
myTheme.update(theme => {
	theme.myCustomProperty = '23px'
	return theme
})
```

If you are creating a component library, be sure to export `acceptTheme`. This will allow users of you component library to use their own custom themes.

## TODO

-   [x] Children as storables
-   [x] Conditional children support
-   [ ] Reactive each support
-   [ ] Reactive await support
-   [x] Button component
-   [ ] Icon component
-   [ ] IconButton component
-   [ ] TextField component
    -   [x] Errors support
    -   [x] Disabled support
    -   [x] Multiline
    -   [ ] Head and tail inserts
-   [ ] Router
-   [ ] Alert component
-   [ ] NoticeBlock component
-   [ ] Center component
-   [ ] Menu component
-   [ ] Dropdown component
-   [ ] RadioButtons component
-   [ ] Switch component
-   [ ] Modal component
-   [ ] BlurBackground component
