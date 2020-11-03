import { AppRoot, Block, Label, observable, derive } from '../mod.ts'

const name = observable(getRandomName())
setInterval(() => name.set(getRandomName()), 1000)

function getRandomName() {
	const names = ['World', 'Awesome', 'Mars', 'Earth', 'Deb', 'Planet', 'Deno', 'Deno Web Framework']
	return names[Math.floor(Math.random() * names.length)]
}

AppRoot().$(
	Block()
		.style({ background: 'paleRed' })
		.$(Label(derive(name, name => `Hello, ${name}!`)).style({ size: 30 }))
)
