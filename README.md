# The world on 23 November 2026 in one image

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/SakakiFu/world-news-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/SakakiFu/world-news-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

A single 1024×1024 newspaper front page summing up 23 November 2026:
Nvidia reinstates Jensen Huang as CEO (lead), Ukraine sinks a Russian
warship off Libya, 24 dead in an Indonesia factory fire, and the EU seals
a landmark trade deal with Indonesia — plus a footer of the day's other
headlines.

## Regenerate

Requires Node 22+ and Python 3 with Pillow.

```sh
node main.ts
```

`main.ts` builds a layout spec from the story copy in the file, hands it
to `../work/render.py` (Pillow), and verifies the output. The render is
fully deterministic: no clock, no randomness, no network — running it
twice produces byte-identical `entry.png`.

## Files

- `main.ts` — entrypoint; story copy, layout spec, renderer call, verification
- `entry.png` — the generated 1024×1024 front page
- `../work/render.py` — Pillow renderer (draws the page from the spec)
- `../work/media-generation-*.png` — the four text-free illustrations
