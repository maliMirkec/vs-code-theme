# Contributing

Thanks for helping improve Cita Theme.

## Setup

Requires Node.js 22 (see `.nvmrc`). Building the themes needs no dependencies. Only the icon and README image scripts need `npm install`.

```sh
git clone https://github.com/maliMirkec/vs-code-theme.git
cd vs-code-theme
npm run build
```

## How the theme is built

The files in `themes/` are generated, so don't edit them by hand. Edit these instead:

| File | Purpose |
|---|---|
| `src/palette.mjs` | Brand colors and the palette for each theme |
| `src/template.mjs` | Which palette color each part of VS Code uses: workbench, TextMate scopes, and semantic tokens |
| `src/build.mjs` | Writes `themes/*.json` and runs WCAG contrast checks |
| `src/icon.svg` | The silvestar.codes footer logo, used as the extension icon |
| `src/icon.mjs` | Renders `src/icon.svg` to `icon.png` |
| `src/screenshots.mjs` | Renders `images/*.png` for the README |

`npm run build` fails if any syntax color drops below 4.5:1 contrast against the editor background (3.5:1 for comments), or if UI text such as buttons, badges, and the status bar drops below 4.5:1.

## Previewing changes

1. Open the repository in VS Code and press <kbd>F5</kbd>. A test window opens with the `samples/` folder.
2. In that window, run **Preferences: Color Theme** and pick **Cita Dark** or **Cita Light**.
3. After editing, run `npm run build`, then run **Developer: Reload Window** in the test window.

To find the scope for a piece of text, run **Developer: Inspect Editor Tokens and Scopes**.

## README images

`images/cita-dark.png` and `images/cita-light.png` are rendered from the generated themes. Shiki tokenizes the samples with VS Code's grammars, and the result is drawn into a VS Code-style window. After changing colors, regenerate them:

```sh
npm install            # first time only, for shiki and @resvg/resvg-js
npm run build
npm run screenshots
```

The script uses the Menlo and Helvetica Neue fonts that come with macOS.

## Pull requests

- Commit the regenerated `themes/*.json` along with your source changes. CI fails if they're out of date.
- Check both themes, and include before and after screenshots for visual changes.
- Add a line under **Unreleased** in `CHANGELOG.md`.

## Releasing (maintainers)

1. Move the **Unreleased** entries in `CHANGELOG.md` under a new version heading.
2. Run `npm version <patch|minor|major>`. This bumps `package.json` and creates a `vX.Y.Z` tag.
3. Run `git push --follow-tags`. The Release workflow publishes to the VS Code Marketplace and Open VSX, and creates a GitHub release with the `.vsix` attached.

The workflow needs the `VSCE_PAT` and `OVSX_PAT` repository secrets.
