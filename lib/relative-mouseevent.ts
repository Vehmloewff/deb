/* Modified from https://stackoverflow.com/a/33347664/10533154 */

export function relativeMouseEvent(event: MouseEvent, target: HTMLElement) {
	const bounds = target.getBoundingClientRect()
	const x = event.clientX - bounds.left
	const y = event.clientY - bounds.top
	return { x, y }
}
