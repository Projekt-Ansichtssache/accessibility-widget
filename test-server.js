const http = require("node:http");
const { readFile } = require("node:fs/promises");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT) || 4173;
const WIDGET_PATH = require.resolve("./accessibility-widget.js");
const PROXY_CONTROLS = `
(function () {
  const enabledKey = "accessibility-widget-proxy-enabled";
  const enabled = sessionStorage.getItem(enabledKey) !== "false";

  function clearWidget() {
    document.getElementById("a11y-widget-root")?.remove();
    document.getElementById("a11y-global-styles")?.remove();
    document.getElementById("a11y-reading-fonts")?.remove();
    document.body.className = Array.from(document.body.classList)
      .filter((name) => !name.startsWith("a11y-"))
      .join(" ");
    document.documentElement.classList.remove("a11y-large-cursor");
  }

  function createControls() {
    const host = document.createElement("div");
    host.id = "a11y-proxy-controls";
    host.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:2147483647;";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = [
      "<style>",
      ":host { all: initial; }",
      "* { box-sizing: border-box; }",
      ".wrapper { position: relative; font: 14px/1.4 system-ui, sans-serif; color: #172033; }",
      "button { font: inherit; cursor: pointer; }",
      ".trigger { width: 42px; height: 42px; border: 0; border-radius: 50%; background: #172033; color: white; font-size: 20px; box-shadow: 0 3px 14px #0004; }",
      ".panel { position: absolute; right: 0; bottom: 52px; width: min(300px, calc(100vw - 32px)); padding: 16px; background: white; border: 1px solid #d5dbe5; border-radius: 12px; box-shadow: 0 8px 30px #0003; }",
      ".panel[hidden] { display: none; }",
      "h2 { margin: 0 0 12px; font-size: 16px; }",
      "label { display: block; margin-bottom: 5px; font-weight: 600; }",
      "input { width: 100%; padding: 8px; border: 1px solid #8a94a6; border-radius: 5px; font: inherit; }",
      ".actions { display: grid; gap: 8px; margin-top: 12px; }",
      ".primary, .secondary { width: 100%; padding: 8px 10px; border-radius: 5px; }",
      ".primary { border: 0; background: #165dff; color: white; }",
      ".secondary { border: 1px solid #8a94a6; background: white; color: #172033; }",
      ".toggle { display: flex; align-items: center; gap: 8px; margin-top: 14px; }",
      ".toggle input { width: auto; }",
      "</style>",
      '<div class="wrapper">',
      '<button class="trigger" type="button" aria-label="Testserver-Menü öffnen" aria-expanded="false">⋯</button>',
      '<section class="panel" hidden aria-label="Testserver-Menü">',
      "<h2>Testserver</h2>",
      '<form action="/proxy" method="get">',
      '<label for="proxy-address">Neue Adresse</label>',
      '<input id="proxy-address" name="url" type="url" placeholder="https://example.com" required>',
      '<div class="actions"><button class="primary" type="submit">Website öffnen</button></div>',
      "</form>",
      '<label class="toggle"><input id="proxy-widget" type="checkbox"> Accessibility-Widget anzeigen</label>',
      '<div class="actions"><a class="secondary" href="/reset">Zielseite zurücksetzen</a></div>',
      "</section>",
      "</div>",
    ].join("");

    const trigger = shadow.querySelector(".trigger");
    const panel = shadow.querySelector(".panel");
    const checkbox = shadow.querySelector("#proxy-widget");
    trigger.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      trigger.setAttribute("aria-expanded", String(!panel.hidden));
    });
    checkbox.checked = enabled;
    checkbox.addEventListener("change", () => {
      sessionStorage.setItem(enabledKey, String(checkbox.checked));
      if (checkbox.checked) {
        location.reload();
      } else {
        clearWidget();
      }
    });
    if (!enabled) clearWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createControls);
  } else {
    createControls();
  }
})();
`;

const TEST_PAGE = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accessibility Widget testen</title>
    <style>
      body { font: 16px system-ui, sans-serif; margin: 0; background: #f5f7fb; color: #172033; }
      main { box-sizing: border-box; max-width: 720px; margin: 8rem auto; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 0.5rem 2rem #1720331a; }
      h1 { margin-top: 0; }
      label { display: block; font-weight: 700; margin-bottom: .5rem; }
      .row { display: flex; gap: .75rem; }
      input { min-width: 0; flex: 1; padding: .75rem; border: 1px solid #8a94a6; border-radius: .4rem; font: inherit; }
      button { padding: .75rem 1rem; border: 0; border-radius: .4rem; background: #165dff; color: white; font: inherit; font-weight: 700; cursor: pointer; }
      p { line-height: 1.6; }
      code { background: #eef1f7; padding: .1rem .3rem; border-radius: .25rem; }
      .hint { color: #4c5870; font-size: .95rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Accessibility Widget testen</h1>
      <p>Gib die Adresse der Website ein, auf der das Widget getestet werden soll.</p>
      <form action="/proxy" method="get">
        <label for="url">Website-Adresse</label>
        <div class="row">
          <input id="url" name="url" type="text" inputmode="url" placeholder="example.com" required>
          <button type="submit">Öffnen</button>
        </div>
      </form>
      <p class="hint">Die Seite wird lokal geladen und das Widget automatisch eingefügt. Verwende nur Websites, die du testen darfst.</p>
    </main>
  </body>
</html>`;

function send(response, status, contentType, body) {
  response.writeHead(status, {
    "content-type": `${contentType}; charset=utf-8`,
    "cache-control": "no-store",
  });
  response.end(body);
}

function parseTarget(value) {
  const input = value.trim();
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(input)
    ? input
    : `https://${input}`;
  const target = new URL(withProtocol);

  if (!["http:", "https:"].includes(target.protocol) || !target.hostname) {
    throw new Error("Nur HTTP- und HTTPS-Adressen werden unterstützt.");
  }

  return target;
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function injectWidget(html, baseHref, proxyOrigin) {
  const withoutCsp = html.replace(
    /<meta\b[^>]*http-equiv\s*=\s*["']?content-security-policy["']?[^>]*>/gi,
    "",
  );
  const withoutBase = withoutCsp.replace(/<base\b[^>]*>/gi, "");
  const base = `<base href="${escapeAttribute(baseHref)}">`;
  const script = [
    `<script src="${escapeAttribute(proxyOrigin)}/accessibility-widget.js" defer></script>`,
    `<script src="${escapeAttribute(proxyOrigin)}/proxy-controls.js" defer></script>`,
  ].join("");
  const headStart = withoutBase.search(/<head\b[^>]*>/i);

  if (headStart === -1) {
    return `${base}${script}${withoutBase}`;
  }

  const headEnd = headStart + withoutBase.slice(headStart).search(/>/) + 1;
  const withBase = `${withoutBase.slice(0, headEnd)}${base}${withoutBase.slice(headEnd)}`;
  const headClose = withBase.search(/<\/head\s*>/i);

  return headClose === -1
    ? `${withBase}${script}`
    : `${withBase.slice(0, headClose)}${script}${withBase.slice(headClose)}`;
}

async function proxyPage(request, response, target, proxyOrigin, setTargetCookie) {
  try {
    const upstream = await fetch(target);
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const body = Buffer.from(await upstream.arrayBuffer());

    if (contentType.includes("text/html")) {
      const finalTarget = new URL(upstream.url);
      const html = injectWidget(body.toString("utf8"), `${proxyOrigin}/`, proxyOrigin);
      const headers = setTargetCookie
        ? { "set-cookie": `proxy-target=${encodeURIComponent(finalTarget.origin)}; Path=/; SameSite=Lax` }
        : {};
      response.writeHead(upstream.status, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        ...headers,
      });
      response.end(html);
      return;
    }

    response.writeHead(upstream.status, { "content-type": contentType, "cache-control": "no-store" });
    response.end(body);
  } catch (error) {
    send(response, 502, "text/html", `<h1>Website konnte nicht geladen werden</h1><p>${error.message}</p>`);
  }
}

function getCookie(request, name) {
  const cookies = request.headers.cookie ? request.headers.cookie.split(";") : [];
  const cookie = cookies.find((entry) => entry.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const proxyOrigin = `http://${request.headers.host}`;
  const savedTarget = getCookie(request, "proxy-target");

  if (request.method === "GET" && requestUrl.pathname === "/" && !savedTarget) {
    send(response, 200, "text/html", TEST_PAGE);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/accessibility-widget.js") {
    const widget = await readFile(WIDGET_PATH);
    response.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(widget);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/proxy-controls.js") {
    response.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(PROXY_CONTROLS);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/reset") {
    response.writeHead(303, {
      location: "/",
      "set-cookie": "proxy-target=; Max-Age=0; Path=/; SameSite=Lax",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/proxy") {
    let target;
    try {
      target = parseTarget(requestUrl.searchParams.get("url") || "");
    } catch (error) {
      send(response, 400, "text/html", `<h1>Ungültige Adresse</h1><p>${error.message}</p>`);
      return;
    }
    await proxyPage(request, response, target, proxyOrigin, true);
    return;
  }

  if (request.method === "GET" && savedTarget && requestUrl.pathname !== "/accessibility-widget.js") {
    try {
      const target = new URL(requestUrl.pathname + requestUrl.search, savedTarget);
      await proxyPage(request, response, target, proxyOrigin, false);
    } catch (error) {
      send(response, 502, "text/html", `<h1>Website konnte nicht geladen werden</h1><p>${error.message}</p>`);
    }
    return;
  }

  send(response, 404, "text/plain", "Nicht gefunden");
});

server.listen(PORT, () => {
  console.log(`Testserver läuft auf http://localhost:${PORT}`);
});
