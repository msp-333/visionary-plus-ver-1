'use client'

import React from 'react'
import { Eye, TestId, TestResult } from '../app/(app)/tests/types'
import { RunTumblingE } from './RunTumblingE'
import {
  ContrastTest,
  AmslerGrid,
  AstigmatismDial,
  Duochrome,
  ColorArrangement,
  ReadingSpeed,
  NPC,
  Accommodation,
  GlareSensitivity,
  EyeDominance,
  Worth4Dot,
  Stereopsis,
  VisualField,
  OSDI,
  CISS,
  CVS,
  NightVision,
  PDRuler,
} from './legacy/LegacyTests'

export default function TestHost({
  id,
  pxPerMM,
  distanceCm,
  eye, // not used internally, preserved for compatibility / future UI
  onResult,
  paused,
}: {
  id: TestId
  pxPerMM: number | null
  distanceCm: number
  eye: Eye
  paused?: boolean
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  switch (id) {
    case 'acuity-near':
      return <RunTumblingE variant="near" pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} paused={paused} />
    case 'acuity-distance':
      return <RunTumblingE variant="distance" pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} paused={paused} />
    case 'contrast':
      return <ContrastTest pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'amsler':
      return <AmslerGrid onResult={onResult} />
    case 'astigmatism':
      return <AstigmatismDial onResult={onResult} />
    case 'duochrome':
      return <Duochrome onResult={onResult} />
    case 'color-arrangement':
      return <ColorArrangement onResult={onResult} />
    case 'reading-speed':
      return <ReadingSpeed onResult={onResult} />
    case 'npc':
      return <NPC onResult={onResult} />
    case 'accommodation':
      return <Accommodation onResult={onResult} />
    case 'glare':
      return <GlareSensitivity onResult={onResult} />
    case 'eye-dominance':
      return <EyeDominance onResult={onResult} />
    case 'worth-4-dot':
      return <Worth4Dot onResult={onResult} />
    case 'stereopsis':
      return <Stereopsis pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'visual-field':
      return <VisualField onResult={onResult} />
    case 'osdi':
      return <OSDI onResult={onResult} />
    case 'ciss':
      return <CISS onResult={onResult} />
    case 'cvs':
      return <CVS onResult={onResult} />
    case 'night-vision':
      return <NightVision onResult={onResult} />
    case 'pd-ruler':
      return <PDRuler pxPerMM={pxPerMM} onResult={onResult} />
    default:
      return null
  }
}
