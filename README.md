# Accessibility Widget

A standalone, dependency-free accessibility widget for websites. It is implemented in vanilla JavaScript and adds a floating, keyboard-accessible control panel without requiring a build step.

## Features

- Accessibility profiles for vision, dyslexia, ADHD, motor, cognitive and epilepsy-related needs
- Display adjustments including contrast modes, text size, line height, letter and word spacing, alignment, fonts and color themes
- Reading aids such as reading progress, reading time, reading ruler, focus mask, magnifier, paragraph and heading highlighting
- Text-to-speech with adjustable speed and optional sentence highlighting
- Distraction reduction, Bionic Reading, collapsible long paragraphs and a page outline
- Focus timer with configurable focus and break durations
- Preferences persisted in `localStorage`
- Shadow DOM isolation for the widget UI and support for `prefers-reduced-motion`

## Usage

Include the script on the page you want to enhance:

```html
<script
  src="https://cdn.jsdelivr.net/gh/Projekt-Ansichtssache/accessibility-widget@main/accessibility-widget.js"
  defer
></script>
```

The widget initializes automatically after the document is ready. No configuration or additional dependencies are required. Some features depend on browser support, including the Web Speech API, Web Audio API and CSS Custom Highlight API.

For production deployments, pin the CDN URL to a reviewed commit or release instead of `main`.

## Testserver

Using the local test server, you can test the widget on any website:

```bash
npm run test-server
```

Then open `http://localhost:4173` in your browser and enter a domain. The server loads
the target page through a local proxy and injects the local `accessibility-widget.js` file.
Subsequent paths such as Next.js assets, CSS, fonts, and client requests are forwarded
through the same local proxy session.
The bottom-right test-server menu can be used to enter a new address, reset the target,
or temporarily hide the accessibility widget.
This is intended for development and manual testing, not for production use.
Some websites may not function fully if they rely heavily on
cookies, a specific origin, or strict security policies.

## Technology

- Vanilla JavaScript
- Shadow DOM
- Browser APIs: `localStorage`, Web Speech, Web Audio, MutationObserver and CSS Custom Highlight

## License

No license file is currently included in this repository.

Developed as a student project by students of Gymnasium Oesede.
