export const PALETTE_GROUPS = [
  {
    id: 'original',
    label: 'Original',
    swatches: [
      {
        id: 'original',
        name: 'Original',
        light: '#ffffff',
        dark: '#000000',
        glow: '#d9d9d9',
      },
    ],
  },
  {
    id: 'pastel',
    label: 'Pastel',
    swatches: [
      { id: 'pastel-rose', name: 'Pastel Rose', hex: '#f6c4d8', glow: '#ffddea' },
      { id: 'pastel-sky', name: 'Pastel Sky', hex: '#b8d8ff', glow: '#d9ebff' },
      { id: 'pastel-mint', name: 'Pastel Mint', hex: '#c9ecd7', glow: '#e4f8eb' },
      { id: 'pastel-lilac', name: 'Pastel Lilac', hex: '#d8c7ff', glow: '#ece2ff' },
    ],
  },
  {
    id: 'vaporwave',
    label: 'Vaporwave',
    swatches: [
      { id: 'vapor-pink', name: 'Vapor Pink', hex: '#ff71ce', glow: '#ffc4ea' },
      { id: 'vapor-cyan', name: 'Vapor Cyan', hex: '#01cdfe', glow: '#b8f3ff' },
      { id: 'vapor-purple', name: 'Vapor Purple', hex: '#b967ff', glow: '#ebceff' },
      { id: 'vapor-peach', name: 'Vapor Peach', hex: '#ffb48a', glow: '#ffe0cd' },
    ],
  },
  {
    id: 'candy',
    label: 'Candy',
    swatches: [
      { id: 'candy-orange', name: 'Candy Orange', hex: '#ff8a5b', glow: '#ffd3bf' },
      { id: 'candy-lemon', name: 'Candy Lemon', hex: '#f7da57', glow: '#fff2b7' },
      { id: 'candy-lime', name: 'Candy Lime', hex: '#88da63', glow: '#d7f5c9' },
      { id: 'candy-blue', name: 'Candy Blue', hex: '#5b8dff', glow: '#cad7ff' },
    ],
  },
  {
    id: 'earth',
    label: 'Earth',
    swatches: [
      { id: 'earth-clay', name: 'Clay', hex: '#b86f52', glow: '#e7c5b7' },
      { id: 'earth-sand', name: 'Sand', hex: '#c9af7a', glow: '#eadfca' },
      { id: 'earth-moss', name: 'Moss', hex: '#718d57', glow: '#d3dfc8' },
      { id: 'earth-slate', name: 'Slate', hex: '#5e7088', glow: '#ccd5df' },
    ],
  },
]

export const THEME_GROUPS = [
  {
    id: 'theme-original-group',
    label: 'Original',
    swatches: [
      {
        id: 'theme-original',
        name: 'Original',
        light: '#7fd958',
        dark: '#aa149b',
        glow: '#f4b8eb',
        saturate: 1,
      },
    ],
  },
  {
    id: 'theme-pastel',
    label: 'Pastel',
    swatches: [
      { id: 'theme-pastel-mint', name: 'Mint', hex: '#9de7b0', glow: '#dcf8e4', saturate: 0.88 },
      { id: 'theme-pastel-sky', name: 'Sky', hex: '#90d8ff', glow: '#d8f0ff', saturate: 0.86 },
      { id: 'theme-pastel-blush', name: 'Blush', hex: '#ffb6d0', glow: '#ffe0eb', saturate: 0.84 },
      { id: 'theme-pastel-lilac', name: 'Lilac', hex: '#c6b5ff', glow: '#ebe4ff', saturate: 0.86 },
    ],
  },
  {
    id: 'theme-vaporwave',
    label: 'Vaporwave',
    swatches: [
      { id: 'theme-vapor-fuchsia', name: 'Fuchsia', hex: '#ff59d1', glow: '#ffc6f0', saturate: 1.22 },
      { id: 'theme-vapor-aqua', name: 'Aqua', hex: '#48f1ff', glow: '#cafbff', saturate: 1.24 },
      { id: 'theme-vapor-ultraviolet', name: 'Ultraviolet', hex: '#9c67ff', glow: '#e3d7ff', saturate: 1.2 },
      { id: 'theme-vapor-sunset', name: 'Sunset', hex: '#ff8f80', glow: '#ffd9d3', saturate: 1.14 },
    ],
  },
  {
    id: 'theme-candy',
    label: 'Candy',
    swatches: [
      { id: 'theme-candy-lemon', name: 'Lemon', hex: '#e6d33e', glow: '#fff7bd', saturate: 1.08 },
      { id: 'theme-candy-orange', name: 'Orange', hex: '#ff8a48', glow: '#ffd4bd', saturate: 1.12 },
      { id: 'theme-candy-berry', name: 'Berry', hex: '#ff5d8d', glow: '#ffc7d7', saturate: 1.1 },
      { id: 'theme-candy-grape', name: 'Grape', hex: '#7a64ff', glow: '#dad4ff', saturate: 1.1 },
    ],
  },
  {
    id: 'theme-earth',
    label: 'Earth',
    swatches: [
      { id: 'theme-earth-moss', name: 'Moss', hex: '#506b2f', glow: '#ccd8bb', saturate: 0.82 },
      { id: 'theme-earth-clay', name: 'Clay', hex: '#b26444', glow: '#e7c8bd', saturate: 0.82 },
      { id: 'theme-earth-lagoon', name: 'Lagoon', hex: '#2d6d78', glow: '#c6dfe3', saturate: 0.86 },
      { id: 'theme-earth-ember', name: 'Ember', hex: '#8f4a34', glow: '#dabfb6', saturate: 0.84 },
    ],
  },
  {
    id: 'theme-neon',
    label: 'Neon',
    swatches: [
      { id: 'theme-neon-lime', name: 'Lime', hex: '#9dff2e', glow: '#e8ffc5', saturate: 1.36 },
      { id: 'theme-neon-cyan', name: 'Cyan', hex: '#14f8ff', glow: '#c6fdff', saturate: 1.34 },
      { id: 'theme-neon-punch', name: 'Punch', hex: '#ff3dac', glow: '#ffc6e7', saturate: 1.3 },
      { id: 'theme-neon-iris', name: 'Iris', hex: '#6d52ff', glow: '#d8d1ff', saturate: 1.28 },
    ],
  },
]

export const SCREEN_MODES = {
  light: {
    id: 'light',
    label: 'Light',
    pageBackground:
      'radial-gradient(circle at top left, #fff8ec 0%, #f5ecdd 44%, #dfd6ca 100%)',
    panelBackground: 'rgba(255, 252, 247, 0.78)',
    panelBorder: 'rgba(26, 20, 11, 0.08)',
    panelShadow: '0 24px 64px rgba(70, 54, 33, 0.12)',
    inkStrong: '#18120d',
    inkSoft: '#5f5140',
    inkFaint: '#8a7965',
    accent: '#d97733',
    accentSoft: 'rgba(217, 119, 51, 0.12)',
    accentStrong: '#c76322',
    deviceShell:
      'linear-gradient(165deg, rgba(255,255,255,0.94), rgba(225, 216, 204, 0.78))',
    deviceBezel: 'rgba(37, 28, 19, 0.12)',
    screenBackground: '#f4ede1',
    screenBorder: 'rgba(30, 22, 14, 0.12)',
    screenShadow: '0 44px 90px rgba(83, 62, 40, 0.24)',
    screenGlow: 'rgba(255, 240, 212, 0.75)',
    screenVeilStart: 'rgba(255,255,255,0.84)',
    screenVeilEnd: 'rgba(244, 237, 225, 0.98)',
    sceneGlow: 'rgba(255, 248, 234, 0.82)',
    floorGlow: 'rgba(181, 163, 139, 0.16)',
    stroke: 'rgba(27, 21, 15, 0.78)',
    seam: 'rgba(255, 255, 255, 0.72)',
    dropShadow: 'rgba(43, 33, 21, 0.18)',
    dust: 'rgba(68, 53, 36, 0.24)',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    pageBackground:
      'radial-gradient(circle at top left, #24364f 0%, #0f1722 34%, #06080d 100%)',
    panelBackground: 'rgba(10, 14, 20, 0.78)',
    panelBorder: 'rgba(255, 255, 255, 0.08)',
    panelShadow: '0 28px 70px rgba(0, 0, 0, 0.42)',
    inkStrong: '#f4efe8',
    inkSoft: '#bbb4ab',
    inkFaint: '#8c8a87',
    accent: '#7ed5ff',
    accentSoft: 'rgba(126, 213, 255, 0.12)',
    accentStrong: '#5cc5ff',
    deviceShell:
      'linear-gradient(165deg, rgba(24, 31, 42, 0.98), rgba(9, 12, 18, 0.92))',
    deviceBezel: 'rgba(255, 255, 255, 0.08)',
    screenBackground: '#070a10',
    screenBorder: 'rgba(255, 255, 255, 0.08)',
    screenShadow: '0 44px 96px rgba(0, 0, 0, 0.44)',
    screenGlow: 'rgba(47, 84, 138, 0.34)',
    screenVeilStart: 'rgba(12, 17, 23, 0.95)',
    screenVeilEnd: 'rgba(5, 7, 11, 1)',
    sceneGlow: 'rgba(32, 52, 90, 0.32)',
    floorGlow: 'rgba(86, 110, 154, 0.12)',
    stroke: 'rgba(247, 240, 230, 0.76)',
    seam: 'rgba(255, 255, 255, 0.22)',
    dropShadow: 'rgba(0, 0, 0, 0.38)',
    dust: 'rgba(173, 190, 212, 0.18)',
  },
}

function findSwatch(groups, swatchId) {
  for (const group of groups) {
    for (const swatch of group.swatches) {
      if (swatch.id === swatchId) {
        return swatch
      }
    }
  }

  return null
}

function hexToHsl(hex) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const delta = maximum - minimum
  let hue = 0
  const lightness = (maximum + minimum) / 2

  if (delta !== 0) {
    if (maximum === red) {
      hue = ((green - blue) / delta) % 6
    } else if (maximum === green) {
      hue = (blue - red) / delta + 2
    } else {
      hue = (red - green) / delta + 4
    }
  }

  hue = Math.round(hue * 60)

  if (hue < 0) {
    hue += 360
  }

  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))

  return {
    h: hue,
    s: saturation,
    l: lightness,
  }
}

export function resolvePaletteColor(swatchId, mode) {
  const swatch = findSwatch(PALETTE_GROUPS, swatchId)

  if (!swatch) {
    return mode === 'dark' ? '#000000' : '#ffffff'
  }

  if (swatch.light && swatch.dark) {
    return mode === 'dark' ? swatch.dark : swatch.light
  }

  return swatch.hex
}

export function resolveThemePreviewColor(swatchId, mode) {
  const swatch = findSwatch(THEME_GROUPS, swatchId)

  if (!swatch) {
    return mode === 'dark' ? '#aa149b' : '#7fd958'
  }

  if (swatch.light && swatch.dark) {
    return mode === 'dark' ? swatch.dark : swatch.light
  }

  return swatch.hex
}

export function buildThemeIconFilter(swatchId, mode) {
  if (swatchId === 'theme-original') {
    return 'none'
  }

  const swatch = findSwatch(THEME_GROUPS, swatchId)

  if (!swatch?.hex) {
    return 'none'
  }

  const sourceHue = mode === 'dark' ? 306 : 110
  const { h } = hexToHsl(swatch.hex)
  const rotation = Math.round(h - sourceHue)
  const saturation = swatch.saturate ?? 1

  return `hue-rotate(${rotation}deg) saturate(${saturation})`
}
