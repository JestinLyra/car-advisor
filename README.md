# My Yaris Care

An iPhone-first maintenance tracker for a 2011 Toyota Yaris hatchback. It stores checklist progress, odometer, refuel payments, six-month fuel-cost history, swipe-editable reminders and title-based car notes locally on the device. Its backup button exports the complete app data to Files on iPhone.

## Publish free with GitHub Pages

1. Create a new public GitHub repository.
2. Upload `index.html`, `styles.css`, `fuel.css`, `app.js`, `sw.js`, and `manifest.webmanifest` to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Open the published link in Safari on iPhone, tap **Share → Add to Home Screen**.

## Publishing an update

Upload every changed file. The app uses a versioned service worker and versioned asset URLs to replace old cached builds. For each future release, change every occurrence of the release value (currently `20260831-29`) in `index.html` and `sw.js`, including the cache name.

If an iPhone still shows the old build immediately after this first cache-busting release, open the GitHub Pages URL once in Safari with `?update=20260831-29` added to the end, refresh, then reopen the Home Screen app.
