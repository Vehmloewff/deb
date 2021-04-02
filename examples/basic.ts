import {
	appRoot,
	makeLink,
	makeHeader,
	makeDivision,
	makeParagraph,
	renderMarkdown,
	makeTextField,
	storable,
	makeText,
	makeButton,
	makeSpacer,
	makeVerticalSpacer,
	derive,
} from '../mod.ts'

const page = renderMarkdown(
	`# Header

Some _paragraph_ here.

Another **paragraph** with a [link](#header) in it.

A list:
- Item \`1\`
- Item 2
- ~~Checkbox item~~

\`\`\`ts
console.log('hi')
\`\`\`

> Best picture ever.
> 
> _The Author_

![Author's Image](https://picsum.photos/400)
`
)

const inputValue = storable('Edit me!')
const error = derive(inputValue, v => !/me/i.test(v))
const help = derive(error, e => (e ? 'Must contain the word "me".' : 'Whatever you want to say...'))

appRoot().$(
	makeDivision()
		.style({ paddingTop: '40px', maxWidth: '600px', margin: 'auto' })
		.$(
			makeHeader(1).$('Hello, Vehmloewff!'),
			makeParagraph().$(
				`Hi there!  Can you visit my `,
				makeLink('https://github.com/Vehmloewff', { newTab: true }).$('Github profile'),
				`?`
			),
			page,
			makeSpacer(30),
			makeTextField(inputValue, { label: 'Text Field', error, help, multiline: false }),
			makeSpacer(30),
			makeText(inputValue),
			makeSpacer(10),
			makeButton('Cancel', { large: true, secondary: true, disabled: derive(inputValue, v => !v.length) }).on({
				click: () => inputValue.set(''),
			}),
			makeVerticalSpacer(20),
			makeButton('Reset', { large: true, disabled: derive(inputValue, v => /reset/.test(v)) }).on({
				click: () => inputValue.set('It has been reset! (me)'),
			}),
			makeSpacer(10),
			makeButton('Go somewhere', { block: true, href: 'https://github.com/Vehmloewff' }),
			makeSpacer(50)
		)
)
