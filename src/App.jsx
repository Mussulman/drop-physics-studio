import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  buildThemeIconFilter,
  PALETTE_GROUPS,
  SCREEN_MODES,
  THEME_GROUPS,
  resolvePaletteColor,
  resolveThemePreviewColor,
} from './palettes'
import { buildProvidedAssetSet } from './providedAssets'
import { buildStartViewAssetSet } from './startViewAssets'
import { useDropScene } from './useDropScene'

const ARRIVAL_Y_OFFSET_STORAGE_KEY = 'dropPhysicsArrivalContainerYOffset'
const TEMPORARY_Y_NUDGE_CONTROLS_ENABLED = true

const DEFAULT_ARRIVAL_SETTINGS = {
  containerColorId: 'original',
  tableColorId: 'original',
  containerScale: 1,
  tableScale: 1,
  dropAngle: 10,
  impactOffset: -26,
  landingDepth: 0,
  // Finalize the temporary y-nudge here, then remove TemporaryContainerYControl.
  containerYOffset: 0,
  dropHeight: 228,
  settleSoftness: 78,
  dustStrength: 42,
}

const DEFAULT_SETTINGS = {
  page: 'start',
  mode: 'light',
  themeColorId: 'theme-original',
  daysSinceDrop: 12,
  ...DEFAULT_ARRIVAL_SETTINGS,
}

const START_ACTUAL_KEYS = ['mode', 'themeColorId', 'daysSinceDrop']
const ARRIVAL_ACTUAL_KEYS = [
  'mode',
  'containerColorId',
  'tableColorId',
  'containerScale',
  'tableScale',
  'dropAngle',
  'impactOffset',
  'landingDepth',
  'containerYOffset',
  'dropHeight',
  'settleSoftness',
  'dustStrength',
]

const NUMBER_RANGES = {
  daysSinceDrop: [0, 99],
  containerScale: [0.72, 1.34],
  tableScale: [0.72, 1.34],
  dropAngle: [2, 18],
  impactOffset: [-54, 54],
  landingDepth: [-34, 34],
  containerYOffset: [-64, 64],
  dropHeight: [148, 300],
  settleSoftness: [20, 100],
  dustStrength: [0, 100],
}

const PALETTE_COLOR_IDS = new Set(
  PALETTE_GROUPS.flatMap((group) => group.swatches.map((swatch) => swatch.id)),
)

const THEME_COLOR_IDS = new Set(
  THEME_GROUPS.flatMap((group) => group.swatches.map((swatch) => swatch.id)),
)

function clampValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function getStoredArrivalContainerYOffset() {
  try {
    const storedValue = window.localStorage.getItem(ARRIVAL_Y_OFFSET_STORAGE_KEY)
    const parsedValue = Number(storedValue)

    return Number.isFinite(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

function getDefaultSettings() {
  const storedContainerYOffset = getStoredArrivalContainerYOffset()

  if (storedContainerYOffset === null) {
    return DEFAULT_SETTINGS
  }

  return sanitizeActualSettings({
    ...DEFAULT_SETTINGS,
    containerYOffset: storedContainerYOffset,
  })
}

function finalizeArrivalContainerYOffset(containerYOffset) {
  try {
    window.localStorage.setItem(
      ARRIVAL_Y_OFFSET_STORAGE_KEY,
      String(containerYOffset),
    )
  } catch {
    // The URL still keeps the finalized value when localStorage is blocked.
  }
}

function getNudgedContainerYOffset(currentValue, delta) {
  const [minimum, maximum] = NUMBER_RANGES.containerYOffset
  return clampValue(Number(currentValue) + delta, minimum, maximum)
}

function getActualKeys(page) {
  return page === 'arrival' ? ARRIVAL_ACTUAL_KEYS : START_ACTUAL_KEYS
}

function sanitizeActualSettings(settings) {
  const page = settings.page === 'arrival' ? 'arrival' : 'start'
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    page,
  }

  if (!SCREEN_MODES[nextSettings.mode]) {
    nextSettings.mode = DEFAULT_SETTINGS.mode
  }

  for (const [key, [minimum, maximum]] of Object.entries(NUMBER_RANGES)) {
    const value = Number(nextSettings[key])
    nextSettings[key] = Number.isFinite(value)
      ? clampValue(value, minimum, maximum)
      : DEFAULT_SETTINGS[key]
  }

  if (!PALETTE_COLOR_IDS.has(nextSettings.containerColorId)) {
    nextSettings.containerColorId = DEFAULT_SETTINGS.containerColorId
  }

  if (!PALETTE_COLOR_IDS.has(nextSettings.tableColorId)) {
    nextSettings.tableColorId = DEFAULT_SETTINGS.tableColorId
  }

  if (!THEME_COLOR_IDS.has(nextSettings.themeColorId)) {
    nextSettings.themeColorId = DEFAULT_SETTINGS.themeColorId
  }

  return nextSettings
}

function buildActualPagePath(settings) {
  const sanitizedSettings = sanitizeActualSettings(settings)
  const params = new URLSearchParams()

  for (const key of getActualKeys(sanitizedSettings.page)) {
    params.set(key, String(sanitizedSettings[key]))
  }

  return `/actual/${sanitizedSettings.page}?${params.toString()}`
}

function readActualRouteSettings() {
  const routeMatch = window.location.pathname.match(/^\/actual\/(start|arrival)\/?$/)

  if (!routeMatch) {
    return null
  }

  const page = routeMatch[1]
  const params = new URLSearchParams(window.location.search)
  const routeSettings = {
    ...getDefaultSettings(),
    page,
  }

  for (const key of getActualKeys(page)) {
    if (!params.has(key)) {
      continue
    }

    const value = params.get(key)
    routeSettings[key] = NUMBER_RANGES[key] ? Number(value) : value
  }

  return sanitizeActualSettings(routeSettings)
}

function useViewportSize() {
  const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const [size, setSize] = useState(getSize)

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return size
}

function App() {
  const [routeSettings] = useState(() => readActualRouteSettings())

  if (routeSettings) {
    return <ActualPage initialSettings={routeSettings} />
  }

  return <StudioApp />
}

function StudioApp() {
  const [settings, setSettings] = useState(getDefaultSettings)
  const [replayToken, setReplayToken] = useState(0)

  const isArrivalPage = settings.page === 'arrival'
  const screenMode = SCREEN_MODES[settings.mode]
  const containerColor = resolvePaletteColor(settings.containerColorId, settings.mode)
  const tableColor = resolvePaletteColor(settings.tableColorId, settings.mode)
  const originalSurfaceColor = resolvePaletteColor('original', settings.mode)

  const arrivalAssetSet = useMemo(
    () => buildProvidedAssetSet(settings.mode, containerColor, tableColor),
    [containerColor, settings.mode, tableColor],
  )

  const originalTableAsset = useMemo(
    () =>
      buildProvidedAssetSet(
        settings.mode,
        originalSurfaceColor,
        originalSurfaceColor,
      ).table,
    [originalSurfaceColor, settings.mode],
  )

  const startViewAssets = useMemo(
    () => buildStartViewAssetSet(settings.mode),
    [settings.mode],
  )

  const themeFilter = useMemo(
    () => buildThemeIconFilter(settings.themeColorId, settings.mode),
    [settings.mode, settings.themeColorId],
  )

  const { scene, frame } = useDropScene({
    stageWidth: 390,
    stageHeight: 694,
    containerAssetWidth: arrivalAssetSet.container.width,
    containerAssetHeight: arrivalAssetSet.container.height,
    tableAssetWidth: arrivalAssetSet.table.width,
    tableAssetHeight: arrivalAssetSet.table.height,
    containerScale: settings.containerScale,
    tableScale: settings.tableScale,
    dropAngle: settings.dropAngle,
    impactOffset: settings.impactOffset,
    landingDepth: settings.landingDepth,
    containerYOffset: settings.containerYOffset,
    dropHeight: settings.dropHeight,
    settleSoftness: settings.settleSoftness / 100,
    dustStrength: settings.dustStrength / 100,
    replayToken,
  })

  const updateNumber = (key) => (event) => {
    const nextValue = Number(event.target.value)
    setSettings((current) => ({
      ...current,
      [key]: nextValue,
    }))
  }

  const updateChoice = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const replayAnimation = () => {
    setReplayToken((current) => current + 1)
  }

  const resetArrivalDefaults = () => {
    setSettings((current) => ({
      ...current,
      ...DEFAULT_ARRIVAL_SETTINGS,
    }))
    setReplayToken((current) => current + 1)
  }

  const createActualPage = () => {
    const pageUrl = new URL(buildActualPagePath(settings), window.location.origin)
    const createdWindow = window.open(
      pageUrl.toString(),
      '_blank',
      'noopener,noreferrer',
    )

    if (!createdWindow) {
      window.location.assign(pageUrl.toString())
    }
  }

  return (
    <div
      className={`app-shell is-${settings.mode}`}
      style={{
        '--page-background': screenMode.pageBackground,
        '--panel-background': screenMode.panelBackground,
        '--panel-border': screenMode.panelBorder,
        '--panel-shadow': screenMode.panelShadow,
        '--ink-strong': screenMode.inkStrong,
        '--ink-soft': screenMode.inkSoft,
        '--ink-faint': screenMode.inkFaint,
        '--accent': screenMode.accent,
        '--accent-soft': screenMode.accentSoft,
        '--accent-strong': screenMode.accentStrong,
        '--device-shell': screenMode.deviceShell,
        '--device-bezel': screenMode.deviceBezel,
        '--screen-background': screenMode.screenBackground,
        '--screen-border': screenMode.screenBorder,
        '--screen-shadow': screenMode.screenShadow,
        '--screen-glow': screenMode.screenGlow,
      }}
    >
      <aside className="control-panel">
        <section className="panel-card intro-card">
          <p className="eyebrow">Drop Screen Studio</p>
          <h1>
            {isArrivalPage
              ? 'Arrival physics on the provided drop assets.'
              : 'Starting view page with the new icon asset set.'}
          </h1>
          <p className="intro-copy">
            {isArrivalPage
              ? 'The arrival page keeps the table and container work intact, with motion controls, landing depth, and separate solid fills for the drop hardware.'
              : 'This page uses the new 19-22 icon files, crops them through the SVG viewBox, keeps the original table only, and lets one theme accent drive just the internet arc family and the drop-drive bubble.'}
          </p>
          <div className="intro-actions">
            <button
              type="button"
              className="primary-button"
              onClick={createActualPage}
            >
              Create HTML Page
            </button>
            {isArrivalPage ? (
              <>
              <button
                type="button"
                className="ghost-button"
                onClick={replayAnimation}
              >
                Replay Drop
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={resetArrivalDefaults}
              >
                Reset Arrival
              </button>
              </>
            ) : null}
          </div>
          <div className="status-row">
            <StatusChip
              label="Page"
              value={isArrivalPage ? 'Arrival' : 'Start View'}
            />
            <StatusChip label="Mode" value={screenMode.label} />
            <StatusChip
              label={isArrivalPage ? 'Phase' : 'Days'}
              value={
                isArrivalPage
                  ? frame.phaseLabel
                  : `${String(settings.daysSinceDrop).padStart(2, '0')} days`
              }
            />
          </div>
        </section>

        <section className="panel-card">
          <SectionTitle
            title="Screen Page"
            subtitle="Switch between the new first-view page and the existing drop-arrival page."
          />
          <div className="mode-switch">
            <button
              type="button"
              className={`mode-button ${settings.page === 'start' ? 'is-active' : ''}`}
              onClick={() => updateChoice('page', 'start')}
            >
              <span>Start View</span>
            </button>
            <button
              type="button"
              className={`mode-button ${settings.page === 'arrival' ? 'is-active' : ''}`}
              onClick={() => updateChoice('page', 'arrival')}
            >
              <span>Arrival</span>
            </button>
          </div>
        </section>

        <section className="panel-card">
          <SectionTitle
            title="Screen Mode"
            subtitle="Switch between the provided light and dark device modes."
          />
          <div className="mode-switch">
            {Object.values(SCREEN_MODES).map((modeOption) => (
              <button
                key={modeOption.id}
                type="button"
                className={`mode-button ${
                  settings.mode === modeOption.id ? 'is-active' : ''
                }`}
                onClick={() => updateChoice('mode', modeOption.id)}
              >
                <span>{modeOption.label}</span>
              </button>
            ))}
          </div>
        </section>

        {isArrivalPage ? (
          <>
            <section className="panel-card">
              <SectionTitle
                title="Motion Controls"
                subtitle="Shape the fall, edge hit, and subtle recovery shown in 9.svg."
              />
              <RangeField
                label="Drop angle"
                value={`${settings.dropAngle}°`}
                min="2"
                max="18"
                step="1"
                currentValue={settings.dropAngle}
                onChange={updateNumber('dropAngle')}
              />
              <RangeField
                label="Impact offset"
                value={`${settings.impactOffset > 0 ? '+' : ''}${settings.impactOffset}px`}
                min="-54"
                max="54"
                step="1"
                currentValue={settings.impactOffset}
                onChange={updateNumber('impactOffset')}
              />
              <RangeField
                label="Landing depth (Y)"
                value={`${settings.landingDepth > 0 ? '+' : ''}${settings.landingDepth}px`}
                min="-34"
                max="34"
                step="1"
                currentValue={settings.landingDepth}
                onChange={updateNumber('landingDepth')}
              />
              {TEMPORARY_Y_NUDGE_CONTROLS_ENABLED ? (
                <div className="temporary-y-card">
                  <SectionTitle
                    title="Container Y Nudge"
                    subtitle="Temporary helper: Up/Down moves by 1px. Finalize stores the value so this panel can be removed later."
                  />
                  <TemporaryContainerYControl
                    value={settings.containerYOffset}
                    onUp={() =>
                      updateChoice(
                        'containerYOffset',
                        getNudgedContainerYOffset(settings.containerYOffset, -1),
                      )
                    }
                    onDown={() =>
                      updateChoice(
                        'containerYOffset',
                        getNudgedContainerYOffset(settings.containerYOffset, 1),
                      )
                    }
                    onFinalize={() =>
                      finalizeArrivalContainerYOffset(settings.containerYOffset)
                    }
                  />
                </div>
              ) : null}
              <RangeField
                label="Drop height"
                value={`${settings.dropHeight}px`}
                min="148"
                max="300"
                step="2"
                currentValue={settings.dropHeight}
                onChange={updateNumber('dropHeight')}
              />
              <RangeField
                label="Settle softness"
                value={`${settings.settleSoftness}%`}
                min="20"
                max="100"
                step="1"
                currentValue={settings.settleSoftness}
                onChange={updateNumber('settleSoftness')}
              />
              <RangeField
                label="Dust amount"
                value={`${settings.dustStrength}%`}
                min="0"
                max="100"
                step="1"
                currentValue={settings.dustStrength}
                onChange={updateNumber('dustStrength')}
              />
            </section>

            <section className="panel-card">
              <SectionTitle
                title="Sizing"
                subtitle="Scale the provided container and table assets independently."
              />
              <RangeField
                label="Container size"
                value={`${Math.round(settings.containerScale * 100)}%`}
                min="0.72"
                max="1.34"
                step="0.01"
                currentValue={settings.containerScale}
                onChange={updateNumber('containerScale')}
              />
              <RangeField
                label="Table size"
                value={`${Math.round(settings.tableScale * 100)}%`}
                min="0.72"
                max="1.34"
                step="0.01"
                currentValue={settings.tableScale}
                onChange={updateNumber('tableScale')}
              />
            </section>

            <section className="panel-card">
              <SectionTitle
                title="Container Color"
                subtitle="Choose a solid fill for the provided container asset."
              />
              <PaletteChooser
                groups={PALETTE_GROUPS}
                mode={settings.mode}
                selectedColorId={settings.containerColorId}
                onSelect={(nextColorId) => updateChoice('containerColorId', nextColorId)}
                resolveColor={resolvePaletteColor}
              />
            </section>

            <section className="panel-card">
              <SectionTitle
                title="Table Color"
                subtitle="Choose a solid fill for the provided table asset."
              />
              <PaletteChooser
                groups={PALETTE_GROUPS}
                mode={settings.mode}
                selectedColorId={settings.tableColorId}
                onSelect={(nextColorId) => updateChoice('tableColorId', nextColorId)}
                resolveColor={resolvePaletteColor}
              />
            </section>
          </>
        ) : (
          <>
            <section className="panel-card">
              <SectionTitle
                title="Theme Accent"
                subtitle="Pick one accent family. It only shifts the internet arcs and the drop-drive bubble."
              />
              <PaletteChooser
                groups={THEME_GROUPS}
                mode={settings.mode}
                selectedColorId={settings.themeColorId}
                onSelect={(nextColorId) => updateChoice('themeColorId', nextColorId)}
                resolveColor={resolveThemePreviewColor}
              />
            </section>

            <section className="panel-card">
              <SectionTitle
                title="Days Counter"
                subtitle="Preview the two-digit counter treatment instead of underscore placeholders."
              />
              <RangeField
                label="Days since last drop"
                value={String(settings.daysSinceDrop).padStart(2, '0')}
                min="0"
                max="99"
                step="1"
                currentValue={settings.daysSinceDrop}
                onChange={updateNumber('daysSinceDrop')}
              />
            </section>
          </>
        )}
      </aside>

      <main className="preview-panel">
        <div className="preview-stack">
          <div className="preview-copy">
            <p className="eyebrow">Live Preview</p>
            <h2>
              {isArrivalPage
                ? '9:16 device mockup with the supplied drop assets.'
                : '9:16 first-view screen with the new icon files.'}
            </h2>
            <p>
              {isArrivalPage
                ? 'The motion layer only controls position, angle, dust, and the screen environment around the provided drop and table assets.'
                : 'The start screen uses the new 19-22 SVGs directly, cropped in SVG space, with the theme accent only touching the internet arc family and the drop-drive bubble.'}
            </p>
          </div>

          <div className="device-shell">
            <div className="device-chrome">
              <span className="speaker-pill" aria-hidden="true"></span>
            </div>
            <div className="device-screen">
              {isArrivalPage ? (
                <DeviceStage
                  scene={scene}
                  frame={frame}
                  screenMode={screenMode}
                  assetSet={arrivalAssetSet}
                />
              ) : (
                <StartViewStage
                  mode={settings.mode}
                  assets={startViewAssets}
                  tableAsset={originalTableAsset}
                  themeFilter={themeFilter}
                  daysSinceDrop={settings.daysSinceDrop}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ActualPage({ initialSettings }) {
  const [actualSettings, setActualSettings] = useState(initialSettings)
  const screenMode = SCREEN_MODES[actualSettings.mode]
  const isArrivalPage = actualSettings.page === 'arrival'

  const updateActualChoice = (key, value) => {
    setActualSettings((current) => {
      const nextSettings = sanitizeActualSettings({
        ...current,
        [key]: value,
      })

      window.history.replaceState(null, '', buildActualPagePath(nextSettings))

      return nextSettings
    })
  }

  return (
    <div
      className={`actual-page is-${actualSettings.mode}`}
      style={{
        '--page-background': screenMode.pageBackground,
        '--panel-background': screenMode.panelBackground,
        '--panel-border': screenMode.panelBorder,
        '--panel-shadow': screenMode.panelShadow,
        '--ink-strong': screenMode.inkStrong,
        '--ink-soft': screenMode.inkSoft,
        '--ink-faint': screenMode.inkFaint,
        '--accent': screenMode.accent,
        '--accent-soft': screenMode.accentSoft,
        '--accent-strong': screenMode.accentStrong,
      }}
    >
      <main className="actual-canvas">
        {isArrivalPage ? (
          <ActualArrivalCanvas settings={actualSettings} screenMode={screenMode} />
        ) : (
          <ActualStartCanvas settings={actualSettings} />
        )}
      </main>

      <ActualColorControls
        settings={actualSettings}
        onChoice={updateActualChoice}
      />
    </div>
  )
}

function ActualArrivalCanvas({ settings, screenMode }) {
  const viewportSize = useViewportSize()
  const stageWidth = Math.max(320, Math.round(viewportSize.width))
  const stageHeight = Math.max(480, Math.round(viewportSize.height))
  const sceneScale = Math.max(
    0.92,
    Math.min(stageWidth / 390, stageHeight / 694) * 1.14,
  )
  const containerColor = resolvePaletteColor(
    settings.containerColorId,
    settings.mode,
  )
  const tableColor = resolvePaletteColor(settings.tableColorId, settings.mode)

  const arrivalAssetSet = useMemo(
    () => buildProvidedAssetSet(settings.mode, containerColor, tableColor),
    [containerColor, settings.mode, tableColor],
  )

  const { scene, frame } = useDropScene({
    stageWidth,
    stageHeight,
    containerAssetWidth: arrivalAssetSet.container.width,
    containerAssetHeight: arrivalAssetSet.container.height,
    tableAssetWidth: arrivalAssetSet.table.width,
    tableAssetHeight: arrivalAssetSet.table.height,
    containerScale: settings.containerScale * sceneScale,
    tableScale: settings.tableScale * sceneScale,
    dropAngle: settings.dropAngle,
    impactOffset: settings.impactOffset * sceneScale,
    landingDepth: settings.landingDepth * sceneScale,
    containerYOffset: settings.containerYOffset * sceneScale,
    dropHeight: settings.dropHeight * sceneScale,
    settleSoftness: settings.settleSoftness / 100,
    dustStrength: settings.dustStrength / 100,
    replayToken: 0,
  })

  return (
    <DeviceStage
      scene={scene}
      frame={frame}
      screenMode={screenMode}
      assetSet={arrivalAssetSet}
      label="Drop landing page"
    />
  )
}

function ActualStartCanvas({ settings }) {
  const startViewAssets = useMemo(
    () => buildStartViewAssetSet(settings.mode),
    [settings.mode],
  )
  const originalSurfaceColor = resolvePaletteColor('original', settings.mode)
  const originalTableAsset = useMemo(
    () =>
      buildProvidedAssetSet(
        settings.mode,
        originalSurfaceColor,
        originalSurfaceColor,
      ).table,
    [originalSurfaceColor, settings.mode],
  )
  const themeFilter = useMemo(
    () => buildThemeIconFilter(settings.themeColorId, settings.mode),
    [settings.mode, settings.themeColorId],
  )

  return (
    <StartViewStage
      mode={settings.mode}
      assets={startViewAssets}
      tableAsset={originalTableAsset}
      themeFilter={themeFilter}
      daysSinceDrop={settings.daysSinceDrop}
      fullscreen
    />
  )
}

function ActualColorControls({ settings, onChoice }) {
  const isArrivalPage = settings.page === 'arrival'

  return (
    <aside className="actual-controls" aria-label="Color controls">
      <ActualControlBlock label="Mode">
        <div className="mode-switch actual-mode-switch">
          {Object.values(SCREEN_MODES).map((modeOption) => (
            <button
              key={modeOption.id}
              type="button"
              className={`mode-button ${
                settings.mode === modeOption.id ? 'is-active' : ''
              }`}
              onClick={() => onChoice('mode', modeOption.id)}
            >
              <span>{modeOption.label}</span>
            </button>
          ))}
        </div>
      </ActualControlBlock>

      {isArrivalPage ? (
        <>
          {TEMPORARY_Y_NUDGE_CONTROLS_ENABLED ? (
            <ActualControlBlock label="Container Y">
              <TemporaryContainerYControl
                value={settings.containerYOffset}
                onUp={() =>
                  onChoice(
                    'containerYOffset',
                    getNudgedContainerYOffset(settings.containerYOffset, -1),
                  )
                }
                onDown={() =>
                  onChoice(
                    'containerYOffset',
                    getNudgedContainerYOffset(settings.containerYOffset, 1),
                  )
                }
                onFinalize={() =>
                  finalizeArrivalContainerYOffset(settings.containerYOffset)
                }
              />
            </ActualControlBlock>
          ) : null}

          <ActualControlBlock label="Container">
            <PaletteChooser
              groups={PALETTE_GROUPS}
              mode={settings.mode}
              selectedColorId={settings.containerColorId}
              onSelect={(nextColorId) => onChoice('containerColorId', nextColorId)}
              resolveColor={resolvePaletteColor}
            />
          </ActualControlBlock>

          <ActualControlBlock label="Table">
            <PaletteChooser
              groups={PALETTE_GROUPS}
              mode={settings.mode}
              selectedColorId={settings.tableColorId}
              onSelect={(nextColorId) => onChoice('tableColorId', nextColorId)}
              resolveColor={resolvePaletteColor}
            />
          </ActualControlBlock>
        </>
      ) : (
        <ActualControlBlock label="Theme Accent">
          <PaletteChooser
            groups={THEME_GROUPS}
            mode={settings.mode}
            selectedColorId={settings.themeColorId}
            onSelect={(nextColorId) => onChoice('themeColorId', nextColorId)}
            resolveColor={resolveThemePreviewColor}
          />
        </ActualControlBlock>
      )}
    </aside>
  )
}

function ActualControlBlock({ label, children }) {
  return (
    <div className="actual-control-block">
      <span className="actual-control-label">{label}</span>
      {children}
    </div>
  )
}

function TemporaryContainerYControl({ value, onUp, onDown, onFinalize }) {
  const [savedValue, setSavedValue] = useState(null)
  const formattedValue = `${value > 0 ? '+' : ''}${value}px`

  const finalizeValue = () => {
    onFinalize()
    setSavedValue(value)
  }

  return (
    <div className="temporary-y-controls">
      <div className="temporary-y-value">
        <span>Y offset</span>
        <strong>{formattedValue}</strong>
      </div>
      <div className="temporary-y-actions">
        <button type="button" className="y-nudge-button" onClick={onUp}>
          Up
        </button>
        <button type="button" className="y-nudge-button" onClick={onDown}>
          Down
        </button>
        <button type="button" className="y-finalize-button" onClick={finalizeValue}>
          Finalize
        </button>
      </div>
      <p className="temporary-y-note">
        {savedValue === value
          ? `Saved at ${formattedValue}. Keep this value in containerYOffset, then remove this control.`
          : 'Up decreases Y by 1px. Down increases Y by 1px.'}
      </p>
    </div>
  )
}

function StartViewStage({
  mode,
  assets,
  tableAsset,
  themeFilter,
  daysSinceDrop,
  fullscreen = false,
}) {
  const counterValue = String(Math.max(0, Math.min(99, daysSinceDrop))).padStart(2, '0')

  return (
    <div className={`start-stage is-${mode} ${fullscreen ? 'is-fullscreen' : ''}`}>
      <div className="start-copy-block">
        <p className="start-copy-line">it&apos;s 7:13 PM on 4/13/2025</p>
        <p className="start-copy-line start-copy-line-counter">
          <span>your last drop arrived</span>
          <DayCounter value={counterValue} />
          <span>days ago.</span>
        </p>
      </div>

      <div className="start-icon-row">
        <StartOption
          asset={assets.internet}
          filter={themeFilter}
          variant="internet"
        />
        <StartOption
          asset={assets.drive}
          filter={themeFilter}
          variant="drive"
        />
      </div>

      <div className="start-table-wrap">
        <img
          className="start-table"
          src={tableAsset.url}
          alt=""
          draggable="false"
        />
      </div>
    </div>
  )
}

function StartOption({ asset, filter, variant }) {
  return (
    <div className={`start-option is-${variant}`}>
      <img
        className="start-option-art"
        src={asset.url}
        alt=""
        draggable="false"
        style={{
          filter,
        }}
      />
    </div>
  )
}

function DayCounter({ value }) {
  return (
    <span className="day-counter" aria-label={`${value} days`}>
      {value.split('').map((digit, index) => (
        <span key={`${digit}-${index}`} className="day-counter-slot">
          {digit}
        </span>
      ))}
    </span>
  )
}

function DeviceStage({
  scene,
  frame,
  screenMode,
  assetSet,
  label = 'Drop landing animation preview',
}) {
  return (
    <svg
      className="device-stage"
      viewBox={`0 0 ${scene.stageWidth} ${scene.stageHeight}`}
      aria-label={label}
      role="img"
    >
      <defs>
        <linearGradient id="screen-wash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={screenMode.screenVeilStart} />
          <stop offset="100%" stopColor={screenMode.screenVeilEnd} />
        </linearGradient>
        <radialGradient id="scene-glow" cx="50%" cy="26%" r="72%">
          <stop offset="0%" stopColor={screenMode.sceneGlow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="soft-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>
        <filter id="dust-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <rect
        x="0"
        y="0"
        width={scene.stageWidth}
        height={scene.stageHeight}
        fill="url(#screen-wash)"
      />
      <rect
        x="0"
        y="0"
        width={scene.stageWidth}
        height={scene.stageHeight}
        fill="url(#scene-glow)"
      />
      <ellipse
        cx={scene.stageWidth / 2}
        cy={scene.stageHeight * 0.9}
        rx={scene.stageWidth * 0.48}
        ry={scene.stageHeight * 0.08}
        fill={screenMode.floorGlow}
        opacity="0.9"
      />

      <ellipse
        cx={frame.shadow.x}
        cy={frame.shadow.y}
        rx={frame.shadow.radiusX}
        ry={frame.shadow.radiusY}
        fill={screenMode.dropShadow}
        opacity={frame.shadow.opacity}
        filter="url(#soft-blur)"
      />

      <image
        href={assetSet.table.url}
        x={scene.table.x}
        y={scene.table.y}
        width={scene.table.width}
        height={scene.table.height}
        preserveAspectRatio="none"
      />

      {frame.dust.map((particle) => (
        <ellipse
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          rx={particle.radiusX}
          ry={particle.radiusY}
          fill={screenMode.dust}
          opacity={particle.opacity}
          filter="url(#dust-blur)"
        />
      ))}

      <g
        transform={`translate(${frame.drop.x} ${frame.drop.y}) rotate(${frame.drop.angle})`}
      >
        <image
          href={assetSet.container.url}
          x={-scene.drop.width / 2}
          y={-scene.drop.height / 2}
          width={scene.drop.width}
          height={scene.drop.height}
          preserveAspectRatio="none"
        />
      </g>
    </svg>
  )
}

function PaletteChooser({
  groups,
  mode,
  selectedColorId,
  onSelect,
  resolveColor,
}) {
  return (
    <div className="palette-chooser">
      {groups.map((group) => (
        <div key={group.id} className="palette-group">
          <span className="palette-label">{group.label}</span>
          <div className="swatch-row">
            {group.swatches.map((swatch) => {
              const color = resolveColor(swatch.id, mode)

              return (
                <button
                  key={swatch.id}
                  type="button"
                  className={`swatch-button ${
                    selectedColorId === swatch.id ? 'is-active' : ''
                  }`}
                  onClick={() => onSelect(swatch.id)}
                  title={swatch.name}
                  aria-label={swatch.name}
                >
                  <span
                    className="swatch-fill"
                    style={{
                      '--swatch-color': color,
                      '--swatch-glow': swatch.glow,
                    }}
                  ></span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  )
}

function StatusChip({ label, value }) {
  return (
    <div className="status-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  currentValue,
  onChange,
}) {
  return (
    <label className="range-field">
      <div className="range-copy">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={onChange}
      />
    </label>
  )
}

export default App
