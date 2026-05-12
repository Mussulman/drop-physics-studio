import containerLightRaw from './assets/ecta/container-light.svg?raw'
import tableLightRaw from './assets/ecta/table-light.svg?raw'
import containerDarkRaw from './assets/ecta/container-dark.svg?raw'
import tableDarkRaw from './assets/ecta/table-dark.svg?raw'

const RAW_ASSETS = {
  light: {
    container: {
      raw: containerLightRaw,
      originalFill: '#ffffff',
      viewBox: '178.332031 148.773438 394.550781 448.015625',
      width: 394.550781,
      height: 448.015625,
    },
    table: {
      raw: tableLightRaw,
      originalFill: '#ffffff',
      viewBox: '101.570312 182.996094 546.859376 384.007812',
      width: 546.859376,
      height: 384.007812,
    },
  },
  dark: {
    container: {
      raw: containerDarkRaw,
      originalFill: '#000000',
      viewBox: '178.332031 148.773438 394.550781 448.015625',
      width: 394.550781,
      height: 448.015625,
    },
    table: {
      raw: tableDarkRaw,
      originalFill: '#000000',
      viewBox: '101.570312 182.996094 546.859376 384.007812',
      width: 546.859376,
      height: 384.007812,
    },
  },
}

function encodeSvg(svgMarkup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
}

function buildSvgAsset(asset, fillColor) {
  const svgMarkup = asset.raw
    .replace(/width="[^"]+"/, `width="${asset.width}"`)
    .replace(/height="[^"]+"/, `height="${asset.height}"`)
    .replace(/viewBox="[^"]+"/, `viewBox="${asset.viewBox}"`)
    .replaceAll(`fill="${asset.originalFill}"`, `fill="${fillColor}"`)

  return {
    url: encodeSvg(svgMarkup),
    width: asset.width,
    height: asset.height,
  }
}

export function buildProvidedAssetSet(mode, containerFill, tableFill) {
  const modeAssets = RAW_ASSETS[mode]

  return {
    container: buildSvgAsset(modeAssets.container, containerFill),
    table: buildSvgAsset(modeAssets.table, tableFill),
  }
}
