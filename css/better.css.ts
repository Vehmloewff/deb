export default `
html,
body {
	padding: 0;
	margin: 0;
	font-family: Arial, Helvetica, sans-serif;
}

.app-container {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	user-select: none;
	font-size: 16px;
	background: white;
}

.element {
	display: flex;
	justify-content: center;
	align-items: center;
	align-self: stretch;
	position: relative;
	flex-grow: 1;
	border-style: solid;
	border-color: black;
	border-width: 0px;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	outline: none;
}

.text {
	align-self: center;
	text-align: center;
	white-space: pre-wrap;
	background: black;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

img {
	display: block;
}

.icon {
	width: 1em;
	height: 1em;
}
.icon>svg {
	width: 100%;
	height: 100%;
}
`
