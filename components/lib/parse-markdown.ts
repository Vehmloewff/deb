// @deno-types="./parse-markdown.d.ts"
import parseMarkdown, {
	Node,
	NodeTypes,
	Block,
	Bold,
	Border,
	Break,
	CodeBlock,
	CodeSpan,
	Image,
	Italic,
	Link,
	LinkDefinition,
	List,
	Quote,
	Strike,
	Text,
	Title,
} from './parse-markdown.js'

export { parseMarkdown }

export type {
	Node,
	NodeTypes,
	Block,
	Bold,
	Border,
	Break,
	CodeBlock,
	CodeSpan,
	Image,
	Italic,
	Link,
	LinkDefinition,
	List,
	Quote,
	Strike,
	Text,
	Title,
}
