import { appRoot, makeLink, makeHeader, makeDivision, makeParagraph, renderMarkdown } from '../mod.ts'

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
			page
		)
)
