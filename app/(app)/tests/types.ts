export type Eye = 'OD' | 'OS' | 'OU'
export type Category = 'score' | 'self' | 'accessory'

export type TestId =
  | 'acuity-near'
  | 'acuity-distance'
  | 'contrast'
  | 'amsler'
  | 'astigmatism'
  | 'duochrome'
  | 'color-arrangement'
  | 'reading-speed'
  | 'npc'
  | 'accommodation'
  | 'glare'
  | 'eye-dominance'
  | 'worth-4-dot'
  | 'stereopsis'
  | 'visual-field'
  | 'osdi'
  | 'ciss'
  | 'cvs'
  | 'night-vision'
  | 'pd-ruler'

export type TestMeta = {
  id: TestId
  label: string
  category: Category
  short: string
  notes?: string
  needsCalibration?: boolean
  needsDistance?: boolean
}

export type TestResult = {
  id: TestId
  label: string
  category: Category
  eye: Eye
  value: string
  unit?: string
  notes?: string
  extra?: Record<string, string | number | boolean>
  distanceCm?: number
  timestamp: number
}

export const TESTS: TestMeta[] = [
  { id: 'acuity-near', label: 'Near Visual Acuity (Tumbling E)', category: 'score', short: 'Sharpness at 40 cm', needsCalibration: true, needsDistance: true },
  { id: 'acuity-distance', label: 'Distance Visual Acuity (Tumbling E)', category: 'score', short: 'Sharpness at 2–3 m', needsCalibration: true, needsDistance: true },
  { id: 'contrast', label: 'Contrast Sensitivity (letter threshold)', category: 'score', short: 'Low-contrast seeing', needsCalibration: true, needsDistance: true },
  { id: 'color-arrangement', label: 'Color Arrangement (Mini D‑15 style)', category: 'score', short: 'Color ordering error score' },
  { id: 'reading-speed', label: 'Reading Speed & Comfort', category: 'score', short: 'WPM + strain' },
  { id: 'npc', label: 'Near Point of Convergence (NPC)', category: 'score', short: 'Alignment endurance (cm)' },
  { id: 'accommodation', label: 'Accommodation Amplitude (Push‑Up)', category: 'score', short: 'Focusing power (D)' },
  { id: 'glare', label: 'Glare/Photophobia Threshold', category: 'score', short: 'With vs without glare' },
  { id: 'amsler', label: 'Amsler Grid (macular distortion)', category: 'self', short: 'Mark distortions' },
  { id: 'astigmatism', label: 'Astigmatism Dial (clock test)', category: 'self', short: 'Darker/thicker spokes angle' },
  { id: 'duochrome', label: 'Red‑Green Duochrome Balance', category: 'self', short: 'Focus bias after acuity' },
  { id: 'eye-dominance', label: 'Eye Dominance (Miles/Cardhole style)', category: 'self', short: 'Dominant eye' },
  { id: 'visual-field', label: 'Visual Field Screener (suprathreshold)', category: 'self', short: 'Peripheral hit-map' },
  { id: 'pd-ruler', label: 'PD Ruler (manual, calibrated)', category: 'self', short: 'Interpupillary distance' },
  { id: 'stereopsis', label: 'Stereopsis (Depth, Red‑Cyan)', category: 'accessory', short: 'Depth threshold (arcsec)', needsCalibration: true, needsDistance: true },
  { id: 'worth-4-dot', label: 'Worth 4‑Dot (Red‑Green)', category: 'accessory', short: 'Fusion / suppression' },
  { id: 'osdi', label: 'OSDI (Dry Eye Symptoms)', category: 'self', short: '0–100 score (tracking)' },
  { id: 'ciss', label: 'CISS (Convergence Symptoms)', category: 'self', short: 'Raw score (tracking)' },
  { id: 'cvs', label: 'Computer Vision Syndrome / 20‑20‑20', category: 'self', short: 'Symptoms + habit' },
  { id: 'night-vision', label: 'Night/Low‑Light Difficulty', category: 'self', short: 'Checklist trend' },
]

export const BRAND = {
  ceil: '#6592E1',
  dark: '#001130',
}

// Shared tokens
export const TOKENS = {
  radius: { md: '12px', lg: '16px' },
  motion: { fast: '200ms', base: '240ms' },
}
