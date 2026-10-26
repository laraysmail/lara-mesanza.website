# laramesanza.com — Beginner's guide (for Smaïl)

You don't need to know how to code. Almost everything is "change one line in a text file, then publish".

## 1. The big picture

The website is a folder of files on this computer. Several free services do different jobs around it:

| Service | What it does | Why you need it |
|---|---|---|
| **This folder** (`new website`) | The website's files | Where you make changes |
| **Claude Code** (this app) | The assistant that edits the files for you | Just describe what you want in plain words |
| **GitHub** (`laraysmail/lara-mesanza.website`) | Online backup/storage of the files | Netlify reads the site from here |
| **GitHub Desktop** | Button-based app to send changes to GitHub | "Commit" + "Push" |
| **Netlify** | Publishes the site to the internet | Turns the files into laramesanza.com |
| **Hostinger** | Owns the domain name laramesanza.com | Renew yearly (until 2027-03-21, auto-renew on). **Never touch the DNS records.** |
| **Payhip** | Sells the digital products | Sales, files, prices |
| **Mailchimp** | Email list (signup box on the site) | Newsletter |
| **Google Analytics / Tag Manager** | Visitor and click stats | See which affiliate links get clicked |
| **Notion** | Lara's master lists (products, affiliations, to-dos) | The site does NOT read Notion live — changes are copied into the files by hand/Claude |

Logins: ask Lara. **Never paste passwords or tokens into Claude or into chat.**

## 2. How publishing works (the 4 steps)

1. **Ask Claude** to make the change (e.g. "change the Iati code to XYZ"). Check it on the preview.
2. Open **GitHub Desktop**. You'll see the changed files. Type a short description (e.g. "Update Revolut link") → **Commit to main**.
3. Click **Push origin**. The changes are now on GitHub.
4. **Netlify** notices and publishes automatically (about 1–2 min). Check at laramesanza.com (hard refresh: Cmd+Shift+R).

If it doesn't update: Netlify → project `gentle-chaja-6bfcc7` → **Deploys** → **Trigger deploy** → **Deploy site**.

### Netlify credits (important)
Netlify's free plan has **300 credits**, and **each publish costs 15** → roughly 20 publishes/month. When credits run out, publishing pauses until they reset. So **batch your changes**: make several edits, then push once. Don't push after every tiny edit. If a message asks you to pay, check the sender address is really Netlify before clicking anything.

## 3. Common jobs

All content lives in `src/data/`:

- **Discount codes / affiliate links** → `discounts.json` (one block per company: name, code, url, logo). The page order = order in the file (most earnings first).
- **Shop products** → `products.json` (own digital products + affiliate products).
- **Texts like stats, current location** → `site.json`.
- **Asesoramiento service** → `services.json`.

Easiest way: tell Claude, e.g. *"Add a new discount for X with code Y and link Z"* or *"Change the price of the plantilla to 7,99 €"*. Prices of own products must also be changed in **Payhip**.

### Revolut referral link — monthly job
Revolut changes the referral link every month. Currently there is **no Revolut entry on the website**. To add/refresh it: get the current link from the Revolut app (Invite friends) and tell Claude: *"Add/update the Revolut link: <link>"*. Then update the **Affiliations → Revolut** row in Notion and publish (section 2). Set a monthly reminder in Notion.

### Checklist (paused)
The free travel checklist is hidden until Lara's video is live. When she says so: tell Claude **"put the checklist back"** and un-pause it in Payhip.

### Add a new affiliate product
Send Claude the product name, link, category (camper / piso / viaje) and photo, plus the code if there is one.

## 4. Seeing the stats

- **Link clicks**: Google Analytics → Reports → Engagement → Events → `click`.
- **Sales**: Payhip dashboard.
- **Email signups**: Mailchimp → Audience.
- **Contact form messages**: Netlify → Forms.

## 5. Do's and don'ts

- ✅ Batch changes, then push once.
- ✅ Ask Claude when unsure — describe what you want in normal words.
- ❌ Don't change Hostinger DNS records.
- ❌ Don't add a second Google Analytics tag inside Tag Manager (it's already on the site — it would double-count).
- ❌ Never share passwords or tokens (GitHub tokens included).
- ❌ Don't delete the `src/data` files or the `public/_redirects` file.

## 6. Open to-dos

- Revolut referral link (see above)
- INIU (Impact) affiliate link · Deryan (Amazon) link · AllPowers and Ecoworthy product models
- Unsent email draft to Kangura (in Gmail drafts)
- Optional: Mailchimp welcome email
