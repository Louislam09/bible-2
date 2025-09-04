# Expo DOM Components — quick reference (Markdown)

Below is a compact, copy-pasteable Markdown guide that collects **everything important** from the Expo docs on DOM components (`'use dom'`) so your cursor (and you) know what to expect before you start building.

> Source: Expo docs — _Using React DOM in Expo native apps_. ([Expo Documentation][1])

---

## What is a DOM component (`'use dom'`)?

`'use dom'` lets you write React **web (DOM)** components (e.g. `<div>`, `<img>`) and render them inside an Expo native app by wrapping them in a WebView. It enables incremental migration of web code into a universal app on a per-component basis. ([Expo Documentation][1])

---

## When to use

- You need web-only UI or third-party web libraries quickly inside a native app.
- You want to reuse web components without a full native rewrite.
- You need web features (CSS, DOM APIs) that are hard/slow to reimplement natively. ([Expo Documentation][1])

---

## Prerequisites & install

1. Use Expo CLI (if you created the app with `npx create-expo-app`, you're good).
2. Install Expo modules and runtime if needed:

```bash
npx install-expo-modules@latest
npx expo install @expo/metro-runtime react-dom react-native-web
npx expo install react-native-webview
```

(If using Expo Router + Expo Web, some steps may be unnecessary.) ([Expo Documentation][1])

---

## Minimal usage example

**Web (DOM) component file — `my-component.tsx`**

```tsx
"use dom";

export default function DOMComponent({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello, {name}</h1>
    </div>
  );
}
```

**Native file — `App.tsx`**

```tsx
import DOMComponent from "./my-component.tsx";

export default function App() {
  return <DOMComponent name="Europa" />;
}
```

DOM files are bundled and re-export a wrapped `react-native-webview` under the hood. ([Expo Documentation][1])

---

## Props & data marshalling

- Only **serializable** props are passed: `string`, `number`, `boolean`, `null`, `undefined`, `Array`, `Object`.
- Props are sent asynchronously over a bridge and applied as props to the DOM component’s React root — full rerender semantics apply.
- **Functions allowed only as top-level native action props** (they become asynchronous actions). You cannot pass nested function props. ([Expo Documentation][1])

---

## Native actions (calling native from DOM)

- Pass an async function as a top-level prop on the native side; the DOM component calls it and receives a Promise.
- This is the recommended way to request native capabilities (device info, platform APIs) from DOM components. ([Expo Documentation][1])

**Example**

```tsx
// Native
<DomComponent getDeviceName={() => DeviceInfo.getDeviceName()} />

// DOM (web)
<p onClick={() => getDeviceName().then(name => console.log(name))}>Click me</p>
```

---

## Refs & `useDOMImperativeHandle`

- Experimental: you can expose imperative methods from a DOM component to native using `useDOMImperativeHandle`.
- Behavior differs by SDK:

  - **SDK 53+ (React 19):** `ref` is passed as a prop — use `useDOMImperativeHandle(props.ref, ...)`.
  - **SDK ≤52 (React 18):** use legacy `forwardRef`.

- Prefer native actions for data flow; refs are experimental and may be flaky or phased out. ([Expo Documentation][1])

---

## Measuring & layout

- `dom` prop supports `matchContents: true` to auto-measure DOM content and resize the native container.
- Alternatively, DOM components can call a native action to report size changes (e.g., via `ResizeObserver`).
- You can also set explicit `dom.style` width/height. ([Expo Documentation][1])

---

## Debugging & logs

- `console.log` inside DOM components is forwarded to your terminal by default.
- WebView inspection is available in development (e.g., Safari → Develop → Simulator → your WebView). ([Expo Documentation][1])

---

## Routing & navigation

- Expo Router components like `<Link />` and `useRouter` **can be used** in DOM components for navigation UI.
- BUT APIs that synchronously return router values (`usePathname`, `useSegments`, etc.) are **not auto-supported** — compute those values natively and pass them in as props. Also, `router.canGoBack()`/`canDismiss()` require manual handling. ([Expo Documentation][1])

---

## Assets & public files

- Public assets are experimental and **not supported** in EAS Update. Use `require()` for local assets when possible. If you use public assets, reference them via `process.env.EXPO_BASE_URL`. ([Expo Documentation][1])

---

## Feature detection

Detect whether code is running in a DOM component:

```ts
const IS_DOM = typeof ReactNativeWebView !== "undefined";
```

Use this to gate code or libraries that expect a browser environment. ([Expo Documentation][1])

---

## Limitations & gotchas (must read)

- DOM components are rendered inside a WebView — expect a bridge and async prop updates; **not** identical to in-browser React. ([Expo Documentation][1])
- Props are asynchronous; don’t rely on immediate synchronous updates. ([Expo Documentation][1])
- DOM components cannot render native children — layout routes (`_layout`) should remain native. You can, however, render DOM components from layout routes for headers/backgrounds. ([Expo Documentation][1])
- Avoid `<a>` anchors for navigation — they can change the WebView origin and break back navigation. Prefer `Link` or open external sites with `WebBrowser`. ([Expo Documentation][1])

---

## Architecture notes

- DOM components are single-page applications (no SSR/SSG).
- A module marked `'use dom'` is replaced with a proxy at runtime; bundler/CLI integrations handle the WebView wrapping. ([Expo Documentation][1])

---

## Quick checklist before you build

- [ ] Do I really need DOM APIs / browser-only library?
- [ ] Is the data I pass serializable? (no nested functions)
- [ ] Do I prefer native actions over refs for communication?
- [ ] Have I added `react-native-webview` and the metro runtime?
- [ ] Will I measure content with `matchContents` or manage size manually?
- [ ] Can I debug with WebView devtools if something breaks?

---

## Useful snippets (copy-paste)

**Pass WebView props**

```tsx
<DOMComponent dom={{ scrollEnabled: false }} />
```

**Use `matchContents`**

```tsx
<DOMComponent dom={{ matchContents: true }} />
```

**Expose imperative handle (SDK 53+)**

```tsx
"use dom";
import { useDOMImperativeHandle, type DOMImperativeFactory } from "expo/dom";
import { Ref, useRef } from "react";

export interface DOMRef extends DOMImperativeFactory {
  focus: () => void;
}

export default function MyComponent(props: {
  ref: Ref<DOMRef>;
  dom?: import("expo/dom").DOMProps;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useDOMImperativeHandle(
    props.ref,
    () => ({
      focus: () => inputRef.current?.focus(),
    }),
    []
  );

  return <input ref={inputRef} />;
}
```

---

## Where to read next

Full official guide (source of this doc): **Using React DOM in Expo native apps** — Expo Docs. ([Expo Documentation][1])

---

[1]: https://docs.expo.dev/guides/dom-components/ "Using React DOM in Expo native apps - Expo Documentation"
