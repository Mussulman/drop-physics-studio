import driveDarkRaw from './assets/olga/drive-dark.svg?raw'
import driveLightRaw from './assets/olga/drive-light.svg?raw'
import internetDarkRaw from './assets/olga/internet-dark.svg?raw'
import internetLightRaw from './assets/olga/internet-light.svg?raw'

const START_VIEW_ASSETS = {
  dark: {
    internet: {
      raw: internetDarkRaw,
      width: 750,
      height: 750,
    },
    drive: {
      raw: driveDarkRaw,
      width: 750,
      height: 750,
    },
  },
  light: {
    internet: {
      raw: internetLightRaw,
      width: 750,
      height: 750,
    },
    drive: {
      raw: driveLightRaw,
      width: 750,
      height: 750,
    },
  },
}

function encodeSvg(svgMarkup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
}

function buildSvgAsset(asset) {
  const svgMarkup = asset.raw
    .replace(/width="[^"]+"/, `width="${asset.width}"`)
    .replace(/height="[^"]+"/, `height="${asset.height}"`)

  return {
    url: encodeSvg(svgMarkup),
    width: asset.width,
    height: asset.height,
  }
}

export function buildStartViewAssetSet(mode) {
  const assets = START_VIEW_ASSETS[mode]

  return {
    internet: buildSvgAsset(assets.internet),
    drive: buildSvgAsset(assets.drive),
  }
}
