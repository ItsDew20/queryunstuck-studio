# QueryUnstuck growth playbook

How we grow organically on Instagram and YouTube. **Only official guidance from the platforms is
listed here, each point with its source.** Anything we learn from our own numbers goes in
`analytics/weekly-*.md` (analyst) and is promoted here only once it repeats across several weeks.
Last reviewed: 2026-10-21. Re-check the sources every quarter; platform guidance changes.

Read by: content-strategist (planning), scriptwriter and visual-director (format), copywriter
(captions, bio, audio name), analyst (what to measure).

## 1. What Instagram rewards in Reels
Source: [Instagram Ranking Explained](https://about.instagram.com/blog/announcements/instagram-ranking-explained)

- The most important predictions are whether a viewer will **reshare**, **watch to the end**,
  **like**, and **visit the audio page**.
  - Hook: state the payoff in the first ~1.5 s (already a scriptwriter rule).
  - Completion: keep reels tight. A lesson that ends early beats one that drags.
  - Shareability: one clear, useful idea per reel that someone would send to a friend before an interview.
  - Audio page: name the original audio (see §4).
- Reels are made **less visible** when they are *"low-resolution or watermarked … muted or contain
  borders … majority text, or … already posted on Instagram."* How we handle each:
  - **Low resolution:** render at 1080×1920.
  - **Muted:** never. Every reel has original sound effects and an original music bed.
  - **Borders:** no letterboxing; full-bleed 9:16.
  - **Already posted:** only original renders, never reposts.
  - **Watermark:** kept for the brand, but small and light (`brand.watermarkStyle`: about 55 % opacity, 26 px).
  - **Majority text:** see §3. This is our biggest risk, because we are an education channel.

## 2. Originality and recommendations
Sources: [Rewarding original creators](https://creators.instagram.com/blog/rewarding-original-creators-on-instagram),
[Tips for improving your reach](https://creators.instagram.com/blog/tips-for-improving-your-reach)

- Original content is prioritised; reposts and content with noticeable watermarks are less likely to
  be recommended. Everything we publish is original (visuals, code, audio).
- Reels must be **3 minutes or less** to be recommended (our reels are 15–45 s).
- **Search:** put relevant keywords in the caption, **bio**, and hashtags (copywriter keeps captions
  keyword-first; the bio should read like "SQL · Data Engineering · AI, visualized" + queryunstuck.in).
- **Collabs:** a Collab post is shared to both creators' followers and can be recommended. Use it
  when we work with another educator.
- **Account Status:** check it before each publishing week. The account must be eligible for recommendations.
- **Insights:** track *Accounts reached: followers vs non-followers* over time (analyst).

## 3. Education without "majority text"
Instagram shows reels that are *majority text* less, but our lessons need text. The rule we follow:
**the reel carries motion and the key words; the caption and a carousel carry the full text.**

- **Animated reels** (`reel-animated`) already fit: data moves on screen, and text is title + one line + code.
- **List reels** (`reel-list`):
  - **On screen:** keep text, but make it the smaller part of the frame. Each item gets its name
    plus at most ~4 words, with something moving or visual for it (a small diagram, an icon-like
    shape, or a mini animation from the component library). Fewer items per card, with faster reveals.
  - **In the caption:** the full list with a 1-line meaning per item (copywriter rule).
  - **In a carousel:** every list piece also gets a swipeable **carousel** of 4:5 slides. Carousels are
    meant to be read, so dense text is fine there. Post it as a separate post from the reel.
- Scriptwriters keep on-screen lines short. The fact-checked explanation can live in the caption and
  carousel, and it must match the on-screen wording.

## 4. Original audio naming
Sources: [Instagram Ranking Explained](https://about.instagram.com/blog/announcements/instagram-ranking-explained) (audio-page signal);
[IG User Media API reference](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media) (`audio_name`)

- Name the audio when posting, e.g. "QueryUnstuck – SQL order". Instagram lets you rename original
  audio only **once**, either while creating the reel or afterwards from the audio page.
- API-published reels can only use **original audio**: *"Music tagging is only available for
  original audio."* Trending tracks can only be added by hand in the Instagram app, for manual posts.

## 5. Trial reels (not yet available to us)
Sources: [About trial reels](https://help.instagram.com/1013292530224018),
[Trial reels announcement](https://creators.instagram.com/blog/instagram-trial-reels)

- What they are: trial reels are shown to **non-followers first**, and don't appear on our grid or
  Reels tab unless shared. Instagram can auto-share a trial to followers if it performs well in the
  first **72 hours**.
- **Eligibility:** a public professional account with **at least 200 followers**.
- 📌 **NOTE / reminder:** once @queryunstuck has **200+ followers**, use trial reels to test new
  formats, hooks and topics before showing them to followers. The analyst flags the week we cross
  200; the content-strategist then marks 1–2 slots per week as `trial` in the calendar.
- The Content Publishing API also supports trial reels (`trial_params.graduation_strategy` =
  `MANUAL` or `SS_PERFORMANCE`), so the publisher can post them in Phase 5+.

## 6. YouTube Shorts
Source: [YouTube Help: Shorts search & discovery tips](https://support.google.com/youtube/answer/11914225)

- Shorts are ranked on **performance and relevancy to each viewer**. YouTube's advice: *"Focus on
  what your audience likes. If you do that and people watch, recommendations will follow."*
- The same rules as §1 apply in practice: a strong hook, tight length, one idea, and keyword-first
  titles (copywriter).

## 7. Deliberately not here (no official source)
- Best posting times, ideal hashtag counts, "post N times a day". **Our own analytics decides these**
  after a few weeks of data.
- Engagement pods, follow/unfollow, buying views or followers. These go against platform rules and are never used.
