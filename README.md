# CLEAR

Resident hub: contacts, services and documents, one tap away.

- `index.html` is the whole site.
- `vault.json` is the content, encrypted with the resident passcode. Nothing readable is stored in this repository.
- `assets/background.jpg` is the picture that stays fixed behind the page. Until it exists the site shows a stand-in.

## Changing the content

Content lives in a `content.json` file that is never committed.

    node tools/vault.mjs open "passcode" > content.json    # get the current content
    node tools/vault.mjs seal content.json "passcode"      # write a new vault.json

Sealing with a different passcode changes the passcode for everyone.

Each item can have `title`, `note`, `phone`, `whatsapp`, `url`, `linkLabel` and `urgent`.
