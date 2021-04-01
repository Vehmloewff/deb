import {
	makeDivision,
	MaybeStorable,
	sureGet,
	groupSubscribe,
	BareElement,
	makeHeader,
	makeLink,
	makeSpan,
	makeInlineCode,
	makeCodeBlock,
	getTheme,
	colorModifiers,
	makeImage,
} from '../mod.ts'
import { parseMarkdown, Node } from './lib/parse-markdown.ts'

const INDENT_SIZE = 10

export function renderMarkdown(markdown: MaybeStorable<string>) {
	const element = makeDivision().$('Rendering coming soon!')

	groupSubscribe(() => {
		// remove the old rendering
		element.raw.innerHTML = ``

		element.$(...render(sureGet(markdown)))
	}, markdown)

	return element
}

function render(markdown: string): (BareElement | string)[] {
	const nodes = parseMarkdown(sureGet(markdown))

	function renderNode(previousNode: Node | null, node: Node, nextNode: Node | null): BareElement | string | null {
		if (node.type === 'title') return makeHeader(node.rank).$(...renderNodes(node.block))
		if (node.type === 'text') return node.text
		if (node.type === 'break') {
			if (!previousNode || previousNode.type === 'title') return null
			if (!nextNode || nextNode.type === 'title') return null
			return makeDivision().style({ height: '25px' })
		}
		if (node.type === 'link') return makeLink(node.url).$(...renderNodes(node.block))
		if (node.type === 'italic')
			return makeSpan()
				.style({ fontStyle: 'italic' })
				.$(...renderNodes(node.block))
		if (node.type === 'bold')
			return makeSpan()
				.style({ fontWeight: 'bold' })
				.$(...renderNodes(node.block))
		if (node.type === 'list')
			return makeDivision()
				.style({ paddingLeft: `${node.indent.length * INDENT_SIZE + INDENT_SIZE}px`, paddingTop: '5px', paddingBottom: '5px' })
				.$(
					makeSpan()
						.style({ paddingRight: `${INDENT_SIZE}px` })
						.$(node.bullet === '-' ? '•' : node.bullet),
					...renderNodes(node.block)
				)
		if (node.type === 'strike')
			return makeSpan()
				.style({ textDecoration: 'line-through' })
				.$(...renderNodes(node.block))
		if (node.type === 'codeSpan') return makeInlineCode(node.code)
		if (node.type === 'codeBlock') return makeCodeBlock(node.code, node.syntax)
		if (node.type === 'quote')
			return makeDivision()
				.style({
					padding: `20px`,
					borderLeft: `5px solid ${getTheme().action1}`,
					background: colorModifiers.setAlpha(getTheme().action1, 0.1),
					borderRadius: `0px ${getTheme().mediumAverageBorder} ${getTheme().mediumAverageBorder} 0px`,
				})
				.$(...renderNodes(node.block))
		if (node.type === 'image') return makeImage(node.url, { alt: node.alt })

		return 'border or linkDef'
	}

	function renderNodes(nodes: Node[]): (BareElement | string)[] {
		return nodes.map((node, index) => renderNode(nodes[index - 1] || null, node, nodes[index + 1] || null)).filter(node => !!node) as (
			| BareElement
			| string
		)[]
	}

	return renderNodes(nodes)
}
