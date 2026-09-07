var V = Object.defineProperty;
var q = (n, t, e) =>
  t in n ? V(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : (n[t] = e);
var a = (n, t, e) => q(n, typeof t != "symbol" ? t + "" : t, e);
class $ extends Error {
  constructor(t) {
    (super(t), (this.name = "DemoGhostError"), Object.setPrototypeOf(this, new.target.prototype));
  }
}
class z extends $ {
  constructor(e, i, s) {
    const r = typeof s == "number" ? ` during step ${s + 1}` : "";
    super(`DemoGhost could not find target "${e}" within ${i}ms${r}.`);
    a(this, "target");
    a(this, "timeout");
    a(this, "stepIndex");
    ((this.name = "DemoGhostTargetNotFoundError"),
      (this.target = e),
      (this.timeout = i),
      (this.stepIndex = s));
  }
}
class x extends $ {
  constructor(e, i) {
    super(`DemoGhost timed out waiting for ${e} after ${i}ms.`);
    a(this, "condition");
    a(this, "timeout");
    ((this.name = "DemoGhostTimeoutError"), (this.condition = e), (this.timeout = i));
  }
}
class F extends $ {
  constructor(e, i) {
    const s = typeof i == "number" ? ` at step ${i + 1}` : "";
    super(`Playback error${s}: ${e}`);
    a(this, "stepIndex");
    ((this.name = "DemoGhostPlaybackError"), (this.stepIndex = i));
  }
}
class Ct extends $ {
  constructor(t) {
    (super(`Recording error: ${t}`), (this.name = "DemoGhostRecordingError"));
  }
}
class Tt extends $ {
  constructor(t) {
    (super(`Configuration error: ${t}`), (this.name = "DemoGhostConfigurationError"));
  }
}
class B {
  constructor() {
    a(this, "handlers", /* @__PURE__ */ new Map());
  }
  register(t, e) {
    typeof e == "function" ? this.handlers.set(t, { execute: e }) : this.handlers.set(t, e);
  }
  get(t) {
    const e = this.handlers.get(t);
    if (!e) throw new F(`Unknown action type "${t}". Did you forget to register it?`);
    return e;
  }
  has(t) {
    return this.handlers.has(t);
  }
}
function y(n) {
  const t = n.getBoundingClientRect();
  return {
    x: Math.round(t.left + t.width / 2),
    y: Math.round(t.top + t.height / 2)
  };
}
function A(n) {
  const t = n.tagName.toLowerCase();
  if (t === "button" || t === "a" || t === "input" || t === "select" || t === "textarea") return !0;
  const e = n.getAttribute("role");
  return e === "button" || e === "link" || e === "checkbox" || e === "menuitem"
    ? !0
    : n.hasAttribute("onclick") || window.getComputedStyle(n).cursor === "pointer";
}
function D(n = "normal", t = !1) {
  if (typeof n == "number") return n;
  switch (n) {
    case "instant":
      return 0;
    case "fast":
      return 30;
    case "slow":
      return 180;
    case "human":
      return t ? 85 : Math.floor(40 + Math.random() * 100);
    case "normal":
    default:
      return 75;
  }
}
function b(n, t, e) {
  let i = Object.getPrototypeOf(n);
  for (; i;) {
    const s = Object.getOwnPropertyDescriptor(i, t);
    if (s != null && s.set) {
      s.set.call(n, e);
      return;
    }
    i = Object.getPrototypeOf(i);
  }
  n[t] = e;
}
function E(n, t = !1) {
  (n.dispatchEvent(new Event("input", { bubbles: !0 })),
    t && n.dispatchEvent(new Event("change", { bubbles: !0 })));
}
async function k(n, t, e = !0) {
  const i = e ? Math.max(0.1, Number(n.options.speed) || 1) : 1;
  let s = Math.max(0, t / i);
  for (; s > 0 && !n.signal.aborted;) {
    if ((await n.waitIfPaused(), n.signal.aborted)) return;
    const r = Math.min(s, 50),
      o = performance.now();
    (await new Promise(c => {
      const u = () => {
          (clearTimeout(l), c());
        },
        l = setTimeout(() => {
          (n.signal.removeEventListener("abort", u), c());
        }, r);
      n.signal.addEventListener("abort", u, { once: !0 });
    }),
      (s -= performance.now() - o));
  }
}
function j(n) {
  (n.register("move", async t => {
    const e = t.step,
      i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
    await t.scrollEngine.scrollIntoView(i);
    const s = y(i);
    (t.cursor.setState(A(i) ? "pointer" : "default"),
      await t.cursor.moveTo(
        s.x,
        s.y,
        (e.duration ?? 500) / Math.max(0.1, Number(t.options.speed) || 1)
      ));
  }),
    n.register("click", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (t.cursor.setState(A(i) ? "pointer" : "default"),
        await t.cursor.moveTo(s.x, s.y, 450),
        !t.signal.aborted &&
          (await t.cursor.click(e.button ?? "left"),
          !t.signal.aborted &&
            (i.dispatchEvent(
              new MouseEvent("mousedown", { bubbles: !0, cancelable: !0, view: window })
            ),
            i.dispatchEvent(
              new MouseEvent("mouseup", { bubbles: !0, cancelable: !0, view: window })
            ),
            (e.button ?? "left") === "left"
              ? i.click()
              : i.dispatchEvent(
                  new MouseEvent("click", { bubbles: !0, cancelable: !0, view: window, button: 1 })
                ),
            typeof i.focus == "function" && i.focus())));
    }),
    n.register("doubleClick", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (t.cursor.setState(A(i) ? "pointer" : "default"),
        await t.cursor.moveTo(s.x, s.y, 450),
        await t.cursor.doubleClick(),
        !t.signal.aborted &&
          (i.click(),
          i.click(),
          i.dispatchEvent(
            new MouseEvent("dblclick", { bubbles: !0, cancelable: !0, view: window })
          )));
    }),
    n.register("rightClick", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (await t.cursor.moveTo(s.x, s.y, 450),
        await t.cursor.click("right"),
        !t.signal.aborted &&
          i.dispatchEvent(
            new MouseEvent("contextmenu", { bubbles: !0, cancelable: !0, view: window })
          ));
    }),
    n.register("type", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      if (
        (t.cursor.setState("text"),
        await t.cursor.moveTo(s.x, s.y, 450),
        await t.cursor.click(),
        t.signal.aborted)
      )
        return;
      typeof i.focus == "function" && i.focus();
      const r = i;
      e.clearFirst && "value" in r && (b(r, "value", ""), E(r));
      const o = String(e.value || ""),
        c = e.speed ?? t.options.typingSpeed ?? "human",
        u = t.options.deterministic ?? !1;
      for (let l = 0; l < o.length; l++) {
        if ((await t.waitIfPaused(), t.signal.aborted)) return;
        const h = o[l];
        (i.dispatchEvent(new KeyboardEvent("keydown", { key: h, bubbles: !0 })),
          i.dispatchEvent(new KeyboardEvent("keypress", { key: h, bubbles: !0 })),
          "value" in r && (b(r, "value", r.value + h), E(r)),
          i.dispatchEvent(new KeyboardEvent("keyup", { key: h, bubbles: !0 })));
        const p = D(c, u);
        p > 0 && (await k(t, p));
      }
      "value" in r && r.dispatchEvent(new Event("change", { bubbles: !0 }));
    }),
    n.register("clear", async t => {
      const e = t.step,
        s = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      "value" in s && (b(s, "value", ""), E(s, !0));
    }),
    n.register("focus", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      (await t.scrollEngine.scrollIntoView(i), typeof i.focus == "function" && i.focus());
    }),
    n.register("blur", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      typeof i.blur == "function" && i.blur();
    }),
    n.register("wait", async t => {
      const e = t.step;
      if (e.duration) {
        await k(t, e.duration);
        return;
      }
      if (typeof e.condition == "function") {
        const i = e.timeout ?? 5e3,
          s = Date.now();
        for (; Date.now() - s < i;) {
          if ((await t.waitIfPaused(), t.signal.aborted || (await e.condition()))) return;
          await k(t, 50, !1);
        }
        throw new x("custom condition", i);
      }
      if (e.selector) {
        const i = e.timeout ?? 5e3,
          s = e.state ?? "visible",
          r = Date.now();
        for (; Date.now() - r < i;) {
          if ((await t.waitIfPaused(), t.signal.aborted)) return;
          const o = await t.targetResolver.resolveOptional(e.selector, t.signal);
          if ((s === "attached" && o) || (s === "detached" && !o)) return;
          if (s === "visible" && o) {
            const c = o.getBoundingClientRect();
            if (c.width > 0 && c.height > 0) return;
          }
          if (s === "hidden" && (!o || o.offsetParent === null)) return;
          await k(t, 50, !1);
        }
        throw new x(`selector "${e.selector}" state "${s}"`, i);
      }
    }),
    n.register("scroll", async t => {
      const e = t.step;
      if (e.target) {
        const i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
        await t.scrollEngine.scrollIntoView(i, e.offset);
      } else if (typeof e.x == "number" || typeof e.y == "number") {
        const i = e.x ?? window.scrollX,
          s = e.y ?? window.scrollY;
        await t.scrollEngine.scrollTo(i, s, e.behavior ?? "smooth");
      }
    }),
    n.register("scrollTo", async t => {
      const e = t.step;
      await t.scrollEngine.scrollTo(e.x, e.y, e.behavior ?? "smooth");
    }),
    n.register("select", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      if (
        (await t.cursor.moveTo(s.x, s.y, 400),
        await t.cursor.click(),
        i instanceof HTMLSelectElement)
      ) {
        const r = new Set(Array.isArray(e.value) ? e.value : [e.value]);
        if (i.multiple) for (const o of Array.from(i.options)) o.selected = r.has(o.value);
        else b(i, "value", String(e.value));
        E(i, !0);
      }
    }),
    n.register("check", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (await t.cursor.moveTo(s.x, s.y, 400),
        await t.cursor.click(),
        "checked" in i && !i.checked && (i.click(), i.checked || (b(i, "checked", !0), E(i, !0))));
    }),
    n.register("uncheck", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (await t.cursor.moveTo(s.x, s.y, 400),
        await t.cursor.click(),
        "checked" in i && i.checked && (i.click(), i.checked && (b(i, "checked", !1), E(i, !0))));
    }),
    n.register("hover", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const s = y(i);
      (t.cursor.setState(A(i) ? "pointer" : "default"),
        await t.cursor.moveTo(s.x, s.y, 450),
        i.dispatchEvent(
          new MouseEvent("mouseenter", { bubbles: !0, cancelable: !0, view: window })
        ),
        i.dispatchEvent(new MouseEvent("mouseover", { bubbles: !0, cancelable: !0, view: window })),
        e.duration && e.duration > 0 && (await k(t, e.duration)));
    }),
    n.register("press", async t => {
      const e = t.step;
      let i = document.activeElement;
      e.target &&
        ((i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal)),
        typeof i.focus == "function" && i.focus());
      const s = i || document.body;
      (s.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, bubbles: !0 })),
        s.dispatchEvent(new KeyboardEvent("keypress", { key: e.key, bubbles: !0 })),
        s.dispatchEvent(new KeyboardEvent("keyup", { key: e.key, bubbles: !0 })));
    }),
    n.register("highlight", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      (await t.scrollEngine.scrollIntoView(i),
        await t.spotlightEngine.highlight(i, {
          duration: e.duration ?? 1e3,
          style: e.style ?? "glow"
        }));
    }),
    n.register("caption", async t => {
      const e = t.step;
      let i;
      (e.target && (i = (await t.targetResolver.resolveOptional(e.target, t.signal)) || void 0),
        t.spotlightEngine.showCaption(e.options, i),
        e.options.duration && (await k(t, e.options.duration), t.spotlightEngine.hideCaption()));
    }),
    n.register("drag", async t => {
      const e = t.step,
        i = await t.targetResolver.resolve(e.source, t.stepIndex, t.signal),
        s = await t.targetResolver.resolve(e.target, t.stepIndex, t.signal);
      await t.scrollEngine.scrollIntoView(i);
      const r = y(i),
        o = y(s);
      (await t.cursor.moveTo(r.x, r.y, 400),
        t.cursor.setState("active"),
        await t.cursor.click(),
        i.dispatchEvent(new MouseEvent("mousedown", { bubbles: !0, clientX: r.x, clientY: r.y })),
        i.dispatchEvent(new DragEvent("dragstart", { bubbles: !0, clientX: r.x, clientY: r.y })),
        await t.cursor.moveTo(o.x, o.y, e.duration ?? 700),
        s.dispatchEvent(new DragEvent("dragover", { bubbles: !0, clientX: o.x, clientY: o.y })),
        s.dispatchEvent(new DragEvent("drop", { bubbles: !0, clientX: o.x, clientY: o.y })),
        s.dispatchEvent(new MouseEvent("mouseup", { bubbles: !0, clientX: o.x, clientY: o.y })),
        t.cursor.setState("default"));
    }));
}
class W {
  constructor(t = 5e3) {
    a(this, "defaultTimeout");
    this.defaultTimeout = t;
  }
  async resolve(t, e, i) {
    const s = await this.find(t, void 0, i);
    if (s) return s;
    if (i != null && i.aborted) throw new DOMException("Playback stopped", "AbortError");
    const r = this.normalizeTarget(t),
      o = r.selector,
      c = r.timeout;
    throw new z(typeof o == "string" ? o : "<HTMLElement>", c, e);
  }
  async resolveOptional(t, e) {
    try {
      return await this.find(t, 100, e);
    } catch {
      return null;
    }
  }
  normalizeTarget(t) {
    if (typeof t == "string" || (typeof HTMLElement < "u" && t instanceof HTMLElement))
      return { selector: t, timeout: this.defaultTimeout };
    const e = t;
    return {
      selector: e.selector,
      timeout: e.waitForTarget ?? e.timeout ?? this.defaultTimeout,
      offset: e.offset
    };
  }
  async find(t, e, i) {
    if (typeof window > "u" || !document) return null;
    const s = this.normalizeTarget(t),
      r = s.selector,
      o = s.timeout,
      c = e !== void 0 ? e : o;
    if (typeof HTMLElement < "u" && r instanceof HTMLElement) return r;
    if (typeof r != "string") return null;
    const u = r.trim(),
      l = this.querySingle(u);
    return (
      l ||
      (c <= 0 || (i != null && i.aborted)
        ? null
        : new Promise(h => {
            let p = !1,
              f = null,
              m = null,
              v = null;
            const C = () => {
                ((p = !0),
                  f && clearTimeout(f),
                  m && (m.disconnect(), (m = null)),
                  v !== null &&
                    typeof cancelAnimationFrame < "u" &&
                    (cancelAnimationFrame(v), (v = null)),
                  i == null || i.removeEventListener("abort", L));
              },
              L = () => {
                (C(), h(null));
              },
              M = () => {
                if (p) return;
                const P = this.querySingle(u);
                P && (C(), h(P));
              };
            ((f = setTimeout(() => {
              (C(), h(null));
            }, c)),
              typeof MutationObserver < "u" &&
                ((m = new MutationObserver(() => {
                  M();
                })),
                m.observe(document.body || document.documentElement, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0
                })),
              typeof requestAnimationFrame < "u" && (v = requestAnimationFrame(M)),
              i == null || i.addEventListener("abort", L, { once: !0 }));
          }))
    );
  }
  querySingle(t) {
    if (t.includes(":has-text(") || t.includes(":contains(") || t.startsWith("text="))
      return this.queryByText(t);
    try {
      if (t.startsWith("@")) {
        const s = t.slice(1),
          r = document.querySelector(`[data-demoghost-id="${CSS.escape(s)}"]`);
        if (r) return r;
      }
      const e = document.querySelector(t);
      if (e) return e;
      const i = this.pierceShadow(document.body, t);
      if (i) return i;
    } catch {
      if (t.includes(":contains(") || t.includes(":has-text(")) return this.queryByText(t);
    }
    return null;
  }
  queryByText(t) {
    let e = "*",
      i = "",
      s = !1;
    if (t.startsWith("text="))
      ((i = t.slice(5).trim()),
        ((i.startsWith('"') && i.endsWith('"')) || (i.startsWith("'") && i.endsWith("'"))) &&
          ((i = i.slice(1, -1)), (s = !0)));
    else {
      const o = t.match(/^(.*?):(has-text|contains)\(\s*(["']?)(.*?)\3\s*\)$/i);
      if (!o) return null;
      e = o[1].trim() || "*";
      const c = o[2].toLowerCase();
      ((i = o[4].replace(/\\([\\"'])/g, "$1").trim()), (s = c === "contains"));
    }
    if (!i) return null;
    const r = i.toLowerCase();
    try {
      const o = Array.from(document.querySelectorAll(e)),
        c = [];
      for (const u of o) {
        const l = (u.textContent || "").trim();
        s ? l.toLowerCase() === r && c.push(u) : l.toLowerCase().includes(r) && c.push(u);
      }
      return c.length === 0
        ? null
        : (c.sort((u, l) => (u.contains(l) ? 1 : l.contains(u) ? -1 : 0)), c[0] || null);
    } catch {
      return null;
    }
  }
  pierceShadow(t, e) {
    if (!t) return null;
    try {
      const s = t.querySelector(e);
      if (s) return s;
    } catch {}
    const i = Array.from(t.children || []);
    for (const s of i) {
      if (s.shadowRoot) {
        const o = this.pierceShadow(s.shadowRoot, e);
        if (o) return o;
      }
      const r = this.pierceShadow(s, e);
      if (r) return r;
    }
    return null;
  }
}
const U = n => n * n * n * (n * (n * 6 - 15) + 10);
function Y(n, t, e, i, s) {
  const r = 1 - s,
    o = s * s,
    c = r * r,
    u = c * r,
    l = o * s;
  return {
    x: u * n.x + 3 * c * s * t.x + 3 * r * o * e.x + l * i.x,
    y: u * n.y + 3 * c * s * t.y + 3 * r * o * e.y + l * i.y
  };
}
function X(n, t, e = !1) {
  const i = t.x - n.x,
    s = t.y - n.y,
    r = Math.hypot(i, s);
  if (r < 10)
    return [
      { x: n.x + i * 0.3, y: n.y + s * 0.3 },
      { x: n.x + i * 0.7, y: n.y + s * 0.7 }
    ];
  const o = -s / r,
    c = i / r,
    u = Math.min(r * 0.25, 80),
    l = e ? 0.6 : 0.4 + Math.random() * 0.6,
    h = e || Math.random() > 0.5 ? 1 : -1,
    p = u * l * h,
    f = u * (l * 0.7) * h,
    m = {
      x: n.x + i * 0.25 + o * p,
      y: n.y + s * 0.25 + c * p
    },
    v = {
      x: n.x + i * 0.75 + o * f,
      y: n.y + s * 0.75 + c * f
    };
  return [m, v];
}
class K {
  constructor(t = {}) {
    a(this, "element", null);
    a(this, "pointerMode");
    a(this, "config");
    a(this, "position", { x: 100, y: 100 });
    a(this, "activeAnimation", null);
    a(this, "activeAnimationResolve", null);
    a(this, "pendingTimers", /* @__PURE__ */ new Map());
    a(this, "ripples", /* @__PURE__ */ new Set());
    a(this, "container");
    a(this, "deterministic");
    a(this, "prefersReducedMotion", !1);
    ((this.pointerMode = t.pointerMode ?? "cursor"),
      (this.config = t.cursor ?? { style: "classic" }),
      (this.container = t.container ?? (typeof document < "u" ? document.body : null)),
      (this.deterministic = t.deterministic ?? !1),
      typeof window < "u" &&
        window.matchMedia &&
        (this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      this.mount());
  }
  mount() {
    typeof document > "u" ||
      !this.container ||
      ((this.element = document.createElement("div")),
      (this.element.className = `dg-cursor dg-cursor--${this.pointerMode}`),
      this.element.setAttribute("aria-hidden", "true"),
      (this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`),
      this.renderCursorGraphic(),
      this.container.appendChild(this.element));
  }
  renderCursorGraphic() {
    if (!this.element) return;
    if (this.config.customElement) {
      ((this.element.innerHTML = ""),
        this.element.appendChild(this.config.customElement.cloneNode(!0)));
      return;
    }
    if (this.config.customSvg) {
      this.element.innerHTML = this.config.customSvg;
      return;
    }
    if (this.pointerMode === "touch") {
      this.element.innerHTML = `
        <div class="dg-touch-orb">
          <div class="dg-touch-inner"></div>
        </div>
      `;
      return;
    }
    switch (this.config.style ?? "classic") {
      case "dot":
        this.element.innerHTML = '<div class="dg-cursor-dot"></div>';
        break;
      case "minimal":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg dg-cursor-minimal" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="6" fill="var(--demoghost-accent, #6366f1)" />
            <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2" />
          </svg>
        `;
        break;
      case "pointer":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 11V4a2 2 0 0 1 4 0v5M11 9V6a2 2 0 0 1 4 0v3M15 9V7a2 2 0 0 1 4 0v7a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0v2" fill="var(--demoghost-cursor, #0f172a)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        break;
      case "classic":
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" 
              fill="var(--demoghost-cursor, #0f172a)" 
              stroke="white" 
              stroke-width="1.5" 
              stroke-linejoin="round"/>
          </svg>
        `;
        break;
      default:
        this.element.innerHTML = `
          <svg class="dg-cursor-svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" 
              fill="var(--demoghost-cursor, #0f172a)" 
              stroke="white" 
              stroke-width="1.5" 
              stroke-linejoin="round"/>
          </svg>
        `;
        break;
    }
  }
  async moveTo(t, e, i = 600) {
    this.finishActiveAnimation();
    const s = { ...this.position },
      r = { x: t, y: e };
    if (this.prefersReducedMotion || i <= 0) {
      this.updatePosition(r);
      return;
    }
    const o = X(s, r, this.deterministic),
      c = o[0],
      u = o[1];
    return new Promise(l => {
      this.activeAnimationResolve = l;
      const h = performance.now(),
        p = f => {
          const m = f - h,
            v = Math.min(m / i, 1),
            C = U(v),
            L = Y(s, c, u, r, C);
          (this.updatePosition(L),
            v < 1
              ? (this.activeAnimation = requestAnimationFrame(p))
              : (this.updatePosition(r),
                (this.activeAnimation = null),
                (this.activeAnimationResolve = null),
                l()));
        };
      this.activeAnimation = requestAnimationFrame(p);
    });
  }
  async click(t = "left") {
    this.element &&
      (this.element.classList.add("dg-cursor--active"),
      this.createRipple(),
      await this.wait(120),
      this.element && this.element.classList.remove("dg-cursor--active"));
  }
  async doubleClick() {
    (await this.click(), await this.wait(80), await this.click());
  }
  createRipple() {
    if (typeof document > "u" || !this.container) return;
    const t = document.createElement("div");
    ((t.className = "dg-click-ripple"),
      (t.style.left = `${this.position.x}px`),
      (t.style.top = `${this.position.y}px`),
      this.container.appendChild(t),
      this.ripples.add(t),
      this.schedule(600, () => this.removeRipple(t)));
  }
  wait(t) {
    return new Promise(e => this.schedule(t, e));
  }
  schedule(t, e) {
    const i = setTimeout(() => {
      (this.pendingTimers.delete(i), e());
    }, t);
    this.pendingTimers.set(i, e);
  }
  removeRipple(t) {
    (t.remove(), this.ripples.delete(t));
  }
  finishActiveAnimation() {
    if (
      (this.activeAnimation !== null &&
        (cancelAnimationFrame(this.activeAnimation), (this.activeAnimation = null)),
      this.activeAnimationResolve)
    ) {
      const t = this.activeAnimationResolve;
      ((this.activeAnimationResolve = null), t());
    }
  }
  show() {
    this.element &&
      ((this.element.style.opacity = "1"), (this.element.style.pointerEvents = "none"));
  }
  hide() {
    this.element && (this.element.style.opacity = "0");
  }
  setState(t) {
    this.element &&
      (this.element.classList.remove(
        "dg-state-pointer",
        "dg-state-text",
        "dg-state-active",
        "dg-state-hidden"
      ),
      t !== "default" && this.element.classList.add(`dg-state-${t}`));
  }
  getPosition() {
    return { ...this.position };
  }
  updatePosition(t) {
    ((this.position = t),
      this.element && (this.element.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`));
  }
  destroy() {
    (this.finishActiveAnimation(),
      this.pendingTimers.forEach((t, e) => {
        (clearTimeout(e), t());
      }),
      this.pendingTimers.clear());
    for (const t of this.ripples) this.removeRipple(t);
    (this.ripples.clear(),
      this.element &&
        this.element.parentNode &&
        (this.element.parentNode.removeChild(this.element), (this.element = null)));
  }
}
class J {
  constructor(t = {}) {
    a(this, "config");
    a(this, "activeScroll", null);
    this.config = {
      behavior: "smooth",
      offset: 80,
      ...t
    };
  }
  async scrollIntoView(t, e) {
    if (typeof window > "u") return;
    const i = e ?? this.config.offset ?? 80,
      s = t.getBoundingClientRect(),
      r = window.innerHeight || document.documentElement.clientHeight,
      o = window.innerWidth || document.documentElement.clientWidth,
      c = s.top >= i && s.bottom <= r - 20,
      u = s.left >= 0 && s.right <= o;
    if (c && u) return;
    const l = window.scrollY || window.pageYOffset,
      h = Math.max(0, l + s.top - i);
    await this.scrollTo(window.scrollX || window.pageXOffset, h, this.config.behavior);
  }
  async scrollTo(t, e, i = "smooth") {
    if (typeof window > "u") return;
    if (i === "instant") {
      window.scrollTo(t, e);
      return;
    }
    this.finishActiveScroll();
    const s = window.scrollY,
      r = window.scrollX;
    if (!(Math.hypot(t - r, e - s) < 5))
      return (
        window.scrollTo({ left: t, top: e, behavior: "smooth" }),
        new Promise(c => {
          let u = window.scrollY,
            l = window.scrollX,
            h = 0;
          const p = 25,
            f = setInterval(() => {
              const m = window.scrollY,
                v = window.scrollX;
              (h++,
                (m === u && v === l && h > 2) || h >= p
                  ? this.finishActiveScroll()
                  : ((u = m), (l = v)));
            }, 30);
          this.activeScroll = { interval: f, resolve: c };
        })
      );
  }
  finishActiveScroll() {
    if (!this.activeScroll) return;
    clearInterval(this.activeScroll.interval);
    const t = this.activeScroll.resolve;
    ((this.activeScroll = null), t());
  }
  destroy() {
    this.finishActiveScroll();
  }
}
class G {
  constructor(t) {
    a(this, "container");
    a(this, "overlayEl", null);
    a(this, "captionEl", null);
    a(this, "activeElement", null);
    a(this, "activeStyle", null);
    a(this, "activeTimer", null);
    a(this, "activeTimerResolve", null);
    this.container = t ?? (typeof document < "u" ? document.body : null);
  }
  async highlight(t, e = {}) {
    if (
      (this.clearHighlight(),
      (this.activeElement = t),
      (this.activeStyle = e.style ?? "glow"),
      t.classList.add(`dg-highlight-${this.activeStyle}`),
      this.activeStyle === "spotlight" && this.renderSpotlightOverlay(t),
      e.caption)
    ) {
      const i = typeof e.caption == "string" ? { text: e.caption } : e.caption;
      this.showCaption(i, t);
    }
    e.duration &&
      e.duration > 0 &&
      (await new Promise(i => {
        ((this.activeTimerResolve = i),
          (this.activeTimer = setTimeout(() => {
            ((this.activeTimer = null), (this.activeTimerResolve = null), i());
          }, e.duration)));
      }),
      this.clearHighlight());
  }
  clearHighlight() {
    (this.activeElement &&
      this.activeStyle &&
      (this.activeElement.classList.remove(`dg-highlight-${this.activeStyle}`),
      (this.activeElement = null),
      (this.activeStyle = null)),
      this.overlayEl &&
        this.overlayEl.parentNode &&
        (this.overlayEl.parentNode.removeChild(this.overlayEl), (this.overlayEl = null)),
      this.hideCaption());
  }
  renderSpotlightOverlay(t) {
    if (typeof document > "u" || !this.container) return;
    ((this.overlayEl = document.createElement("div")),
      (this.overlayEl.className = "dg-spotlight-backdrop"),
      this.overlayEl.setAttribute("aria-hidden", "true"));
    const e = t.getBoundingClientRect(),
      i = 8;
    ((this.overlayEl.style.clipPath = `polygon(
      0% 0%, 0% 100%, 100% 100%, 100% 0%,
      0% 0%,
      ${e.left - i}px ${e.top - i}px,
      ${e.right + i}px ${e.top - i}px,
      ${e.right + i}px ${e.bottom + i}px,
      ${e.left - i}px ${e.bottom + i}px,
      ${e.left - i}px ${e.top - i}px
    )`),
      this.container.appendChild(this.overlayEl));
  }
  showCaption(t, e) {
    if ((this.hideCaption(), typeof document > "u" || !this.container)) return;
    ((this.captionEl = document.createElement("div")),
      (this.captionEl.className = "dg-caption dg-glass-panel"),
      this.captionEl.setAttribute("role", "status"));
    let i = "";
    if (
      (t.title && (i += `<div class="dg-caption-title">${this.escapeHtml(t.title)}</div>`),
      (i += `<div class="dg-caption-text">${this.escapeHtml(t.text)}</div>`),
      (this.captionEl.innerHTML = i),
      this.container.appendChild(this.captionEl),
      e)
    ) {
      const s = e.getBoundingClientRect(),
        r = t.position || "bottom",
        o = 16;
      let c = 0,
        u = 0;
      r === "top"
        ? ((c = s.top - this.captionEl.offsetHeight - o),
          (u = s.left + s.width / 2 - this.captionEl.offsetWidth / 2))
        : r === "left"
          ? ((c = s.top + s.height / 2 - this.captionEl.offsetHeight / 2),
            (u = s.left - this.captionEl.offsetWidth - o))
          : r === "right"
            ? ((c = s.top + s.height / 2 - this.captionEl.offsetHeight / 2), (u = s.right + o))
            : ((c = s.bottom + o), (u = s.left + s.width / 2 - this.captionEl.offsetWidth / 2));
      const l = 12;
      ((u = Math.max(l, Math.min(window.innerWidth - this.captionEl.offsetWidth - l, u))),
        (c = Math.max(l, Math.min(window.innerHeight - this.captionEl.offsetHeight - l, c))),
        (this.captionEl.style.transform = `translate3d(${Math.round(u)}px, ${Math.round(c)}px, 0)`));
    } else
      ((this.captionEl.style.bottom = "80px"),
        (this.captionEl.style.left = "50%"),
        (this.captionEl.style.transform = "translateX(-50%)"));
    requestAnimationFrame(() => {
      this.captionEl && this.captionEl.classList.add("dg-caption--visible");
    });
  }
  hideCaption() {
    this.captionEl &&
      this.captionEl.parentNode &&
      (this.captionEl.parentNode.removeChild(this.captionEl), (this.captionEl = null));
  }
  escapeHtml(t) {
    const e = document.createElement("div");
    return ((e.textContent = t), e.innerHTML);
  }
  destroy() {
    if (
      (this.activeTimer && (clearTimeout(this.activeTimer), (this.activeTimer = null)),
      this.activeTimerResolve)
    ) {
      const t = this.activeTimerResolve;
      ((this.activeTimerResolve = null), t());
    }
    this.clearHighlight();
  }
}
const S = {
  light: {
    accent: "#6366f1",
    cursor: "#0f172a",
    glassBg: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    text: "#0f172a",
    shadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  },
  dark: {
    accent: "#818cf8",
    cursor: "#f8fafc",
    glassBg: "rgba(15, 23, 42, 0.82)",
    border: "rgba(255, 255, 255, 0.12)",
    text: "#f8fafc",
    shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  },
  glass: {
    accent: "#6366f1",
    cursor: "#0f172a",
    glassBg: "rgba(255, 255, 255, 0.65)",
    border: "rgba(255, 255, 255, 0.35)",
    text: "#0f172a",
    shadow: "0 20px 50px rgba(99, 102, 241, 0.15)",
    zIndexCursor: 999999,
    zIndexOverlay: 999990
  }
};
class O {
  static apply(t = "glass", e) {
    if (typeof document > "u") return;
    const i = e || document.documentElement;
    let s = S.glass;
    (typeof t == "string"
      ? t === "auto"
        ? (s =
            typeof window < "u" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? S.dark
              : S.light)
        : S[t] && (s = S[t])
      : typeof t == "object" && (s = { ...S.glass, ...t }),
      s.accent && i.style.setProperty("--demoghost-accent", s.accent),
      s.cursor && i.style.setProperty("--demoghost-cursor", s.cursor),
      s.glassBg && i.style.setProperty("--demoghost-glass-bg", s.glassBg),
      s.border && i.style.setProperty("--demoghost-border", s.border),
      s.text && i.style.setProperty("--demoghost-text", s.text),
      s.shadow && i.style.setProperty("--demoghost-shadow", s.shadow),
      s.zIndexCursor && i.style.setProperty("--demoghost-z-index-cursor", String(s.zIndexCursor)),
      s.zIndexOverlay &&
        i.style.setProperty("--demoghost-z-index-overlay", String(s.zIndexOverlay)));
  }
}
class _ {
  constructor() {
    a(this, "liveRegion", null);
    a(this, "previousActiveElement", null);
    a(this, "keydownHandler", null);
    a(this, "announcementTimer", null);
    this.initLiveRegion();
  }
  initLiveRegion() {
    typeof document > "u" ||
      ((this.liveRegion = document.createElement("div")),
      (this.liveRegion.className = "dg-sr-only"),
      this.liveRegion.setAttribute("role", "status"),
      this.liveRegion.setAttribute("aria-live", "polite"),
      this.liveRegion.setAttribute("aria-atomic", "true"),
      document.body.appendChild(this.liveRegion));
  }
  saveFocus() {
    typeof document < "u" &&
      document.activeElement instanceof HTMLElement &&
      (this.previousActiveElement = document.activeElement);
  }
  restoreFocus() {
    if (this.previousActiveElement && typeof this.previousActiveElement.focus == "function") {
      try {
        this.previousActiveElement.focus();
      } catch {}
      this.previousActiveElement = null;
    }
  }
  announce(t) {
    this.liveRegion &&
      ((this.liveRegion.textContent = ""),
      this.announcementTimer && clearTimeout(this.announcementTimer),
      (this.announcementTimer = setTimeout(() => {
        ((this.announcementTimer = null), this.liveRegion && (this.liveRegion.textContent = t));
      }, 50)));
  }
  bindKeyboardControls(t) {
    typeof window > "u" ||
      ((this.keydownHandler = e => {
        e.key === "Escape" && (e.preventDefault(), t.onStop());
      }),
      window.addEventListener("keydown", this.keydownHandler));
  }
  destroy() {
    (this.announcementTimer &&
      (clearTimeout(this.announcementTimer), (this.announcementTimer = null)),
      this.keydownHandler &&
        typeof window < "u" &&
        (window.removeEventListener("keydown", this.keydownHandler), (this.keydownHandler = null)),
      this.liveRegion &&
        this.liveRegion.parentNode &&
        (this.liveRegion.parentNode.removeChild(this.liveRegion), (this.liveRegion = null)),
      this.restoreFocus());
  }
}
class H {
  constructor() {
    a(this, "listeners", {});
  }
  on(t, e) {
    return (
      this.listeners[t] || (this.listeners[t] = []),
      this.listeners[t].push(e),
      () => this.off(t, e)
    );
  }
  off(t, e) {
    const i = this.listeners[t];
    i && (this.listeners[t] = i.filter(s => s !== e));
  }
  emit(t, e) {
    const i = this.listeners[t];
    !i ||
      i.length === 0 ||
      [...i].forEach(s => {
        try {
          s(e);
        } catch (r) {
          console.error(`[DemoGhost] Error in event listener for "${String(t)}":`, r);
        }
      });
  }
  removeAllListeners() {
    this.listeners = {};
  }
}
class Z {
  constructor(t, e = {}, i, s) {
    a(this, "scenario");
    a(this, "options");
    a(this, "actionRegistry");
    a(this, "emitter");
    a(this, "_state", "idle");
    a(this, "_currentStep", 0);
    a(this, "_speed", 1);
    a(this, "abortController", null);
    a(this, "pauseResolver", null);
    a(this, "runPromise", null);
    a(this, "enginesInitialized", !1);
    a(this, "finishResolver");
    a(this, "finishRejecter");
    a(this, "finished");
    // Sub-engines
    a(this, "targetResolver");
    a(this, "cursorEngine");
    a(this, "scrollEngine");
    a(this, "spotlightEngine");
    a(this, "a11y");
    ((this.scenario = t),
      (this.options = e),
      (this._speed = e.speed ?? 1),
      (this.actionRegistry = i),
      (this.emitter = s || new H()),
      (this.finished = Promise.resolve()),
      this.resetFinishedPromise(),
      this.initEngines());
  }
  initEngines() {
    typeof window > "u" ||
      (this.enginesInitialized && this.cleanup(),
      O.apply(this.options.theme, this.options.container),
      (this.targetResolver = new W(this.options.defaultTimeout ?? 5e3)),
      (this.cursorEngine = new K({
        pointerMode: this.options.pointer,
        cursor: this.options.cursor,
        container: this.options.container,
        deterministic: this.options.deterministic
      })),
      (this.scrollEngine = new J(this.options.scroll)),
      (this.spotlightEngine = new G(this.options.container)),
      (this.a11y = new _()),
      this.a11y.saveFocus(),
      this.a11y.bindKeyboardControls({
        onStop: () => this.stop(),
        onTogglePause: () => {
          this._state === "playing" ? this.pause() : this._state === "paused" && this.resume();
        }
      }),
      (this.enginesInitialized = !0));
  }
  resetFinishedPromise() {
    ((this.finished = new Promise((t, e) => {
      ((this.finishResolver = t), (this.finishRejecter = e));
    })),
      this.finished.catch(() => {}));
  }
  get state() {
    return this._state;
  }
  get currentStep() {
    return this._currentStep;
  }
  get totalSteps() {
    return this.scenario.steps.length;
  }
  get speed() {
    return this._speed;
  }
  set speed(t) {
    this._speed = Math.max(0.1, t);
  }
  play() {
    return this._state === "playing"
      ? (this.runPromise ?? this.finished)
      : this._state === "paused"
        ? (this.resume(), this.runPromise ?? this.finished)
        : this._state === "completed" || this._state === "stopped" || this._state === "error"
          ? this.restart()
          : ((this.runPromise = this.runPlayback()), this.runPromise);
  }
  async runPlayback() {
    var t;
    ((this._state = "playing"),
      (this.abortController = new AbortController()),
      this.emitter.emit("start", { scenario: this.scenario }));
    try {
      for (
        ;
        this._currentStep < this.totalSteps &&
        !(
          this.abortController.signal.aborted ||
          (await this.waitIfPaused(), this.abortController.signal.aborted)
        );
      ) {
        const e = this.scenario.steps[this._currentStep];
        (await this.executeStep(e, this._currentStep), this._currentStep++);
      }
      this.abortController.signal.aborted ||
        ((this._state = "completed"),
        this.emitter.emit("complete", { scenario: this.scenario }),
        this.cleanup(),
        this.finishResolver());
    } catch (e) {
      if ((t = this.abortController) != null && t.signal.aborted) return;
      throw (
        (this._state = "error"),
        this.emitter.emit("error", { error: e, stepIndex: this._currentStep }),
        this.cleanup(),
        this.finishRejecter(e),
        e
      );
    } finally {
      this.runPromise = null;
    }
  }
  async executeStep(t, e) {
    var c;
    const i = this.actionRegistry.get(t.type),
      s = performance.now();
    if (
      (this.emitter.emit("step:start", { step: t, index: e, total: this.totalSteps }),
      this.log(`Step ${e + 1}/${this.totalSteps} -> ${t.type.toUpperCase()}`),
      t.caption)
    ) {
      const u = typeof t.caption == "string" ? t.caption : t.caption.text;
      this.a11y.announce(u);
      const l = typeof t.caption == "string" ? { text: t.caption } : t.caption;
      let h;
      (t.target &&
        (h =
          (await this.targetResolver.resolveOptional(
            t.target,
            (c = this.abortController) == null ? void 0 : c.signal
          )) || void 0),
        this.spotlightEngine.showCaption(l, h));
    }
    t.delayBefore && t.delayBefore > 0 && (await this.waitForDuration(t.delayBefore / this._speed));
    const r = {
      step: t,
      stepIndex: e,
      totalSteps: this.totalSteps,
      targetResolver: this.targetResolver,
      cursor: this.cursorEngine,
      scrollEngine: this.scrollEngine,
      spotlightEngine: this.spotlightEngine,
      options: { ...this.options, speed: this._speed },
      signal: this.abortController.signal,
      isPaused: () => this._state === "paused",
      waitIfPaused: () => this.waitIfPaused(),
      log: (u, ...l) => this.log(u, ...l)
    };
    (await i.execute(r),
      t.delayAfter && t.delayAfter > 0 && (await this.waitForDuration(t.delayAfter / this._speed)));
    const o = Math.round(performance.now() - s);
    (this.log(`Step ${e + 1}/${this.totalSteps} completed in ${o}ms`),
      this.emitter.emit("step:complete", { step: t, index: e, total: this.totalSteps }));
  }
  pause() {
    this._state === "playing" && ((this._state = "paused"), this.emitter.emit("pause", void 0));
  }
  resume() {
    this._state === "paused" &&
      ((this._state = "playing"),
      this.pauseResolver && (this.pauseResolver(), (this.pauseResolver = null)),
      this.emitter.emit("resume", void 0));
  }
  stop() {
    this._state === "stopped" ||
      this._state === "completed" ||
      ((this._state = "stopped"),
      this.abortController && this.abortController.abort(),
      this.pauseResolver && (this.pauseResolver(), (this.pauseResolver = null)),
      this.emitter.emit("stop", void 0),
      this.cleanup(),
      this.finishResolver());
  }
  async restart() {
    const t = this.runPromise;
    return (
      this.stop(),
      t && (await t.catch(() => {})),
      (this._currentStep = 0),
      this.initEngines(),
      this.resetFinishedPromise(),
      (this._state = "idle"),
      this.play()
    );
  }
  async next() {
    if (this._currentStep < this.totalSteps - 1) {
      this._currentStep++;
      const t = this.scenario.steps[this._currentStep];
      await this.executeStep(t, this._currentStep);
    }
  }
  async previous() {
    if (this._currentStep > 0) {
      this._currentStep--;
      const t = this.scenario.steps[this._currentStep];
      await this.executeStep(t, this._currentStep);
    }
  }
  async waitIfPaused() {
    this._state === "paused" &&
      (await new Promise(t => {
        this.pauseResolver = t;
      }));
  }
  async waitForDuration(t) {
    var i, s;
    let e = Math.max(0, t);
    for (; e > 0 && !((i = this.abortController) != null && i.signal.aborted);) {
      if ((await this.waitIfPaused(), (s = this.abortController) != null && s.signal.aborted))
        return;
      const r = Math.min(e, 50),
        o = performance.now();
      (await new Promise(c => {
        var l;
        const u = setTimeout(c, r);
        (l = this.abortController) == null ||
          l.signal.addEventListener(
            "abort",
            () => {
              (clearTimeout(u), c());
            },
            { once: !0 }
          );
      }),
        (e -= performance.now() - o));
    }
  }
  cleanup() {
    this.enginesInitialized &&
      (this.cursorEngine && this.cursorEngine.destroy(),
      this.scrollEngine && this.scrollEngine.destroy(),
      this.spotlightEngine && this.spotlightEngine.destroy(),
      this.a11y && this.a11y.destroy(),
      (this.enginesInitialized = !1));
  }
  then(t, e) {
    return this.finished.then(t, e);
  }
  log(t, ...e) {
    this.options.debug && console.log(`[DemoGhost] ${t}`, ...e);
  }
  on(t, e) {
    return this.emitter.on(t, e);
  }
  off(t, e) {
    this.emitter.off(t, e);
  }
}
function Q(n, t = {}) {
  return { type: "move", target: n, ...t };
}
function tt(n, t = {}) {
  return { type: "click", target: n, ...t };
}
function et(n, t = {}) {
  return { type: "doubleClick", target: n, ...t };
}
function it(n, t = {}) {
  return { type: "rightClick", target: n, ...t };
}
function st(n, t, e = {}) {
  return { type: "type", target: n, value: t, ...e };
}
function nt(n, t = {}) {
  return { type: "clear", target: n, ...t };
}
function rt(n, t = {}) {
  return { type: "focus", target: n, ...t };
}
function ot(n, t = {}) {
  return { type: "blur", target: n, ...t };
}
function at(n, t = {}) {
  return typeof n == "number"
    ? { type: "wait", duration: n, ...t }
    : { type: "wait", condition: n, ...t };
}
function lt(n, t = {}) {
  return typeof n == "string"
    ? { type: "wait", selector: n, state: "visible", ...t }
    : typeof n == "function"
      ? { type: "wait", condition: n, ...t }
      : {
          type: "wait",
          selector: n.selector,
          state: n.state ?? "visible",
          timeout: n.timeout,
          ...t
        };
}
function ct(n, t = {}) {
  return typeof n == "string" || (n && "tagName" in n)
    ? { type: "scroll", target: n, ...t }
    : n && typeof n == "object" && !("type" in n)
      ? { type: "scroll", ...n }
      : { type: "scroll", ...t };
}
function ut(n, t, e = "smooth") {
  return { type: "scrollTo", x: n, y: t, behavior: e };
}
function ht(n, t, e = {}) {
  return { type: "select", target: n, value: t, ...e };
}
function dt(n, t = {}) {
  return { type: "check", target: n, ...t };
}
function pt(n, t = {}) {
  return { type: "uncheck", target: n, ...t };
}
function ft(n, t = 500, e = {}) {
  return { type: "hover", target: n, duration: t, ...e };
}
function gt(n, t = {}) {
  return { type: "press", key: n, ...t };
}
function mt(n, t = {}) {
  return { type: "highlight", target: n, ...t };
}
function vt(n, t) {
  return { type: "caption", options: typeof n == "string" ? { text: n } : n, target: t };
}
function yt(n, t, e = {}) {
  return { type: "drag", source: n, target: t, ...e };
}
const g = class g {
  static configure(t) {
    g.globalConfig = { ...g.globalConfig, ...t };
  }
  static play(t, e = {}) {
    g.activeController &&
      (g.activeController.state === "playing" || g.activeController.state === "paused") &&
      g.activeController.stop();
    const i = Array.isArray(t) ? { steps: t } : t,
      s = {
        ...g.globalConfig,
        ...e
      },
      r = new Z(i, s, g.actions, g.globalEmitter);
    return (
      (g.activeController = r),
      s.autoStart !== !1 &&
        r.play().catch(o => {
          s.debug && console.error("[DemoGhost] Playback error:", o);
        }),
      r
    );
  }
  static create(t, e = {}) {
    return {
      play: (i = {}) => g.play(t, { ...e, ...i })
    };
  }
  static on(t, e) {
    return g.globalEmitter.on(t, e);
  }
  static off(t, e) {
    g.globalEmitter.off(t, e);
  }
};
(a(g, "globalConfig", {}),
  a(g, "actions", new B()),
  a(g, "globalEmitter", new H()),
  j(g.actions),
  a(g, "activeController", null));
let w = g;
typeof window < "u" && (window.DemoGhostCore = w);
class wt {
  constructor(t = {}) {
    a(this, "preferredAttributes");
    a(this, "ignoreClasses");
    a(this, "maxDepth");
    ((this.preferredAttributes = t.preferredAttributes || [
      "data-demoghost-id",
      "data-testid",
      "data-test-id",
      "data-cy",
      "data-qa",
      "data-action"
    ]),
      (this.ignoreClasses = /* @__PURE__ */ new Set([
        "dg-cursor",
        "dg-caption",
        "dg-controls",
        "active",
        "focus",
        "hover",
        "selected",
        ...(t.ignoreClasses || [])
      ])),
      (this.maxDepth = t.maxDepth || 5));
  }
  generate(t) {
    if (!t || !(t instanceof HTMLElement)) return "";
    const e = t.getAttribute("data-demoghost-id");
    if (e) return `[data-demoghost-id="${CSS.escape(e)}"]`;
    if (t.id && this.isValidId(t.id)) {
      const l = `#${CSS.escape(t.id)}`;
      if (this.isUnique(l)) return l;
    }
    for (const l of this.preferredAttributes) {
      const h = t.getAttribute(l);
      if (h) {
        const p = `[${l}="${CSS.escape(h)}"]`;
        if (this.isUnique(p)) return p;
      }
    }
    const i = ["name", "aria-label", "placeholder", "title", "alt"];
    for (const l of i) {
      const h = t.getAttribute(l);
      if (h) {
        const f = `${t.tagName.toLowerCase()}[${l}="${CSS.escape(h)}"]`;
        if (this.isUnique(f)) return f;
      }
    }
    const s = t.getAttribute("role");
    if (s) {
      const h = `${t.tagName.toLowerCase()}[role="${CSS.escape(s)}"]`;
      if (this.isUnique(h)) return h;
      const p = t.getAttribute("aria-label");
      if (p) {
        const f = `[role="${CSS.escape(s)}"][aria-label="${CSS.escape(p)}"]`;
        if (this.isUnique(f)) return f;
      }
    }
    const r = t.tagName.toLowerCase();
    if (["button", "a", "h1", "h2", "h3", "label", "span"].includes(r)) {
      const l = (t.textContent || "").trim();
      if (
        l &&
        l.length < 30 &&
        !l.includes(`
`)
      ) {
        const h = `${r}:contains("${l.replace(/"/g, '\\"')}")`;
        if (
          Array.from(document.querySelectorAll(r)).filter(f => (f.textContent || "").trim() === l)
            .length === 1
        )
          return h;
      }
    }
    const o = t.getAttribute("type");
    if (o && ["input", "button"].includes(r)) {
      const l = `${r}[type="${CSS.escape(o)}"]`;
      if (this.isUnique(l)) return l;
    }
    const c = this.getUniqueClassSelector(t);
    if (c) return c;
    const u = this.getContextualSelector(t);
    return u || this.getHierarchicalPath(t);
  }
  getContextualSelector(t) {
    let e = t.parentElement;
    for (; e && e !== document.body && e !== document.documentElement;) {
      if (e.id && this.isValidId(e.id)) {
        const i = t.tagName.toLowerCase(),
          s = `#${CSS.escape(e.id)} ${i}`;
        if (this.isUnique(s)) return s;
        const r = Array.from(t.classList).filter(o => !this.ignoreClasses.has(o));
        if (r.length > 0) {
          const o = `#${CSS.escape(e.id)} ${i}.${CSS.escape(r[0])}`;
          if (this.isUnique(o)) return o;
        }
      }
      e = e.parentElement;
    }
    return null;
  }
  isValidId(t) {
    return /^[0-9]/.test(t) || /:[a-z0-9]+:/i.test(t) || /^__/.test(t)
      ? !1
      : /^[a-zA-Z][a-zA-Z0-9_:-]*$/.test(t);
  }
  isUnique(t) {
    try {
      return document.querySelectorAll(t).length === 1;
    } catch {
      return !1;
    }
  }
  getUniqueClassSelector(t) {
    const e = Array.from(t.classList).filter(s => !this.ignoreClasses.has(s));
    if (e.length === 0) return null;
    const i = t.tagName.toLowerCase();
    for (const s of e) {
      const r = `${i}.${CSS.escape(s)}`;
      if (this.isUnique(r)) return r;
    }
    if (e.length > 1) {
      const s = `${i}.${e.map(r => CSS.escape(r)).join(".")}`;
      if (this.isUnique(s)) return s;
    }
    return null;
  }
  getHierarchicalPath(t) {
    const e = [];
    let i = t,
      s = 0;
    for (; i && i !== document.body && i !== document.documentElement && s < this.maxDepth;) {
      let r = i.tagName.toLowerCase();
      if (i.id && this.isValidId(i.id)) {
        ((r = `#${CSS.escape(i.id)}`), e.unshift(r));
        break;
      }
      const o = i.parentElement;
      if (o) {
        const u = Array.from(o.children).filter(l => l.tagName === i.tagName);
        if (u.length > 1) {
          const l = u.indexOf(i) + 1;
          r += `:nth-of-type(${l})`;
        }
      }
      e.unshift(r);
      const c = e.join(" > ");
      if (this.isUnique(c)) return c;
      ((i = o), s++);
    }
    return e.join(" > ");
  }
}
class bt {
  constructor(t = {}) {
    a(this, "maskPasswords");
    a(this, "maskSelectors");
    a(this, "ignoreSelectors");
    ((this.maskPasswords = t.maskPasswords !== !1),
      (this.maskSelectors = [
        "[data-demoghost-private]",
        "[data-private]",
        ".secret",
        ".private",
        ".confidential",
        ...(t.maskSelectors || [])
      ]),
      (this.ignoreSelectors = t.ignoreSelectors || []));
  }
  shouldIgnore(t) {
    if (
      !t ||
      t.closest(".dg-cursor") ||
      t.closest(".dg-controls") ||
      t.closest(".dg-controls-container") ||
      t.closest(".dg-controls-hud") ||
      t.closest(".dg-caption") ||
      t.closest(".dg-spotlight-backdrop")
    )
      return !0;
    for (const e of this.ignoreSelectors) if (t.matches(e) || t.closest(e)) return !0;
    return !1;
  }
  isSensitive(t) {
    if (!t) return !1;
    if (this.maskPasswords && t instanceof HTMLInputElement && t.type.toLowerCase() === "password")
      return !0;
    const e = ["name", "id", "autocomplete", "placeholder", "aria-label"]
        .map(s => t.getAttribute(s) || "")
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ""),
      i = [
        "password",
        "secret",
        "creditcard",
        "cardnumber",
        "ccnumber",
        "cvv",
        "cvc",
        "csc",
        "cccsc",
        "securitycode",
        "pin",
        "passphrase",
        "ssn",
        "token",
        "apikey",
        "accesstoken",
        "clientsecret",
        "onetimecode"
      ];
    for (const s of i) if (e.includes(s)) return !0;
    for (const s of this.maskSelectors)
      try {
        if (t.matches(s) || t.closest(s)) return !0;
      } catch {}
    return !1;
  }
  maskValue(t, e) {
    return this.isSensitive(t) ? "••••••••" : e;
  }
}
class Et {
  constructor(t = {}) {
    a(this, "options");
    a(this, "selectorGen");
    a(this, "privacyMasker");
    a(this, "steps", []);
    a(this, "isRecording", !1);
    a(this, "lastActionTime", 0);
    a(this, "activeInputTimer", null);
    a(this, "activeInputElement", null);
    a(this, "activeInputValue", "");
    a(this, "clickListener", null);
    a(this, "inputListener", null);
    a(this, "changeListener", null);
    a(this, "scrollListener", null);
    a(this, "keydownListener", null);
    var e, i, s;
    ((this.options = {
      captureScroll: !0,
      captureKeyboard: !0,
      minWaitDuration: 600,
      ...t
    }),
      (this.selectorGen = new wt(t.selector)),
      (this.privacyMasker = new bt({
        ...t.privacy,
        maskPasswords: t.maskPasswords ?? ((e = t.privacy) == null ? void 0 : e.maskPasswords),
        maskSelectors: t.maskSelectors ?? ((i = t.privacy) == null ? void 0 : i.maskSelectors),
        ignoreSelectors: t.ignoreSelectors ?? ((s = t.privacy) == null ? void 0 : s.ignoreSelectors)
      })));
  }
  start() {
    typeof window > "u" ||
      this.isRecording ||
      ((this.steps = []),
      (this.isRecording = !0),
      (this.lastActionTime = Date.now()),
      this.bindEvents());
  }
  stop() {
    return this.isRecording
      ? (this.flushActiveInput(),
        this.unbindEvents(),
        (this.isRecording = !1),
        {
          version: 1,
          steps: [...this.steps]
        })
      : { steps: this.steps };
  }
  bindEvents() {
    ((this.clickListener = t => this.handleClick(t)),
      (this.inputListener = t => this.handleInput(t)),
      (this.changeListener = t => this.handleChange(t)),
      (this.keydownListener = t => this.handleKeydown(t)),
      document.addEventListener("click", this.clickListener, !0),
      document.addEventListener("input", this.inputListener, !0),
      document.addEventListener("change", this.changeListener, !0),
      this.options.captureKeyboard &&
        document.addEventListener("keydown", this.keydownListener, !0),
      this.options.captureScroll &&
        ((this.scrollListener = () => this.handleScroll()),
        window.addEventListener("scroll", this.scrollListener, { passive: !0 })));
  }
  unbindEvents() {
    typeof document > "u" ||
      (this.clickListener && document.removeEventListener("click", this.clickListener, !0),
      this.inputListener && document.removeEventListener("input", this.inputListener, !0),
      this.changeListener && document.removeEventListener("change", this.changeListener, !0),
      this.keydownListener && document.removeEventListener("keydown", this.keydownListener, !0),
      this.scrollListener && window.removeEventListener("scroll", this.scrollListener),
      (this.clickListener = null),
      (this.inputListener = null),
      (this.changeListener = null),
      (this.keydownListener = null),
      (this.scrollListener = null));
  }
  appendWaitIfNecessary() {
    const t = Date.now(),
      e = t - this.lastActionTime,
      i = this.options.minWaitDuration ?? 600;
    if (this.steps.length > 0 && e >= i) {
      const s = Math.round(e / 100) * 100;
      this.steps.push({ type: "wait", duration: s });
    }
    this.lastActionTime = t;
  }
  handleClick(t) {
    const e = t.target;
    if (!e || this.privacyMasker.shouldIgnore(e)) return;
    this.flushActiveInput();
    const i = e.tagName.toLowerCase();
    if (
      i === "select" ||
      i === "textarea" ||
      (i === "input" && !["button", "submit", "reset", "image"].includes(e.type.toLowerCase()))
    )
      return;
    const s = this.selectorGen.generate(e);
    s &&
      (this.appendWaitIfNecessary(),
      this.steps.push({
        type: "click",
        target: s
      }));
  }
  handleInput(t) {
    const e = t.target;
    !e ||
      this.privacyMasker.shouldIgnore(e) ||
      (this.isTextEntryElement(e) &&
        (this.activeInputElement !== e && (this.flushActiveInput(), (this.activeInputElement = e)),
        (this.activeInputValue = this.privacyMasker.isSensitive(e)
          ? this.privacyMasker.maskValue(e, "")
          : e.value),
        this.activeInputTimer && clearTimeout(this.activeInputTimer),
        (this.activeInputTimer = setTimeout(() => {
          this.flushActiveInput();
        }, 500))));
  }
  flushActiveInput() {
    if (
      (this.activeInputTimer &&
        (clearTimeout(this.activeInputTimer), (this.activeInputTimer = null)),
      !this.activeInputElement)
    )
      return;
    const t = this.activeInputElement,
      e = this.selectorGen.generate(t);
    if (e) {
      const i = this.privacyMasker.maskValue(t, this.activeInputValue);
      (this.appendWaitIfNecessary(),
        this.steps.push({
          type: "type",
          target: e,
          value: i,
          clearFirst: !0
        }));
    }
    ((this.activeInputElement = null), (this.activeInputValue = ""));
  }
  handleChange(t) {
    const e = t.target;
    if (!e || this.privacyMasker.shouldIgnore(e)) return;
    this.flushActiveInput();
    const i = e.tagName.toLowerCase();
    if (i === "select") {
      const s = e,
        r = this.selectorGen.generate(s);
      r &&
        (this.appendWaitIfNecessary(),
        this.steps.push({
          type: "select",
          target: r,
          value: s.value
        }));
    } else if (i === "input") {
      const s = e,
        r = (s.type || "text").toLowerCase();
      if (r === "checkbox" || r === "radio") {
        const o = this.selectorGen.generate(s);
        o &&
          (this.appendWaitIfNecessary(),
          this.steps.push({
            type: s.checked ? "check" : "uncheck",
            target: o
          }));
      }
    }
  }
  handleKeydown(t) {
    if (t.repeat || t.isComposing) return;
    const e = t.target;
    if (
      !e ||
      this.privacyMasker.shouldIgnore(e) ||
      !/* @__PURE__ */ new Set([
        "Enter",
        "Escape",
        "Tab",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown"
      ]).has(t.key)
    )
      return;
    this.flushActiveInput();
    const s = e === document.body ? void 0 : this.selectorGen.generate(e);
    (this.appendWaitIfNecessary(),
      this.steps.push({
        type: "press",
        key: t.key,
        ...(s ? { target: s } : {})
      }));
  }
  isTextEntryElement(t) {
    return t instanceof HTMLTextAreaElement
      ? !0
      : t instanceof HTMLInputElement
        ? ![
            "button",
            "checkbox",
            "color",
            "file",
            "hidden",
            "image",
            "radio",
            "range",
            "reset",
            "submit"
          ].includes(t.type.toLowerCase())
        : !1;
  }
  handleScroll() {
    const t = Date.now();
    if (t - this.lastActionTime < 1e3) return;
    const e = window.scrollY,
      i = window.scrollX;
    (e > 0 || i > 0) &&
      (this.steps.push({
        type: "scrollTo",
        x: i,
        y: e,
        behavior: "smooth"
      }),
      (this.lastActionTime = t));
  }
}
const kt = /* @__PURE__ */ new Set([
  "move",
  "click",
  "doubleClick",
  "rightClick",
  "type",
  "clear",
  "focus",
  "blur",
  "wait",
  "waitFor",
  "scroll",
  "scrollTo",
  "select",
  "check",
  "uncheck",
  "hover",
  "press",
  "highlight",
  "caption",
  "drag"
]);
class I {
  static serialize(t) {
    return JSON.stringify(
      t,
      (e, i) => {
        if (typeof i == "function")
          throw new TypeError(
            "Function-based steps cannot be serialized. Use waitFor(selector) instead."
          );
        if (typeof HTMLElement < "u" && i instanceof HTMLElement)
          throw new TypeError(
            "HTMLElement targets cannot be serialized. Use a stable selector string."
          );
        return i;
      },
      2
    );
  }
  static deserialize(t) {
    try {
      const e = JSON.parse(t);
      if (!e || typeof e != "object" || !Array.isArray(e.steps))
        throw new Error("Invalid scenario JSON: 'steps' array is required.");
      if (!e.steps.every(i => i !== null && typeof i == "object" && typeof i.type == "string"))
        throw new Error("Invalid scenario JSON: every step requires a string 'type'.");
      return e;
    } catch (e) {
      throw new Error(`Failed to deserialize DemoGhost scenario: ${e.message}`);
    }
  }
  static toTypeScript(t) {
    const e = /* @__PURE__ */ new Set(),
      i = t.steps.map(
        o => (
          kt.has(o.type) && e.add(o.type === "wait" && o.selector ? "waitFor" : o.type),
          this.formatStepCode(o)
        )
      ),
      s = Array.from(e).sort().join(", ");
    return `import { DemoGhost${s ? `, ${s}` : ""} } from "demoghost";

export const scenario = [
  ${i.join(`,
  `)}
];

await DemoGhost.play(scenario);
`;
  }
  static toJavaScript(t) {
    return `// DemoGhost Scenario Replay
const scenario = [
  ${t.steps.map(i => this.formatStepCode(i, "DemoGhost.")).join(`,
  `)}
];

await DemoGhost.play(scenario);
`;
  }
  static formatStepCode(t, e = "") {
    const i = () => this.formatValue(t.target),
      s = o => this.formatOptions(t, o),
      r = (o, c) => (c ? `${o}, ${c})` : `${o})`);
    switch (t.type) {
      case "move":
      case "click":
      case "doubleClick":
      case "rightClick":
      case "clear":
      case "focus":
      case "blur":
      case "check":
      case "uncheck":
      case "highlight": {
        const o = s(["type", "target"]);
        return r(`${e}${t.type}(${i()}`, o);
      }
      case "type": {
        const o = s(["type", "target", "value"]);
        return r(`${e}type(${i()}, ${this.formatValue(t.value)}`, o);
      }
      case "wait": {
        if (t.selector) {
          const o = {
            selector: t.selector,
            ...this.pickOptions(t, ["type", "selector"])
          };
          return `${e}waitFor(${this.formatValue(o)})`;
        }
        if (typeof t.duration == "number") {
          const o = s(["type", "duration"]);
          return r(`${e}wait(${t.duration}`, o);
        }
        return this.formatValue(t);
      }
      case "scroll": {
        const o = s(["type", "target"]);
        return t.target ? r(`${e}scroll(${i()}`, o) : `${e}scroll(${o})`;
      }
      case "scrollTo":
        return `${e}scrollTo(${t.x}, ${t.y}, ${this.formatValue(t.behavior ?? "smooth")})`;
      case "select": {
        const o = s(["type", "target", "value"]);
        return r(`${e}select(${i()}, ${this.formatValue(t.value)}`, o);
      }
      case "hover": {
        const o = t.duration,
          c = s(["type", "target", "duration"]),
          u = `${e}hover(${i()}${o === void 0 ? "" : `, ${o}`}`;
        return r(u, c);
      }
      case "press": {
        const o = s(["type", "key"]);
        return r(`${e}press(${this.formatValue(t.key)}`, o);
      }
      case "caption":
        return `${e}caption(${this.formatValue(t.options)}${t.target ? `, ${i()}` : ""})`;
      case "drag": {
        const o = s(["type", "source", "target"]);
        return r(`${e}drag(${this.formatValue(t.source)}, ${i()}`, o);
      }
      default:
        return this.formatValue(t);
    }
  }
  static formatOptions(t, e) {
    const i = this.pickOptions(t, e);
    return Object.keys(i).length ? this.formatValue(i) : "";
  }
  static pickOptions(t, e) {
    return Object.fromEntries(Object.entries(t).filter(([i, s]) => !e.includes(i) && s !== void 0));
  }
  static formatValue(t) {
    const e = JSON.stringify(t);
    if (e === void 0)
      throw new TypeError("Scenario contains a value that cannot be exported as code.");
    return e;
  }
}
class T {
  static record(t = {}) {
    const e = new Et(t);
    return (e.start(), e);
  }
  static serialize(t) {
    return I.serialize(t);
  }
  static deserialize(t) {
    return I.deserialize(t);
  }
  static toTypeScript(t) {
    return I.toTypeScript(t);
  }
  static toJavaScript(t) {
    return I.toJavaScript(t);
  }
}
class N {
  constructor(t, e = {}) {
    a(this, "controller");
    a(this, "options");
    a(this, "rootElement", null);
    a(this, "unsubs", []);
    ((this.controller = t),
      (this.options = {
        showStepBadge: !0,
        showProgress: !0,
        showSpeed: !0,
        ...e
      }),
      this.mount(),
      this.bindEvents());
  }
  mount() {
    if (typeof document > "u") return;
    const t = this.options.container || document.body;
    ((this.rootElement = document.createElement("div")),
      (this.rootElement.className = "dg-controls-container"),
      this.rootElement.setAttribute("role", "region"),
      this.rootElement.setAttribute("aria-label", "Demo playback controls"),
      this.render(),
      t.appendChild(this.rootElement));
  }
  render() {
    if (!this.rootElement) return;
    const t = this.controller.totalSteps,
      e = Math.min(this.controller.currentStep + 1, t),
      i = t > 0 ? (e / t) * 100 : 0,
      s = this.controller.state === "playing";
    ((this.rootElement.innerHTML = `
      <div class="dg-controls-hud dg-glass-panel">
        <div class="dg-controls-header">
          <div class="dg-controls-title" id="dg-controls-title">Interactive Demo</div>
          ${this.options.showStepBadge ? `<div class="dg-controls-step-badge" id="dg-controls-step">${e} / ${t}</div>` : ""}
        </div>
        ${
          this.options.showProgress
            ? `
          <div class="dg-controls-progress">
            <div class="dg-controls-progress-bar" id="dg-controls-bar" style="width: ${i}%"></div>
          </div>
        `
            : ""
        }
        <div class="dg-controls-buttons">
          <button type="button" class="dg-btn" id="dg-btn-prev" aria-label="Previous step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="4"></line></svg>
          </button>
          <button type="button" class="dg-btn dg-btn--play" id="dg-btn-toggle" aria-label="${s ? "Pause" : "Play"}">
            ${s ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'}
          </button>
          <button type="button" class="dg-btn" id="dg-btn-next" aria-label="Next step">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
          <button type="button" class="dg-btn" id="dg-btn-restart" aria-label="Restart demo">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          ${
            this.options.showSpeed
              ? `
            <select class="dg-speed-select" id="dg-speed" aria-label="Playback speed">
              <option value="0.5">0.5x</option>
              <option value="1" selected>1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          `
              : ""
          }
          <button type="button" class="dg-btn" id="dg-btn-close" aria-label="Close demo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `),
      this.attachListeners());
  }
  attachListeners() {
    if (!this.rootElement) return;
    const t = this.rootElement.querySelector("#dg-btn-prev"),
      e = this.rootElement.querySelector("#dg-btn-toggle"),
      i = this.rootElement.querySelector("#dg-btn-next"),
      s = this.rootElement.querySelector("#dg-btn-restart"),
      r = this.rootElement.querySelector("#dg-btn-close"),
      o = this.rootElement.querySelector("#dg-speed");
    (t == null || t.addEventListener("click", () => this.controller.previous()),
      i == null || i.addEventListener("click", () => this.controller.next()),
      e == null ||
        e.addEventListener("click", () => {
          this.controller.state === "playing"
            ? this.controller.pause()
            : this.controller.state === "paused"
              ? this.controller.resume()
              : this.controller.state === "idle"
                ? this.controller.play()
                : this.controller.restart();
        }),
      s == null || s.addEventListener("click", () => this.controller.restart()),
      r == null || r.addEventListener("click", () => this.controller.stop()),
      o == null ||
        o.addEventListener("change", () => {
          const c = parseFloat(o.value);
          this.controller.speed = c;
        }));
  }
  bindEvents() {
    const t = s => {
        var u, l, h, p;
        const r = (u = this.rootElement) == null ? void 0 : u.querySelector("#dg-controls-step");
        r && (r.textContent = `${s.index + 1} / ${s.total}`);
        const o = (l = this.rootElement) == null ? void 0 : l.querySelector("#dg-controls-bar");
        if (o) {
          const f = ((s.index + 1) / s.total) * 100;
          o.style.width = `${f}%`;
        }
        const c = (h = this.rootElement) == null ? void 0 : h.querySelector("#dg-controls-title");
        if (c) {
          const f =
            typeof s.step.caption == "string"
              ? s.step.caption
              : ((p = s.step.caption) == null ? void 0 : p.title) || s.step.type;
          c.textContent = f;
        }
      },
      e = () => {
        var o;
        const s = (o = this.rootElement) == null ? void 0 : o.querySelector("#dg-btn-toggle");
        if (!s) return;
        const r = this.controller.state === "playing";
        (s.setAttribute("aria-label", r ? "Pause" : "Play"),
          (s.innerHTML = r
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'));
      },
      i = () => {
        this.destroy(!0);
      };
    (this.unsubs.push(this.controller.on("start", e)),
      this.unsubs.push(this.controller.on("step:start", t)),
      this.unsubs.push(this.controller.on("pause", e)),
      this.unsubs.push(this.controller.on("resume", e)),
      this.unsubs.push(this.controller.on("complete", i)),
      this.unsubs.push(this.controller.on("stop", i)));
  }
  destroy(t = !1) {
    if (
      (this.unsubs.forEach(e => e()),
      (this.unsubs = []),
      this.rootElement && this.rootElement.parentNode)
    )
      if (t) (this.rootElement.parentNode.removeChild(this.rootElement), (this.rootElement = null));
      else {
        const e = this.rootElement;
        (e.classList.add("dg-controls-container--hidden"),
          setTimeout(() => {
            e && e.parentNode && e.parentNode.removeChild(e);
          }, 300),
          (this.rootElement = null));
      }
  }
}
function $t(n, t) {
  return new N(n, t);
}
const d = class d {
  static configure(t) {
    w.configure(t);
  }
  static play(t, e = {}) {
    const i = w.play(t, e);
    return (
      e.controls !== !1 &&
        new N(i, {
          container: e.container
        }),
      i
    );
  }
  static record(t = {}) {
    return T.record(t);
  }
  static create(t, e = {}) {
    return {
      play: (i = {}) => d.play(t, { ...e, ...i })
    };
  }
  static serialize(t) {
    return T.serialize(t);
  }
  static deserialize(t) {
    return T.deserialize(t);
  }
  static toTypeScript(t) {
    return T.toTypeScript(t);
  }
  static toJavaScript(t) {
    return T.toJavaScript(t);
  }
  static export(t, e = "json") {
    return e === "ts" ? d.toTypeScript(t) : e === "js" ? d.toJavaScript(t) : d.serialize(t);
  }
  static on(t, e) {
    return w.on(t, e);
  }
  static off(t, e) {
    w.off(t, e);
  }
};
(a(d, "actions", w.actions), // Direct action creator attachments for CDN / Global access
  a(d, "move", Q),
  a(d, "click", tt),
  a(d, "doubleClick", et),
  a(d, "rightClick", it),
  a(d, "type", st),
  a(d, "clear", nt),
  a(d, "focus", rt),
  a(d, "blur", ot),
  a(d, "wait", at),
  a(d, "waitFor", lt),
  a(d, "scroll", ct),
  a(d, "scrollTo", ut),
  a(d, "select", ht),
  a(d, "check", dt),
  a(d, "uncheck", pt),
  a(d, "hover", ft),
  a(d, "press", gt),
  a(d, "highlight", mt),
  a(d, "caption", vt),
  a(d, "drag", yt));
let R = d;
typeof window < "u" && ((window.DemoGhost = R), (window.dg = R));
export {
  _ as AccessibilityManager,
  B as ActionRegistry,
  K as CursorEngine,
  R as DemoGhost,
  Tt as DemoGhostConfigurationError,
  N as DemoGhostControls,
  w as DemoGhostCore,
  $ as DemoGhostError,
  F as DemoGhostPlaybackError,
  T as DemoGhostRecorder,
  Ct as DemoGhostRecordingError,
  z as DemoGhostTargetNotFoundError,
  x as DemoGhostTimeoutError,
  H as EventEmitter,
  Et as EventRecorder,
  Z as PlaybackController,
  bt as PrivacyMasker,
  I as ScenarioSerializer,
  J as ScrollEngine,
  wt as SelectorGenerator,
  G as SpotlightEngine,
  W as TargetResolver,
  O as ThemeManager,
  $t as attachControls,
  ot as blur,
  vt as caption,
  dt as check,
  nt as clear,
  tt as click,
  R as default,
  et as doubleClick,
  yt as drag,
  rt as focus,
  mt as highlight,
  ft as hover,
  Q as move,
  gt as press,
  it as rightClick,
  ct as scroll,
  ut as scrollTo,
  ht as select,
  st as type,
  pt as uncheck,
  at as wait,
  lt as waitFor
};
//# sourceMappingURL=demoghost.js.map
