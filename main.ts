// main.ts — entrypoint for the 23 November 2026 world-news image.
// Regenerates entry.png (1024 x 1024, deterministic PNG) from the four
// text-free illustrations in ../work and the story copy defined below.
// Run from this directory:  node main.ts
// Requires: python3 with Pillow (PIL). No network, no clock, no random
// input anywhere, so every run writes byte-identical output.
// Determinism check: run `node main.ts` twice and compare the sha256
// printed on each run; the two hashes must match exactly.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY_DIR = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = join(ENTRY_DIR, "..", "work");
const OUT_PATH = join(ENTRY_DIR, "entry.png");
const SPEC_PATH = join(WORK_DIR, "spec.json");
const RENDER_PY = join(WORK_DIR, "render.py");

// --- palette and type -------------------------------------------------
const PAPER = "#f7f3ea";
const INK = "#1a1a1a";
const MUTED = "#555555";
const RED = "#a31e22";

const FONT_SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf";
const FONT_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf";
const FONT_SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

// --- the day's stories (all verified as 23 November 2026) -------------
const MASTHEAD = "THE WORLD TODAY";
const DATE_LINE = "MONDAY, 23 NOVEMBER 2026";

const LEAD = {
  kicker: "TECHNOLOGY  •  MARKETS",
  headline: "NVIDIA BRINGS BACK HUANG",
  deck: "Board reinstates ousted chief 11 days after his resignation; shares soar 31%, adding nearly $1 trillion in a day",
  body: "Nvidia's board reinstated Jensen Huang as chief executive, president and board member on Monday, effective immediately, just 11 days after he resigned amid revelations of extramarital affairs, including one with an alleged Chinese spy. The board said it was satisfied Huang posed no national security risk, after U.S. officials briefed directors and President Donald Trump spoke with the board. Shares surged 31%, adding about $950 billion in value, as the Nasdaq jumped 6.5% and the S&P 500 rose 4.7%.",
  image: join(WORK_DIR, "media-generation-lead-nvidia-0-4f41d83f-a109-454f-a858-3696c06bdc03.png"),
};

const PANELS = [
  {
    headline: "UKRAINE SINKS RUSSIAN WARSHIP",
    deck: "Zelenskyy says seven sea drones sank the vessel in a Libyan port; a second Russian cargo ship was hit by a drone in the Baltic Sea.",
    image: join(WORK_DIR, "media-generation-panel-warship-0-ad93cd1e-06d3-424e-b1ae-d46ee8f2de8b.png"),
  },
  {
    headline: "24 DEAD IN INDONESIA FACTORY FIRE",
    deck: "Indonesia confirms the toll from a blaze that gutted a candy plant in Banten; about 30 workers are still missing as rescuers search the wreckage.",
    image: join(WORK_DIR, "media-generation-panel-fire-0-d17e6404-86a4-4aaf-84c5-a8fcf68fc99c.png"),
  },
  {
    headline: "EU SEALS LANDMARK INDONESIA TRADE DEAL",
    deck: "The pact scraps most tariffs between the two sides, promising billions in new trade and investment.",
    image: join(WORK_DIR, "media-generation-panel-trade-0-282027ff-cb56-4d57-91bd-cad46a30126d.png"),
  },
];

const FOOTER = [
  {
    label: "DEMOCRATS WIN RECORD MAJORITY",
    text: "Democrats win their largest U.S. House majority since 1992 after flipping a North Carolina seat.",
  },
  {
    label: "HOUTHIS CLAIM REFINERY STRIKE",
    text: "Yemen's Houthis say they attacked a major oil refinery on Saudi Arabia's Red Sea coast.",
  },
  {
    label: "SHENZHOU-24 CREW UNVEILED",
    text: "China names the crew of its next crewed mission, including the first foreign astronaut to fly with China.",
  },
];

// --- layout spec handed to the Pillow renderer ------------------------
function buildSpec() {
  return {
    page: { width: 1024, height: 1024, paper: PAPER, ink: INK, muted: MUTED, red: RED },
    fonts: {
      serifBold: FONT_SERIF_BOLD,
      serif: FONT_SERIF,
      sans: FONT_SANS,
      sansBold: FONT_SANS_BOLD,
    },
    masthead: { title: MASTHEAD, date: DATE_LINE },
    lead: LEAD,
    panels: PANELS,
    footer: FOOTER,
    out: OUT_PATH,
  };
}

// --- run the renderer ---------------------------------------------------
function render(specPath) {
  const res = spawnSync("python3", [RENDER_PY, specPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`render.py failed (exit ${res.status}):\n${res.stderr}`);
  }
  if (res.stdout.trim()) process.stdout.write(res.stdout);
}

// --- verify the output: PNG size, dimensions, sha256 -------------------
function verifyPng(path) {
  const buf = readFileSync(path);
  if (buf.length > 1048576) {
    throw new Error(`entry.png is ${buf.length} bytes, over the 1 MiB limit`);
  }
  // PNG signature + IHDR: width at bytes 16-19, height at 20-23 (big-endian).
  if (buf.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("entry.png is not a PNG file");
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (width !== 1024 || height !== 1024) {
    throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
  }
  const sha256 = createHash("sha256").update(buf).digest("hex");
  return { bytes: buf.length, width, height, sha256 };
}

function main() {
  for (const p of [RENDER_PY, LEAD.image, ...PANELS.map((x) => x.image)]) {
    if (!existsSync(p)) throw new Error(`missing input file: ${p}`);
  }
  const spec = buildSpec();
  writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2), "utf8");
  render(SPEC_PATH);
  const info = verifyPng(OUT_PATH);
  console.log(`wrote ${OUT_PATH}`);
  console.log(`size: ${info.width}x${info.height}, ${info.bytes} bytes`);
  console.log(`sha256: ${info.sha256}`);
}

main();
