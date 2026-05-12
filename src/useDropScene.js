import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import Matter from 'matter-js'

const { Bodies, Body, Composite, Engine, Events } = Matter

const FIXED_DELTA = 1000 / 60

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI
}

function buildSceneMetrics({
  stageWidth,
  stageHeight,
  containerAssetWidth,
  containerAssetHeight,
  tableAssetWidth,
  tableAssetHeight,
  containerScale,
  tableScale,
  dropHeight,
  impactOffset,
  landingDepth,
  containerYOffset = 0,
}) {
  const tableWidth = 232 * tableScale
  const tableHeight = (tableWidth * tableAssetHeight) / tableAssetWidth
  const tableX = (stageWidth - tableWidth) / 2
  const tableY = stageHeight * 0.62
  const supportY = tableY + tableHeight * 0.34 + landingDepth + containerYOffset
  const deckHeight = 10

  const dropWidth = 132 * containerScale
  const dropHeightOnStage = (dropWidth * containerAssetHeight) / containerAssetWidth
  const targetX = stageWidth / 2
  const targetY = supportY - dropHeightOnStage / 2

  return {
    stageWidth,
    stageHeight,
    table: {
      x: tableX,
      y: tableY,
      width: tableWidth,
      height: tableHeight,
      supportY,
      deck: {
        x: targetX,
        y: supportY + deckHeight / 2,
        width: tableWidth * 0.48,
        height: deckHeight,
      },
    },
    drop: {
      width: dropWidth,
      height: dropHeightOnStage,
      start: {
        x: targetX + impactOffset,
        y: targetY - dropHeight,
      },
      target: {
        x: targetX,
        y: targetY,
      },
    },
  }
}

function createFrame(scene) {
  return {
    drop: {
      x: scene.drop.start.x,
      y: scene.drop.start.y,
      angle: 0,
    },
    shadow: {
      x: scene.table.deck.x,
      y: scene.table.y + scene.table.height + 22,
      radiusX: scene.drop.width * 0.28,
      radiusY: scene.drop.width * 0.1,
      opacity: 0.05,
    },
    dust: [],
    phaseLabel: 'Falling',
  }
}

function spawnDustParticles(point, strength) {
  const particleCount = Math.round(4 + strength * 8)
  const particles = []

  for (let index = 0; index < particleCount; index += 1) {
    const drift = particleCount === 1 ? 0 : index / (particleCount - 1)
    const spread = (drift - 0.5) * (28 + strength * 26)
    const lift = 1.6 + Math.random() * 3.6 + strength * 2.2
    const radius = 3 + Math.random() * 5.2 + strength * 1.4

    particles.push({
      id: `${performance.now()}-${index}`,
      x: point.x + spread * 0.3,
      y: point.y + 1 + Math.random() * 4,
      vx: spread * 0.05,
      vy: -lift,
      radiusX: radius,
      radiusY: radius * 0.38,
      life: 18 + Math.random() * 18,
      maxLife: 18 + Math.random() * 18,
    })
  }

  return particles
}

export function useDropScene({
  stageWidth,
  stageHeight,
  containerAssetWidth,
  containerAssetHeight,
  tableAssetWidth,
  tableAssetHeight,
  containerScale,
  tableScale,
  dropAngle,
  impactOffset,
  dropHeight,
  landingDepth,
  containerYOffset,
  settleSoftness,
  dustStrength,
  replayToken,
}) {
  const scene = useMemo(
    () =>
      buildSceneMetrics({
        stageWidth,
        stageHeight,
        containerAssetWidth,
        containerAssetHeight,
        tableAssetWidth,
        tableAssetHeight,
        containerScale,
        tableScale,
        dropHeight,
        impactOffset,
        landingDepth,
        containerYOffset,
      }),
    [
      containerAssetHeight,
      containerAssetWidth,
      containerScale,
      dropHeight,
      impactOffset,
      landingDepth,
      containerYOffset,
      stageHeight,
      stageWidth,
      tableAssetHeight,
      tableAssetWidth,
      tableScale,
    ],
  )

  const [frame, setFrame] = useState(() => createFrame(scene))

  const syncFrame = useEffectEvent((body, particles, phase) => {
    const distanceToRest = clamp(scene.drop.target.y - body.position.y, 0, 260)
    const liftBlend = 1 - distanceToRest / 260
    const settledBlend = clamp(1 - Math.abs(body.angle) / 0.35, 0.2, 1)

    setFrame({
      drop: {
        x: body.position.x,
        y: body.position.y,
        angle: toDegrees(body.angle),
      },
      shadow: {
        x: clamp(
          body.position.x,
          scene.table.deck.x - scene.table.deck.width * 0.38,
          scene.table.deck.x + scene.table.deck.width * 0.38,
        ),
        y: scene.table.y + scene.table.height + 22,
        radiusX: scene.drop.width * (0.28 + liftBlend * 0.18),
        radiusY: scene.drop.width * (0.09 + liftBlend * 0.05),
        opacity: 0.04 + liftBlend * settledBlend * 0.18,
      },
      dust: particles.map((particle) => ({
        id: particle.id,
        x: particle.x,
        y: particle.y,
        radiusX: particle.radiusX,
        radiusY: particle.radiusY,
        opacity: particle.life / particle.maxLife,
      })),
      phaseLabel:
        phase === 'resting'
          ? 'Resting'
          : phase === 'settling'
            ? 'Settling'
            : 'Falling',
    })
  })

  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 1.02 },
    })

    engine.positionIterations = 8
    engine.velocityIterations = 7
    engine.constraintIterations = 2
    engine.enableSleeping = true

    const deck = Bodies.rectangle(
      scene.table.deck.x,
      scene.table.deck.y,
      scene.table.deck.width,
      scene.table.deck.height,
      {
        isStatic: true,
        label: 'deck',
        friction: 0.92,
        restitution: 0.02,
      },
    )

    const floor = Bodies.rectangle(
      stageWidth / 2,
      stageHeight + 96,
      stageWidth * 2,
      160,
      {
        isStatic: true,
        label: 'floor',
      },
    )

    const drop = Bodies.rectangle(
      scene.drop.start.x,
      scene.drop.start.y,
      scene.drop.width,
      scene.drop.height,
      {
        label: 'drop',
        friction: 0.58,
        frictionAir: 0.024,
        restitution: 0.04,
        density: 0.0014,
        sleepThreshold: 22,
        chamfer: {
          radius: 8 * containerScale,
        },
      },
    )

    Body.setAngle(drop, toRadians(dropAngle))
    Body.setVelocity(drop, {
      x: clamp(-impactOffset * 0.028, -2.2, 2.2),
      y: 0,
    })
    Body.setAngularVelocity(drop, toRadians(dropAngle) * 0.02)

    Composite.add(engine.world, [deck, floor, drop])

    let animationFrameId = 0
    let lastTime = 0
    let accumulator = 0
    let phase = 'falling'
    let impactTime = null
    let particles = []

    const handleImpact = (event) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label]
        if (labels.includes('drop') && labels.includes('deck') && impactTime === null) {
          impactTime = engine.timing.timestamp
          phase = 'settling'
          const supportPoint = pair.collision.supports[0] ?? {
            x: drop.position.x,
            y: scene.table.supportY,
          }
          particles = spawnDustParticles(supportPoint, dustStrength)
        }
      }
    }

    Events.on(engine, 'collisionStart', handleImpact)

    const stepDust = () => {
      particles = particles
        .map((particle) => {
          const nextLife = particle.life - 1
          return {
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.94,
            vy: particle.vy + 0.18,
            radiusX: particle.radiusX * 1.01,
            radiusY: particle.radiusY * 0.992,
            life: nextLife,
          }
        })
        .filter((particle) => particle.life > 0)
    }

    const stepAssist = () => {
      if (impactTime === null) {
        return
      }

      const elapsed = engine.timing.timestamp - impactTime
      const dx = scene.drop.target.x - drop.position.x
      const dy = scene.drop.target.y - drop.position.y

      if (elapsed > 210) {
        const settleProgress = clamp((elapsed - 210) / 780, 0, 1)
        const assistStrength =
          (0.008 + settleSoftness * 0.012) * (0.5 + settleProgress * 0.5)

        Body.setPosition(drop, {
          x: drop.position.x + dx * assistStrength * 0.84,
          y: drop.position.y + dy * assistStrength * 0.96,
        })

        Body.setAngle(drop, drop.angle + (0 - drop.angle) * assistStrength * 0.88)

        Body.setVelocity(drop, {
          x: drop.velocity.x * (1 - assistStrength * 0.92),
          y: drop.velocity.y * (1 - assistStrength * 0.74),
        })

        Body.setAngularVelocity(drop, drop.angularVelocity * (1 - assistStrength * 1.1))
      }

      if (elapsed > 1120 && Math.abs(drop.angle) < 0.012 && drop.speed < 0.12) {
        phase = 'resting'
      }
    }

    const tick = (timestamp) => {
      if (lastTime === 0) {
        lastTime = timestamp
      }

      const frameDelta = Math.min(timestamp - lastTime, 32)
      lastTime = timestamp
      accumulator += frameDelta

      while (accumulator >= FIXED_DELTA) {
        Engine.update(engine, FIXED_DELTA)
        stepAssist()
        stepDust()
        accumulator -= FIXED_DELTA
      }

      syncFrame(drop, particles, phase)
      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      Events.off(engine, 'collisionStart', handleImpact)
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [
    containerAssetHeight,
    containerAssetWidth,
    containerScale,
    dropAngle,
    dustStrength,
    impactOffset,
    landingDepth,
    containerYOffset,
    replayToken,
    scene,
    settleSoftness,
    stageHeight,
    stageWidth,
    tableAssetHeight,
    tableAssetWidth,
    tableScale,
  ])

  return { scene, frame }
}
