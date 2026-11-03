import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const get = path => readFileSync(new URL(path, import.meta.url), "utf8");

test("all five pages declare a mobile viewport", () => {
  for (const name of ["dashboard", "transactions", "scene", "login", "register"]) {
    assert.match(get("../" + name + ".html"), /name="viewport"\s+content="width=device-width, initial-scale=1\.0"/);
  }
});

test("mobile dashboard uses labeled asset cards and all navigation routes", () => {
  const js = get("../js/dashboard.js");
  const html = get("../dashboard.html");
  const css = get("../css/blocks/99-responsive.css");
  assert.match(js, /data-label="Quantity"/);
  assert.match(js, /data-label="Profit \/ Loss"/);
  assert.match(css, /\.portfolio-header\s*\{\s*display: none/);
  assert.match(css, /\.portfolio-item\s*\{\s*display: grid/);
  for (const route of ["dashboard.html", "transactions.html", "scene.html"]) {
    assert.ok(html.includes('href="' + route + '"'), "missing route " + route);
  }
});

test("all frontend API callers use actual page host for Wi-Fi access", () => {
  for (const name of ["auth", "dashboard", "transactions", "scene"]) {
    const source = get("../js/" + name + ".js");
    assert.match(source, /window\.location\.hostname/);
    assert.doesNotMatch(source, /const API_URL = "http:\/\/localhost:8080/);
  }
});

test("mobile 3D has touch and motion controls", () => {
  const html = get("../scene.html");
  const css = get("../css/scene.css");
  const js = get("../js/scene.js");
  for (const id of ["resetViewBtn", "pauseMotionBtn", "reloadSceneBtn"]) {
    assert.ok(html.includes('id="' + id + '"'));
  }
  assert.match(css, /touch-action: none/);
  assert.match(js, /prefers-reduced-motion/);
});
