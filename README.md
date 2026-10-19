# خاجی پخش — design preview

A redesign preview for **خاجی پخش**, a wholesale electrical-equipment distributor in
Tehran's Lalehzar market: 8 product groups, 13 Iranian brands, a searchable wholesale
price list and an inquiry list the customer sends to sales by SMS in one tap.

**Live:** https://barry-amirahmadi.github.io/khaji-pakhsh/

## Why it is built this way

- **GitHub Pages, not Cloudflare Pages** — Cloudflare's `pages` domain is blocked in Iran,
  where every customer of this shop is.
- **No framework, no external requests** — 24 static pages from one Node script, the
  Vazirmatn font self-hosted (OFL, `static/fonts/`), no Google Fonts, no map embeds.
  The home page is about 225 KB in 5 requests.
- **The distribution board** — the hero shows the eight product groups as breakers on
  two DIN rails; each one opens its group page.
- **Inquiry list** — add items with quantities from any price table, then send the list by
  SMS, copy it for WhatsApp or Telegram, or call. Kept in the visitor's browser only.

## Preview state

`PREVIEW = true` in `src/data.mjs` is the single switch for the preview: it adds
`noindex`, a one-line preview banner and "sample price" wording. Turn it off only once
the client has confirmed:

- real prices, or a decision to show «استعلام» only
- which messengers the sales number uses — WhatsApp, Telegram, Bale or Eitaa — so they can be added as buttons
- the map pin, opening hours and the «۱۰ سال سابقه» claim
- the brand list, and whether the shop wants its own logo instead of the text mark

## Commands

```bash
node build.mjs                      # build to dist/ for the site root
BASE_PATH=/khaji-pakhsh node build.mjs && node src/serve.mjs   # mirror GitHub Pages on :4417
BASE_PATH=/khaji-pakhsh node src/check.mjs                     # link, title and <h1> gate
node tools/render-images.mjs        # re-render og.png and apple-touch-icon.png
```

On Git Bash for Windows, prefix commands that set `BASE_PATH` with `MSYS_NO_PATHCONV=1`,
or the path is rewritten to `C:/Program Files/Git/khaji-pakhsh`.

Pushing to `main` builds, checks and deploys through `.github/workflows/deploy.yml`.
