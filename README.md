# BitShypt Next.js

This repo has been converted into a Next.js application using the existing `index.html` content as the source.

## Run locally

1. Install Node.js and npm.
2. From the repo root, run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000`.

## Notes

- The current root `index.html` remains the source document.
- `pages/index.js` reads the HTML and renders it in a Next.js page.
- Inline scripts are extracted and executed using `next/script`.
