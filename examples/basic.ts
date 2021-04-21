import { chooseRandArrItem } from 'https://denopkg.com/Vehmloewff/deno-utils/mod.ts'
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
const showText = storable(true)
const forEachItems = storable<{ name: string }[]>([])

// Just to be sure top-level promises are supported by the bundler
await new Promise(resolve => resolve(1))

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
			makeDivision().conditional(showText, [page]),
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
			makeButton('Toggle Markdown', { block: true }).on({ click: () => showText.set(!showText.get()) }),
			makeSpacer(20),
			makeParagraph().$('Some interesting names:'),
			makeDivision()
				.forEach(forEachItems, ({ name }) => makeDivision().$(name))
				.$(renderMarkdown('_(coming soon - real soon)_')),
			makeSpacer(50)
		)
)

let names: string[] = []

async function getRandomName() {
	if (!names.length)
		names = await fetch('https://api.allorigins.win/raw?url=https://www.randomlists.com/data/names-first.json')
			.then(res => res.json())
			.then(res => res.data)

	return chooseRandArrItem(names)
}

setInterval(async () => {
	const items = forEachItems.get()

	const newItem = async () => ({ name: await getRandomName() })

	forEachItems.set([
		items[1] || (await newItem()),
		items[2] || (await newItem()),
		items[3] || (await newItem()),
		items[4] || (await newItem()),
		await newItem(),
	])
}, 5000)
