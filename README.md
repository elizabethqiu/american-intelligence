# american-intelligence.ai

A static site hosted on GitHub Pages (see `CNAME`). It has no build step.

```
index.html          landing page: hero, contents, subscribe
introduction.html   the public intro essay (served at /introduction)
_template.html      starting point for new parts (not published)
drafts/             unreleased parts: gitignored, local only
drafts/lineup.json  real titles of unpublished parts (the site shows "Upcoming title")
tools/part.py       creates and publishes parts
tools/sync_intro.py copies the intro from introduction.html onto the home page
tools/pdf.py        builds american-intelligence.pdf (runs on publish)
american-intelligence.pdf   the whole series, linked from "Download PDF"
assets/style.css    all styles; colors and the flag's opacity are set at the top
assets/site.js      subscribe form + reading progress bar
assets/flag.svg     monochrome flag used as the faint background
assets/favicon.svg  favicon
subscribe/apps-script.gs   signup endpoint (Google Sheet)
CNAME               custom domain for GitHub Pages
```

## Preview locally

```sh
npx serve   # then open http://localhost:3000
```

`serve` maps `/introduction` to `introduction.html`, the same way GitHub Pages does, so links work as they will live. It needs Node.js. Without Node, run `python3 -m http.server 8000`, but Python's server doesn't do that mapping, so links like `/introduction` will 404. Open http://localhost:8000/introduction.html directly instead.

For the tools, design system, and reasoning behind the site, see [BUILDING.md](BUILDING.md).

## Writing and publishing parts

This repo is public, and GitHub Pages serves every file pushed to `main`. The lock icons on the home page are only visual; they don't protect anything. **Unreleased essays must stay in `drafts/`**, which is gitignored, so it is never committed or published.

```sh
python3 tools/part.py new 2 "Title of Part Two"   # creates drafts/part-2.html from _template.html
python3 -m http.server 8000                        # preview at localhost:8000/drafts/part-2.html
python3 tools/part.py publish 2                    # moves it to part-2.html and unlocks it on the home page
git diff                                           # review, then commit + push to go live
```

`publish` also stamps today's date, computes the reading time, updates the "N of 6 published" count, and points the previous part's "Next" card at the new part.

`_template.html` is the layout every new part starts from. Edit it to change future parts. GitHub Pages skips files that start with `_`, so it is never served.

Back up `drafts/` yourself (iCloud, Dropbox, or a separate **private** repo), because git won't.

## Subscribe → Google Sheet (about 5 minutes)

1. Create a Google Sheet, for example "American Intelligence subscribers".
2. Open **Extensions → Apps Script**, replace the code with the contents of `subscribe/apps-script.gs`, and save.
3. Click **Deploy → New deployment → Web app**. Set *Execute as*: **Me**, and *Who has access*: **Anyone**. Then deploy and authorize.
4. Copy the web app URL (ending in `/exec`) into `SUBSCRIBE_ENDPOINT` at the top of `assets/site.js`.
5. Push. Signups now appear in the `Subscribers` tab with a timestamp, email, source page, and referrer. Duplicate emails are skipped.

When you edit the script, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

To email subscribers, export the sheet as CSV and import it into Buttondown, Substack, Mailchimp, or similar.

**Alternative:** if you'd rather the newsletter tool hold the list from the start, point `SUBSCRIBE_ENDPOINT` at its form endpoint. For Buttondown, that's `https://buttondown.com/api/emails/embed-subscribe/<username>`; it accepts the same `email` field.
