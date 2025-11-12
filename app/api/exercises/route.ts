// app/api/exercises/route.ts
// Static export–safe route: one static JSON payload, no per-request logic.

export const dynamic = "force-static"; // required for output: "export"

type Mode = "timer" | "interval" | "reps" | "info";

type Exercise = {
  id: string;
  title: string;
  category:
    | "Relaxation"
    | "Focus"
    | "Mobility"
    | "Habits"
    | "Convergence"
    | "Therapy";
  level: "Beginner" | "Intermediate" | "Advanced";
  duration?: number; // minutes (optional)
  durationLabel?: string; // e.g., '20s'
  description: string;
  steps: string[];
  benefits: string[];
  mode: Mode;
  timerSeconds?: number;
  optionsSeconds?: number[];
  intervals?: { label: string; seconds: number }[];
  cycles?: number;
  reps?: number;
};

const exercises: Exercise[] = [
  {
    id: "palming",
    title: "Palming",
    category: "Relaxation",
    level: "Beginner",
    duration: 5,
    description:
      "Warm your palms and gently cover closed eyes to relax and reduce strain.",
    steps: [
      "Rub your palms together briskly to generate warmth.",
      "Close your eyes and cup warm palms over the eyelids without pressing.",
      "Ensure no light seeps through.",
      "Relax shoulders, breathe slowly, and hold for 5–10 minutes.",
    ],
    benefits: [
      "Relaxes eye muscles after prolonged screen time",
      "Reduces stress and visual fatigue",
    ],
    mode: "timer",
    timerSeconds: 300,
    optionsSeconds: [300, 600],
  },
  {
    id: "blinking",
    title: "Blinking",
    category: "Habits",
    level: "Beginner",
    duration: 2,
    description:
      "Rapid blinking followed by rest to refresh and lubricate the eyes.",
    steps: [
      "Blink rapidly for 10–15 seconds.",
      "Close eyes and rest for 20 seconds.",
      "Repeat for 4–5 cycles.",
    ],
    benefits: [
      "Prevents dryness during computer work",
      "Keeps tear film healthy and clear",
    ],
    mode: "interval",
    intervals: [
      { label: "Blink rapidly", seconds: 15 },
      { label: "Rest", seconds: 20 },
    ],
    cycles: 4,
  },
  {
    id: "pencil-pushups",
    title: "Pencil Push-ups",
    category: "Focus",
    level: "Beginner",
    duration: 5,
    description:
      "Move a pencil from arm’s length toward your nose while keeping it in focus, then back out.",
    steps: [
      "Hold a pencil at arm’s length, fix your gaze on its tip.",
      "Slowly bring it toward your nose until ~6 inches away, holding focus.",
      "Slowly move it back to arm’s length.",
      "Option: alternate focus between near and far objects.",
    ],
    benefits: [
      "Improves focusing ability (accommodation)",
      "Builds flexibility of eye muscles",
    ],
    mode: "reps",
    reps: 12,
  },
  {
    id: "figure-eight",
    title: "Figure Eight",
    category: "Mobility",
    level: "Intermediate",
    duration: 2,
    description:
      "Trace a sideways figure eight with your eyes—smoothly and slowly.",
    steps: [
      "Imagine a large figure eight on its side ~10 feet ahead.",
      "Trace the pattern with your eyes slowly for 1 minute in one direction.",
      "Reverse direction and trace for another minute.",
    ],
    benefits: [
      "Enhances eye coordination and flexibility",
      "Promotes smooth pursuit movements",
    ],
    mode: "timer",
    timerSeconds: 120,
  },
  {
    id: "20-20-20",
    title: "20-20-20 Rule",
    category: "Habits",
    level: "Beginner",
    durationLabel: "20s",
    description:
      "Every 20 minutes, look at something 20 feet away for 20 seconds.",
    steps: [
      "Pause work and pick a distant target (~20 feet away).",
      "Relax your gaze and breathe naturally.",
      "Hold for at least 20 seconds.",
    ],
    benefits: [
      "Reduces digital eye strain",
      "Relaxes focusing muscles (accommodation)",
    ],
    mode: "timer",
    timerSeconds: 20,
  },
  {
    id: "brock-string",
    title: "Brock String",
    category: "Therapy",
    level: "Intermediate",
    duration: 5,
    description:
      "Use a string with beads to train convergence and depth perception.",
    steps: [
      "Hold one end of the string to your nose, extend the other end outward.",
      "Focus on the nearest bead; the others should appear doubled.",
      "Shift focus to the next bead, then the far bead, noticing the “X” crossing.",
      "Repeat the sequence slowly.",
    ],
    benefits: [
      "Improves eye teaming and convergence",
      "Enhances depth perception",
    ],
    mode: "info",
  },
  {
    id: "eye-movement-training",
    title: "Eye Movement Training",
    category: "Mobility",
    level: "Beginner",
    duration: 3,
    description:
      "Eye rolls (CW/CCW) and directional movements to improve range of motion.",
    steps: [
      "Eye Rolls: roll eyes clockwise slowly, then counter-clockwise.",
      "Directional: look up/down, left/right, then diagonals—without moving your head.",
    ],
    benefits: [
      "Increases flexibility and reduces stiffness",
      "Supports comfortable, broad eye movements",
    ],
    mode: "interval",
    intervals: [
      { label: "Roll clockwise", seconds: 30 },
      { label: "Roll counter-clockwise", seconds: 30 },
      { label: "Up & Down", seconds: 20 },
      { label: "Left & Right", seconds: 20 },
      { label: "Diagonals", seconds: 20 },
    ],
    cycles: 1,
  },
  {
    id: "jump-convergence",
    title: "Jump Convergence",
    category: "Convergence",
    level: "Intermediate",
    duration: 3,
    description: "Rapidly shift focus between a near and a far target.",
    steps: [
      "Hold a pen at arm’s length and focus on it.",
      "Quickly shift gaze to a far object across the room or outside.",
      "Alternate focus near ↔ far, holding each target clearly.",
    ],
    benefits: [
      "Trains convergence and divergence",
      "Supports comfortable reading and depth perception",
    ],
    mode: "reps",
    reps: 20,
  },
  {
    id: "near-point-play",
    title: "Near-Point Play",
    category: "Focus",
    level: "Beginner",
    duration: 2,
    description:
      "Do a light, near task (word puzzle, coloring, connect-the-dots) preferably without reading glasses.",
    steps: [
      "Pick a simple word puzzle, coloring page, or connect-the-dots with large print.",
      "If possible, do it without reading glasses.",
      "Keep it playful and relaxed—no need for speed.",
    ],
    benefits: [
      "Gentle near-focus engagement for presbyopia support",
      "Encourages relaxed, sustained accommodation without strain",
    ],
    mode: "timer",
    timerSeconds: 120,
  },
  {
    id: "convergence-practice",
    title: "Convergence Practice (Two Dots)",
    category: "Convergence",
    level: "Beginner",
    duration: 2,
    description:
      "Use two dots (on a presbyopia chart or a page) and gently cross your eyes until you see three.",
    steps: [
      "Use a presbyopia chart with two dots (or draw two dots on a page).",
      "Gently cross your eyes until the two dots appear as three.",
      "Hold briefly, then relax your gaze.",
      "Repeat a few times, maintaining comfort.",
    ],
    benefits: [
      "Trains near convergence and eye teaming",
      "Can improve comfort for reading and close work",
    ],
    mode: "timer",
    timerSeconds: 120,
  },
  {
    id: "black-dot-memory",
    title: "Black Dot Memory",
    category: "Relaxation",
    level: "Beginner",
    duration: 1,
    description:
      "Visualization drill: look at a small black dot, then imagine it vividly when eyes are closed.",
    steps: [
      "Draw a small black dot on white paper and look at it gently.",
      "Close your eyes and imagine the dot as very black on a white background.",
      "Let the dot “move” slightly in your mind—avoid any strain.",
    ],
    benefits: [
      "Promotes relaxed central fixation and mental imagery",
      "Helps reduce visual tension",
    ],
    mode: "timer",
    timerSeconds: 60,
  },
  {
    id: "zooming",
    title: "Zooming",
    category: "Focus",
    level: "Beginner",
    duration: 2,
    description:
      "Alternate focus between your thumb and a far object to exercise accommodation flexibility.",
    steps: [
      "Hold your thumb ~15 cm (6 in) from your nose and focus on it.",
      "Slowly extend your arm, keeping focus on the thumb.",
      "Shift focus to a distant object for 2–3 seconds, then return to the thumb.",
      "Repeat for the duration.",
    ],
    benefits: [
      "Strengthens the focusing system (accommodation)",
      "Improves speed and comfort when switching focus near ↔ far",
    ],
    mode: "timer",
    timerSeconds: 120,
  },
  {
    id: "diagonal-shifts",
    title: "Diagonal Shifts",
    category: "Mobility",
    level: "Beginner",
    duration: 1,
    description:
      "Move your gaze along diagonals without moving your head to broaden comfortable range of motion.",
    steps: [
      "Without moving your head, move your gaze: up-left → down-right → up-right → down-left.",
      "Hold each for ~1 second, then return to center.",
      "Repeat 2–3 cycles with smooth, comfortable movements.",
    ],
    benefits: [
      "Expands ocular movement range on diagonals",
      "Can reduce stiffness and improve tracking",
    ],
    mode: "timer",
    timerSeconds: 60,
  },
];

export async function GET() {
  // With static export there’s no per-request query handling.
  // Filter on the client after fetching this full list.
  return Response.json(exercises);
}

export { exercises };
