# CLEAR

Resident hub: contacts, services and documents, one tap away.

- `index.html` is the whole site.
- `vault.json` is the content, encrypted with the resident passcode. Nothing readable is stored in this repository.
- `assets/home.jpg` is the picture fixed behind the home page. Each category page uses `assets/<category id>.jpg` (`contacts.jpg`, `services.jpg`, `documents.jpg`). A missing picture falls back to the home one, then to a stand-in. Pictures are not encrypted.

## Changing the content

Content lives in a `content.json` file that is never committed.

    node tools/vault.mjs open "passcode" > content.json    # get the current content
    node tools/vault.mjs seal content.json "passcode"      # write a new vault.json

Sealing with a different passcode changes the passcode for everyone.

Each item can have `title`, `note`, `icon`, `phone`, `whatsapp`, `url`, `linkLabel` and `urgent`. Each section has `id`, `kind`, `icon`, `title`, `blurb` and `items`.
