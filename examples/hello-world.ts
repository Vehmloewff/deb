import { AppRoot, Block, Label } from '../mod.ts'

AppRoot().$(
	Block()
		.style({ background: 'paleRed' })
		.$(Label(`Hello, World!`).style({ size: 30 }))
)
