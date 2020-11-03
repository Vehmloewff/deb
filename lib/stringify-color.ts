import { Color, colorDefaults, LinearGrad, RadialGrad } from '../mod.ts'

export function stringifyColor(color: Color): string {
	if (Array.isArray(color)) return color.map(color => stringifyColor(color)).join(',')

	const stopMapper = (stop: RadialGrad['stops'][0]) => {
		const useStarts = stop.starts === undefined || stop.starts === null
		return `${stringifyColor(stop.color)} ${useStarts ? stop.starts * 100 + '%' : ''}`
	}

	const isLinearGrad = (v: any): v is LinearGrad => 'type' in v && v.type === 'linear-grad'
	const isRadialGrad = (v: any): v is RadialGrad => 'type' in v && v.type === 'radial-grad'

	// Try color strings
	if (typeof color === 'string') return colorDefaults[color]
	// A linear gradients
	else if (isLinearGrad(color)) {
		const angle = color.angle ?? 0
		const stops = color.stops.map(stopMapper)

		return `linear-gradient(${angle}deg, ${stops.join(', ')})`
	}

	// Try radial gradients
	else if (isRadialGrad(color)) {
		// radial gradient
		const percentX = (color?.position?.x ?? 0.5) * 100
		const percentY = (color?.position?.y ?? 0.5) * 100
		const shape = color.circle ? 'circle' : 'ellipse'
		const extent = color.extent ?? 'closest-side'
		const stops = color.stops.map(stopMapper)
		const hint = (color.hint ?? 0.5) * 100

		return `radial-gradient(${percentX}% ${percentY}%, ${shape}, ${extent}, ${stops.join(', ')}, ${hint})`
	}

	// Try hex codes
	else if (color.hex) {
		return color.hex
	}

	// Try rgba values
	else if (color.rgb) {
		return `rgb${color.rgb.length === 4 ? 'a' : ''}(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${color.rgb[3]})`
	}

	// Nothing left to try: 😢
	throw new Error(`Invalid data in Color object`)
}
