# QueryUnstuck components

Every component is a **pure function of its props + the current frame**. Colours and fonts come
only from `brand/brand.json` (via `src/brand.ts` / `src/fonts.ts`). Components never contain a
piece's content: everything comes from `scene.props` in `spec.json`.

## How a scene is laid out (`compositions/FromSpec.tsx`)

| Scene | Portrait (1080×1920) | Landscape (1920×1080) |
|---|---|---|
| Full-frame components: `TitleCard`, `ListCard`, `EndCard` | whole safe area (below the watermark, above `safeBottom`) | whole safe area |
| Any other component | `on_screen_text[0]` = title, `[1]` = one-line definition in **titleZone**; component in **animZone** | title in **titleZone**; component on the left of **contentZone** |
| …with `code_block` set | synced `CodePanel` in **codeZone** (right inset = `safeRight`) | `CodePanel` on the right (`codeSplit` of the width) |
| …without `code_block` | animZone extends down through codeZone | component uses the full contentZone |
| `component: "CodePanel"` | title + panel across anim+code zones; `code`/`lang` default to `code_blocks[code_block]` | same, full contentZone |
| No `component` | `on_screen_text` lines, large and centred | same |

The watermark (`brand.watermark`) sits top-right on every frame, inset by `safeRight`.

### Reserved prop: `codeHighlight`
On any non-CodePanel scene with a `code_block`, `props.codeHighlight` drives the side/bottom code
panel. It is stripped before the component's own props are passed.

```json
"codeHighlight": { "activeLines": [3] }
"codeHighlight": { "steps": [{ "lines": [4], "note": "GROUP BY" }, { "lines": [1], "note": "SELECT" }], "title": "query.sql" }
```

### Reserved prop: `sfx`
`"sfx": false` in a scene's props silences that scene (including its transition whoosh).

### Reserved prop: `transition`
`"transition": "whoosh"` or `"none"` overrides the automatic scene-change whoosh.

### Continuations
When two consecutive scenes show the **same table** (equal `columns` and `rows`), the second is
treated as a continuation: the table doesn't fade, there is no whoosh, and only the title crossfades.
Likewise a side/bottom code panel with the same `code_block` stays on screen, carrying over its last
highlighted lines until the next step. Give both scenes the same `title` so the table doesn't move.

### Sound effects
Every component exports a `<name>Cues(props, {fps, durationInFrames})` function beside it. It
calls the same timing helpers as the visuals (`listStarts`, `joinStarts`, `windowStarts`, …), so
sounds stay in sync by construction. `FromSpec` gathers all cues and adds a `whoosh` only on a real
change of view (not on continuations, not into the EndCard, whose `outro` marks it). When cues land
within 100 ms of each other only the most important plays (outro > chime > ding > buzz > thud >
sparkle > whoosh > glide > swoosh > slide > snap > note > blip > click > pop > type > tick); repeats of one sound closer than `brand.audio.dedupeMs` are merged.

**Auto slow-down:** if a scene's swooshes land closer than `brand.audio.minGapMs.swoosh` (450 ms),
that scene is stretched (up to `brand.audio.maxStretch`, 1.5×) so movements get room to breathe.
`duration_sec` is therefore a minimum; anything still too close after the cap is merged.

| Sound | Takes | Used for |
|---|---|---|
| `whoosh` | 2 | real change of view between scenes |
| `pop` | 3 | title words, kicker, nodes, info callouts appearing |
| `sparkle` | 1 | accent (`highlight`) words in a TitleCard, `tip` callouts |
| `tick` | 3 | table rows, comparison points, partition items appearing |
| `note` | 8 | **ordered steps**: code highlight steps, list items, timeline events climb a C-major pentatonic scale |
| `type` | 3 | CodePanel `typeIn` |
| `click` | 1 | generic RowHighlight step (no state / order change) |
| `blip` | 1 | JoinMatcher scanning a left row |
| `ding` | 1 | match: rows kept, join hit, `success` callouts |
| `thud` | 1 | no-match / rows dropped |
| `buzz` | 1 | `warning` callouts (gotcha) |
| `glide` | 1 | sort: same rows, new order |
| `swoosh` | 1 | things leaving or travelling: rows removed, partition moves, flow edges |
| `slide` | 1 | window frame sliding, Comparison cards sliding in |
| `snap` | 1 | everything settled (end of a partition shuffle) |
| `chime` | 1 | conclusion: Comparison verdict |
| `outro` | 1 | EndCard |

Multi-take sounds rotate through their takes so repeats never sound identical; `note` takes are
chosen by step index (`noteFor(i)`) so pitch always means progress.

Files in `public/sfx/` (`<sound>-<take>.wav` + `manifest.json` with durations) are **synthesised from scratch** by `npm run sfx:generate`
(`scripts/gen_sfx.py`, standard library only, fixed seed), so they are original audio. Master volume,
per-sound mix, dedupe window and on/off live in `brand.audio`. The video must still make sense
muted; sound only reinforces what's on screen.

### Timing convention
Components with sequential steps accept an optional `at` (seconds from scene start) on each step.
Without `at`, steps spread evenly between a ~0.5 s lead-in and a ~1.2 s hold at the end, so
scene length (`duration_sec`) controls the pace.

### Shared types
- `Cell` = `string | number | null` (`null` renders as italic `NULL`).
- `SemanticState` = `"active" | "match" | "noMatch" | "pending"` → `brand.semantic` colours.
- Row indices are **0-based**. Code line numbers are **1-based**.

---

## TitleCard (full frame)
| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | string | required | Words pop in one by one |
| `subtitle` | string | – | Muted line under the accent bar |
| `kicker` | string | – | Chip above the title, e.g. `"SQL"` |
| `highlight` | string[] | `[]` | Words of `title` drawn in accent (case-insensitive, punctuation ignored) |

## ListCard (full frame)
| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | string | – | |
| `items` | `(string \| {text, note?})[]` | required | `note` is muted text after the item |
| `numbered` | boolean | `true` | Accent number badges |
| `stagger` | boolean | `true` | `false` = whole list at once (reel-list cheat-sheet) |
| `activeIndex` | number | – | Item kept highlighted |

More than 8 items switches to a denser layout.

## CodePanel
| Prop | Type | Default | Notes |
|---|---|---|---|
| `code` | string | required* | *Taken from `code_blocks[code_block]` when it is the scene component |
| `lang` | `sql \| python \| dax \| yaml \| bash \| text` | `"sql"` | Built-in tokenizer, colours from `brand.syntax` |
| `title` | string | language name | Header label (e.g. a file name) |
| `activeLines` | number[] | – | Static highlighted lines (1-based) |
| `steps` | `{lines: number[], note?: string, at?: number}[]` | – | Timed highlights; `note` appears in the header. Non-active lines dim |
| `typeIn` | boolean | `false` | Reveal lines one by one |
| `showLineNumbers` | boolean | `true` | |
| `maxFontSize` | number | `46` | Text shrinks to fit the box; the panel hugs its content and is centred vertically |

## DataTable
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | string[] | required | |
| `rows` | `Cell[][]` | required | |
| `title` | string | – | Table name above, e.g. `"orders"` |
| `highlightCols` | `(string \| number)[]` | `[]` | Names or indices, drawn in accent |
| `highlightRows` | number[] | `[]` | Tinted with `semantic.active` |
| `revealRows` | boolean | `true` | Rows slide in one by one |

Tables auto-size to their box: up to 1.35× for small tables, shrinking when wide or tall.

## RowHighlight
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns`, `rows`, `title` | as DataTable | | |
| `steps` | `RowHighlightStep[]` | required | Applied cumulatively |

`RowHighlightStep`:
| Field | Type | Notes |
|---|---|---|
| `label` | string | Chip above the table for this step |
| `rows` | number[] | Rows whose state changes |
| `state` | SemanticState | Default `"active"`. `noMatch` rows are struck through and dimmed |
| `reset` | boolean | Clear all states first |
| `order` | number[] | New display order (original indices). Rows left out fade away and the table shrinks. Use it for ORDER BY / LIMIT / filtered results |
| `highlightCols` | `(string \| number)[]` | Columns emphasised from this step on |
| `at` | number | Seconds from scene start |

## JoinMatcher
| Prop | Type | Default | Notes |
|---|---|---|---|
| `left`, `right` | `{name, columns, rows, key}` | required | `key` = column name or index |
| `joinType` | `"inner" \| "left"` | `"inner"` | Unmatched left rows → `noMatch` (inner, ✕) or `pending` with `NULL` (left) |
| `label` | string | auto `INNER JOIN ON a.k = b.k` | Chip text |
| `showCount` | boolean | `true` | Running "result rows" counter |

Matches are **computed from the data** (equality on key, `NULL` never matches), one left row per
step, with connector lines to every matching right row.

## WindowFrame
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns`, `rows` | | required | Rows must already be in ORDER BY order (grouped by partition if used) |
| `valueColumn` | string \| number | required | Column the aggregate reads |
| `aggregate` | `sum \| avg \| count \| min \| max` | required | |
| `preceding` | number \| `"unbounded"` | required | ROWS-based frame start |
| `following` | number \| `"unbounded"` | `0` | `0` = CURRENT ROW |
| `partitionColumn` | string \| number | – | Frame never crosses partition boundaries |
| `outputColumn` | string | `<agg>_<col>` | Header of the computed column |
| `decimals` | number | `2` | For `avg` |
| `label` | string | – | Chip, e.g. `"ROWS 2 PRECEDING → CURRENT ROW"` |

Output values are **computed**, never typed in by hand, so they cannot drift from the frame shown.

## FlowGraph
| Prop | Type | Default | Notes |
|---|---|---|---|
| `nodes` | `{id, label, sublabel?, x, y, tone?}[]` | required | `x`,`y` = node centre as 0..1 of the box; `tone` = SemanticState |
| `edges` | `{from, to, label?, dots?, colorIndex?}[]` | required | `dots` travelling dots (default 2, `0` = none); `colorIndex` into `partitionPalette` (default accent) |
| `reveal` | boolean | `true` | Nodes pop in, then edges draw |
| `dotSpeed` | number | `1.6` | Seconds per edge traversal |

## PartitionGrid
| Prop | Type | Default | Notes |
|---|---|---|---|
| `partitions` | string[] | required | Column labels, coloured from `partitionPalette` |
| `items` | `{label, from, to?}[]` | required | Partition indices; `to` defaults to `from` |
| `beforeLabel` / `afterLabel` | string | – | Caption switches when items start moving |
| `moveAt` | number | ⅓ of the scene | Seconds when the move starts (staggered over ~35% of the scene) |
| `colorByDestination` | boolean | `true` | `false` = source colour until halfway |

## Comparison
| Prop | Type | Default | Notes |
|---|---|---|---|
| `left`, `right` | `{title, points: string[], tone?}` | required | `tone`: `match` / `noMatch` / `active` |
| `verdict` | string | – | Accent line shown last |

## Timeline
| Prop | Type | Default | Notes |
|---|---|---|---|
| `events` | `{label, detail?, marker?, at?}[]` | required | `marker` defaults to 1-based index |
| `cumulative` | boolean | `true` | Past events stay lit (green); current = accent |

## Callout
| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | string | required | |
| `tone` | `tip \| warning \| info \| success` | `"tip"` | accent / noMatch / textMuted / match |
| `label` | string | per tone | e.g. "Interview tip", "Gotcha" |
| `detail` | string | – | Muted second line |

## EndCard (full frame)
| Prop | Type | Default | Notes |
|---|---|---|---|
| `headline` | string | – | Takeaway line |
| `cta` | string | `"Follow for more"` | Chip |
| `next` | string | – | "Next: …" teaser |

Always shows `brand.handle` and `brand.tagline`.

---

## Adding a component
1. Create `src/components/<Name>.tsx`. Read time from `useScene()` and size from the scene box; use tokens only.
2. Register it in `src/components/index.ts` and add the name to the `component` enum in
   `schemas/content-spec.schema.json` and `src/types.ts`.
3. Export a `<name>Cues` function that reuses the component's timing helpers, and add it to `cueRegistry`.
4. Document its props here and add a scene to `src/demos/demo-components.json`.
5. `npm run typecheck`, then render a still.
