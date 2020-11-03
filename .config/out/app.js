// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("lib/css", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function minify(css) {
        return css
            .replace(/\t/g, '')
            .replace(/\n/g, '')
            .replace(/\/\*([\s\S]*?)\*\//g, '')
            .replace(/;\s*/g, ';')
            .replace(/;}/g, '}')
            .replace(/\s*{/g, '{')
            .replace(/:\s*/g, ':');
    }
    exports_1("minify", minify);
    function applyCSS(css) {
        const el = document.createElement('style');
        el.textContent = minify(css);
        document.head.appendChild(el);
    }
    exports_1("applyCSS", applyCSS);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("core/observable", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function observable(value) {
        let subscribers = [];
        function get() {
            return value;
        }
        function set(newVal) {
            value = newVal;
            subscribers.forEach(listener => listener(value, false));
        }
        function subscribe(listener) {
            listener(value, true);
            subscribers.push(listener);
            return () => {
                const index = subscribers.indexOf(listener);
                if (index === -1)
                    throw new Error(`Whoops, somehow lost track of the listener!`);
                subscribers.splice(index, 1);
            };
        }
        return {
            get,
            set,
            subscribe,
        };
    }
    exports_2("observable", observable);
    function isObservable(value) {
        if (!value)
            return false;
        if (value.subscribe)
            return true;
        return false;
    }
    exports_2("isObservable", isObservable);
    function ensureObservable(maybeStateful) {
        if (isObservable(maybeStateful))
            return maybeStateful;
        else
            return observable(maybeStateful);
    }
    exports_2("ensureObservable", ensureObservable);
    function derive(previousState, mapper) {
        return deriveMany([previousState], ([previousStateValue]) => mapper(previousStateValue));
    }
    exports_2("derive", derive);
    function deriveMany(previousStates, mapper) {
        const newValue = () => mapper(previousStates.map(state => state.get()));
        const newState = observable(newValue());
        groupSubscribe(index => {
            if (index !== null)
                newState.set(newValue());
        }, ...previousStates);
        return newState;
    }
    exports_2("deriveMany", deriveMany);
    function groupSubscribe(fn, ...maybeObservables) {
        maybeObservables.forEach((maybeStateful, index) => {
            if (!isObservable(maybeStateful))
                return;
            const state = maybeStateful;
            state.subscribe((_, initial) => {
                if (initial)
                    return;
                fn(index);
            });
        });
        fn(null);
    }
    exports_2("groupSubscribe", groupSubscribe);
    function twoWayBinding(o1, o2, options) {
        if (!options.reverseInitialSetFlow)
            o2.set(options.map1to2(o1.get()));
        else
            o1.set(options.map2to1(o2.get()));
        let internalChange = false;
        o1.subscribe((val, initial) => {
            if (initial)
                return;
            if (internalChange)
                return (internalChange = false);
            if (options.ignoreO1Value && options.ignoreO1Value(val))
                return;
            internalChange = true;
            o2.set(options.map1to2(val));
        });
        o2.subscribe((val, initial) => {
            if (initial)
                return;
            if (internalChange)
                return (internalChange = false);
            if (options.ignoreO2Value && options.ignoreO2Value(val))
                return;
            internalChange = true;
            o1.set(options.map2to1(val));
        });
    }
    exports_2("twoWayBinding", twoWayBinding);
    function sureGet(value) {
        if (isObservable(value))
            return value.get();
        return value;
    }
    exports_2("sureGet", sureGet);
    function readableOnly(stateful) {
        return {
            get: stateful.get,
            subscribe: stateful.subscribe,
        };
    }
    exports_2("readableOnly", readableOnly);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("core/types", [], function (exports_3, context_3) {
    "use strict";
    var domTriggeredEvents;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            exports_3("domTriggeredEvents", domTriggeredEvents = [
                'fullscreenchange',
                'fullscreenerror',
                'pointerlockchange',
                'pointerlockerror',
                'readystatechange',
                'visibilitychange',
                'abort',
                'animationcancel',
                'animationend',
                'animationiteration',
                'animationstart',
                'auxclick',
                'blur',
                'cancel',
                'canplay',
                'canplaythrough',
                'change',
                'click',
                'close',
                'contextmenu',
                'cuechange',
                'dblclick',
                'drag',
                'dragend',
                'dragenter',
                'dragexit',
                'dragleave',
                'dragover',
                'dragstart',
                'drop',
                'durationchange',
                'emptied',
                'ended',
                'error',
                'focus',
                'focusin',
                'focusout',
                'gotpointercapture',
                'input',
                'invalid',
                'keydown',
                'keypress',
                'keyup',
                'load',
                'loadeddata',
                'loadedmetadata',
                'loadstart',
                'lostpointercapture',
                'mousedown',
                'mouseenter',
                'mouseleave',
                'mousemove',
                'mouseout',
                'mouseover',
                'mouseup',
                'pause',
                'play',
                'playing',
                'pointercancel',
                'pointerdown',
                'pointerenter',
                'pointerleave',
                'pointermove',
                'pointerout',
                'pointerover',
                'pointerup',
                'progress',
                'ratechange',
                'reset',
                'resize',
                'scroll',
                'securitypolicyviolation',
                'seeked',
                'seeking',
                'select',
                'selectionchange',
                'selectstart',
                'stalled',
                'submit',
                'suspend',
                'timeupdate',
                'toggle',
                'touchcancel',
                'touchend',
                'touchmove',
                'touchstart',
                'transitioncancel',
                'transitionend',
                'transitionrun',
                'transitionstart',
                'volumechange',
                'waiting',
                'wheel',
                'copy',
                'cut',
                'paste',
            ]);
        }
    };
});
System.register("core/element", ["core/observable", "core/types"], function (exports_4, context_4) {
    "use strict";
    var observable_ts_1, types_ts_1;
    var __moduleName = context_4 && context_4.id;
    function makeElement(htmlNode) {
        let hovering = observable_ts_1.observable(false);
        let active = observable_ts_1.observable(false);
        let focused = observable_ts_1.observable(false);
        htmlNode.addEventListener('mouseenter', () => hovering.set(true));
        htmlNode.addEventListener('mouseleave', () => hovering.set(false));
        htmlNode.addEventListener('mousedown', () => active.set(true));
        htmlNode.addEventListener('mouseup', () => active.set(false));
        htmlNode.addEventListener('touchstart', () => active.set(true));
        htmlNode.addEventListener('touchend', () => active.set(false));
        let clickInside = false;
        htmlNode.addEventListener('click', () => {
            clickInside = true;
            focused.set(true);
        });
        window.addEventListener('click', () => {
            if (clickInside)
                clickInside = false;
            else
                focused.set(false);
        });
        const listeners = {};
        let mounted = false;
        let destroyed = false;
        function addListener(name, fn, once = false) {
            if ((name === 'mount' && mounted) || (name === 'destroy' && destroyed))
                fn(undefined);
            listeners[name] = [...(listeners[name] || []), { once, fn }];
        }
        function dispatchEvent(name, data) {
            if (name === 'mount')
                mounted = true;
            else if (name === 'destroy')
                destroyed = true;
            listeners[name] = (listeners[name] || []).filter(listener => {
                listener.fn(data);
                return !listener.once;
            });
        }
        async function awaitEvent(name) {
            return new Promise(resolve => addListener(name, data => resolve(data), true));
        }
        types_ts_1.domTriggeredEvents.forEach(name => {
            htmlNode.addEventListener(name, (e) => dispatchEvent(name, e));
        });
        return {
            raw: htmlNode,
            $(...children) {
                children.forEach(child => {
                    if (typeof child === 'string')
                        htmlNode.textContent = htmlNode.textContent + child;
                    else {
                        htmlNode.appendChild(child.raw);
                        if (child.dispatchEvent)
                            child.dispatchEvent('mount');
                    }
                });
                return this;
            },
            style(map) {
                const setStyle = (key, value) => {
                    const defaultStore = observable_ts_1.ensureObservable(value.default);
                    const hoveringStore = observable_ts_1.ensureObservable(value.hovering);
                    const activeStore = observable_ts_1.ensureObservable(value.active);
                    const focusedStore = observable_ts_1.ensureObservable(value.focused);
                    const set = (value) => {
                        if (typeof value === 'number')
                            value = `${value}px`;
                        htmlNode.style[key] = value;
                    };
                    observable_ts_1.groupSubscribe(() => {
                        if (active.get())
                            set(activeStore.get());
                        else if (hovering.get())
                            set(activeStore.get());
                        else if (focused.get())
                            set(focusedStore.get());
                        else
                            set(defaultStore.get());
                    }, hovering, active, focused, defaultStore, hoveringStore, activeStore, focusedStore);
                };
                const getStyle = (obj, style) => {
                    if (!obj)
                        return undefined;
                    return obj[style];
                };
                Object.keys(map).forEach(k => {
                    const key = k;
                    let value = map[key];
                    if (value === undefined)
                        return;
                    if (key === 'hovering' || key === 'active' || key === 'focused')
                        return;
                    setStyle(key, {
                        default: value,
                        hovering: getStyle(map?.hovering, key),
                        active: getStyle(map?.active, key),
                        focused: getStyle(map?.focused, key),
                    });
                });
                return this;
            },
            on(handlers) {
                for (let name in handlers) {
                    const handler = handlers[name];
                    if (!handler)
                        continue;
                    addListener(name, e => handler(e));
                }
                return this;
            },
            once(handlers) {
                for (let name in handlers) {
                    const handler = handlers[name];
                    if (!handler)
                        continue;
                    addListener(name, e => handler(e), true);
                }
                return this;
            },
            use(fn) {
                fn(this);
                return this;
            },
            async awaitEvent(name) {
                return await awaitEvent(name);
            },
            dispatchEvent(name, data) {
                dispatchEvent(name, data);
            },
            hovering,
            active,
            focused,
        };
    }
    exports_4("makeElement", makeElement);
    return {
        setters: [
            function (observable_ts_1_1) {
                observable_ts_1 = observable_ts_1_1;
            },
            function (types_ts_1_1) {
                types_ts_1 = types_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("css/normalize.css", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            exports_5("default", `/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

/* Document
   ========================================================================== */

/**
 * 1. Correct the line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 */

html {
	line-height: 1.15; /* 1 */
   -webkit-text-size-adjust: 100%; /* 2 */
   /* Added by deb authors */
   font-family: Arial, Helvetica, sans-serif;
}

/* Sections
	 ========================================================================== */

/**
   * Remove the margin in all browsers.
   */

body {
	margin: 0;
}

/**
   * Render the 'main' element consistently in IE.
   */

main {
	display: block;
}

/**
   * Correct the font size and margin on 'h1' elements within 'section' and
   * 'article' contexts in Chrome, Firefox, and Safari.
   */

h1 {
	font-size: 2em;
	margin: 0.67em 0;
}

/* Grouping content
	 ========================================================================== */

/**
   * 1. Add the correct box sizing in Firefox.
   * 2. Show the overflow in Edge and IE.
   */

hr {
	box-sizing: content-box; /* 1 */
	height: 0; /* 1 */
	overflow: visible; /* 2 */
}

/**
   * 1. Correct the inheritance and scaling of font size in all browsers.
   * 2. Correct the odd 'em' font sizing in all browsers.
   */

pre {
	font-family: monospace, monospace; /* 1 */
	font-size: 1em; /* 2 */
}

/* Text-level semantics
	 ========================================================================== */

/**
   * Remove the gray background on active links in IE 10.
   */

a {
	background-color: transparent;
}

/**
   * 1. Remove the bottom border in Chrome 57-
   * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
   */

abbr[title] {
	border-bottom: none; /* 1 */
	text-decoration: underline; /* 2 */
	text-decoration: underline dotted; /* 2 */
}

/**
   * Add the correct font weight in Chrome, Edge, and Safari.
   */

b,
strong {
	font-weight: bolder;
}

/**
   * 1. Correct the inheritance and scaling of font size in all browsers.
   * 2. Correct the odd 'em' font sizing in all browsers.
   */

code,
kbd,
samp {
	font-family: monospace, monospace; /* 1 */
	font-size: 1em; /* 2 */
}

/**
   * Add the correct font size in all browsers.
   */

small {
	font-size: 80%;
}

/**
   * Prevent 'sub' and 'sup' elements from affecting the line height in
   * all browsers.
   */

sub,
sup {
	font-size: 75%;
	line-height: 0;
	position: relative;
	vertical-align: baseline;
}

sub {
	bottom: -0.25em;
}

sup {
	top: -0.5em;
}

/* Embedded content
	 ========================================================================== */

/**
   * Remove the border on images inside links in IE 10.
   */

img {
	border-style: none;
}

/* Forms
	 ========================================================================== */

/**
   * 1. Change the font styles in all browsers.
   * 2. Remove the margin in Firefox and Safari.
   */

button,
input,
optgroup,
select,
textarea {
	font-family: inherit; /* 1 */
	font-size: 100%; /* 1 */
	line-height: 1.15; /* 1 */
	margin: 0; /* 2 */
}

/**
   * Show the overflow in IE.
   * 1. Show the overflow in Edge.
   */

button,
input {
	/* 1 */
	overflow: visible;
}

/**
   * Remove the inheritance of text transform in Edge, Firefox, and IE.
   * 1. Remove the inheritance of text transform in Firefox.
   */

button,
select {
	/* 1 */
	text-transform: none;
}

/**
   * Correct the inability to style clickable types in iOS and Safari.
   */

button,
[type='button'],
[type='reset'],
[type='submit'] {
	-webkit-appearance: button;
}

/**
   * Remove the inner border and padding in Firefox.
   */

button::-moz-focus-inner,
[type='button']::-moz-focus-inner,
[type='reset']::-moz-focus-inner,
[type='submit']::-moz-focus-inner {
	border-style: none;
	padding: 0;
}

/**
   * Restore the focus styles unset by the previous rule.
   */

button:-moz-focusring,
[type='button']:-moz-focusring,
[type='reset']:-moz-focusring,
[type='submit']:-moz-focusring {
	outline: 1px dotted ButtonText;
}

/**
   * Correct the padding in Firefox.
   */

fieldset {
	padding: 0.35em 0.75em 0.625em;
}

/**
   * 1. Correct the text wrapping in Edge and IE.
   * 2. Correct the color inheritance from 'fieldset' elements in IE.
   * 3. Remove the padding so developers are not caught out when they zero out
   *    'fieldset' elements in all browsers.
   */

legend {
	box-sizing: border-box; /* 1 */
	color: inherit; /* 2 */
	display: table; /* 1 */
	max-width: 100%; /* 1 */
	padding: 0; /* 3 */
	white-space: normal; /* 1 */
}

/**
   * Add the correct vertical alignment in Chrome, Firefox, and Opera.
   */

progress {
	vertical-align: baseline;
}

/**
   * Remove the default vertical scrollbar in IE 10+.
   */

textarea {
	overflow: auto;
}

/**
   * 1. Add the correct box sizing in IE 10.
   * 2. Remove the padding in IE 10.
   */

[type='checkbox'],
[type='radio'] {
	box-sizing: border-box; /* 1 */
	padding: 0; /* 2 */
}

/**
   * Correct the cursor style of increment and decrement buttons in Chrome.
   */

[type='number']::-webkit-inner-spin-button,
[type='number']::-webkit-outer-spin-button {
	height: auto;
}

/**
   * 1. Correct the odd appearance in Chrome and Safari.
   * 2. Correct the outline style in Safari.
   */

[type='search'] {
	-webkit-appearance: textfield; /* 1 */
	outline-offset: -2px; /* 2 */
}

/**
   * Remove the inner padding in Chrome and Safari on macOS.
   */

[type='search']::-webkit-search-decoration {
	-webkit-appearance: none;
}

/**
   * 1. Correct the inability to style clickable types in iOS and Safari.
   * 2. Change font properties to 'inherit' in Safari.
   */

::-webkit-file-upload-button {
	-webkit-appearance: button; /* 1 */
	font: inherit; /* 2 */
}

/* Interactive
	 ========================================================================== */

/*
   * Add the correct display in Edge, IE 10+, and Firefox.
   */

details {
	display: block;
}

/*
   * Add the correct display in all browsers.
   */

summary {
	display: list-item;
}

/* Misc
	 ========================================================================== */

/**
   * Add the correct display in IE 10+.
   */

template {
	display: none;
}

/**
   * Add the correct display in IE 10.
   */

[hidden] {
	display: none;
}`);
        }
    };
});
System.register("core/mod", ["lib/css", "core/element", "css/normalize.css", "core/observable"], function (exports_6, context_6) {
    "use strict";
    var css_ts_1, element_ts_1, normalize_css_ts_1;
    var __moduleName = context_6 && context_6.id;
    function AppRoot(options = {}) {
        if (options.normalizeCSS)
            css_ts_1.applyCSS(css_ts_1.minify(normalize_css_ts_1.default));
        return element_ts_1.makeElement(document.body);
    }
    exports_6("AppRoot", AppRoot);
    function Element(type) {
        return element_ts_1.makeElement(document.createElement(type));
    }
    exports_6("Element", Element);
    var exportedNames_1 = {
        "AppRoot": true,
        "Element": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_6(exports);
    }
    return {
        setters: [
            function (css_ts_1_1) {
                css_ts_1 = css_ts_1_1;
            },
            function (element_ts_1_1) {
                element_ts_1 = element_ts_1_1;
                exportStar_1(element_ts_1_1);
            },
            function (normalize_css_ts_1_1) {
                normalize_css_ts_1 = normalize_css_ts_1_1;
            },
            function (observable_ts_2_1) {
                exportStar_1(observable_ts_2_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("css/better.css", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            exports_7("default", `
html,
body {
	padding: 0;
	margin: 0;
	font-family: Arial, Helvetica, sans-serif;
}

.app-container {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	user-select: none;
	font-size: 16px;
	background: white;
}

.element {
	display: flex;
	justify-content: center;
	align-items: center;
	align-self: stretch;
	position: relative;
	flex-grow: 1;
	border-style: solid;
	border-color: black;
	border-width: 0px;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	outline: none;
}

.text {
	align-self: center;
	text-align: center;
	white-space: pre-wrap;
	background: black;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

img {
	display: block;
}

.icon {
	width: 1em;
	height: 1em;
}
.icon>svg {
	width: 100%;
	height: 100%;
}
`);
        }
    };
});
System.register("components/AppRoot", ["lib/css", "core/mod", "css/better.css", "mod"], function (exports_8, context_8) {
    "use strict";
    var css_ts_2, mod_ts_1, better_css_ts_1, mod_ts_2;
    var __moduleName = context_8 && context_8.id;
    function AppRoot(options = {}) {
        const element = mod_ts_1.Element('div');
        element.raw.classList.add('app-container');
        mod_ts_1.AppRoot({ normalizeCSS: true }).$(element);
        css_ts_2.applyCSS(css_ts_2.minify(better_css_ts_1.default));
        mod_ts_2.setTheme(element, options.theme || mod_ts_2.defaultTheme);
        return {
            ...element,
        };
    }
    exports_8("AppRoot", AppRoot);
    return {
        setters: [
            function (css_ts_2_1) {
                css_ts_2 = css_ts_2_1;
            },
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            },
            function (better_css_ts_1_1) {
                better_css_ts_1 = better_css_ts_1_1;
            },
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("lib/stringify-color", ["mod"], function (exports_9, context_9) {
    "use strict";
    var mod_ts_3;
    var __moduleName = context_9 && context_9.id;
    function stringifyColor(color) {
        if (Array.isArray(color))
            return color.map(color => stringifyColor(color)).join(',');
        const stopMapper = (stop) => {
            const useStarts = stop.starts === undefined || stop.starts === null;
            return `${stringifyColor(stop.color)} ${useStarts ? stop.starts * 100 + '%' : ''}`;
        };
        const isLinearGrad = (v) => 'type' in v && v.type === 'linear-grad';
        const isRadialGrad = (v) => 'type' in v && v.type === 'radial-grad';
        if (typeof color === 'string')
            return mod_ts_3.colorDefaults[color];
        else if (isLinearGrad(color)) {
            const angle = color.angle ?? 0;
            const stops = color.stops.map(stopMapper);
            return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
        }
        else if (isRadialGrad(color)) {
            const percentX = (color?.position?.x ?? 0.5) * 100;
            const percentY = (color?.position?.y ?? 0.5) * 100;
            const shape = color.circle ? 'circle' : 'ellipse';
            const extent = color.extent ?? 'closest-side';
            const stops = color.stops.map(stopMapper);
            const hint = (color.hint ?? 0.5) * 100;
            return `radial-gradient(${percentX}% ${percentY}%, ${shape}, ${extent}, ${stops.join(', ')}, ${hint})`;
        }
        else if (color.hex) {
            return color.hex;
        }
        else if (color.rgb) {
            return `rgb${color.rgb.length === 4 ? 'a' : ''}(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}, ${color.rgb[3]})`;
        }
        throw new Error(`Invalid data in Color object`);
    }
    exports_9("stringifyColor", stringifyColor);
    return {
        setters: [
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("lib/utils", [], function (exports_10, context_10) {
    "use strict";
    var makeArray;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [],
        execute: function () {
            exports_10("makeArray", makeArray = (val) => (Array.isArray(val) ? val : [val]));
        }
    };
});
System.register("components/Label", ["core/mod", "mod", "lib/utils", "lib/stringify-color"], function (exports_11, context_11) {
    "use strict";
    var mod_ts_4, mod_ts_5, utils_ts_1, stringify_color_ts_1;
    var __moduleName = context_11 && context_11.id;
    function Label(text) {
        const core = mod_ts_4.Element('div');
        const element = core.raw;
        const styler = element.style;
        element.classList.add('text');
        mod_ts_5.ensureObservable(text).subscribe(text => (element.textContent = text));
        const testGo = (value, subscriber, ...additionalWatches) => {
            if (value !== undefined)
                mod_ts_5.groupSubscribe(() => subscriber(mod_ts_5.sureGet(value)), value, ...additionalWatches);
            return {
                otherwise: (fn) => {
                    if (value === undefined)
                        fn();
                },
            };
        };
        const pixeled = (value) => {
            if (value)
                return `${value}px`;
            return ``;
        };
        function style(styles) {
            testGo(styles.color, color => {
                if (!color)
                    return;
                styler.background = stringify_color_ts_1.stringifyColor(color);
                styler.webkitBackgroundClip = 'text';
                styler.webkitTextFillColor = 'transparent';
            });
            testGo(styles.font, font => (styler.fontFamily = font ? font : ''));
            testGo(styles.font, font => (styler.fontFamily = font ? font : ''));
            testGo(styles.weight, weight => (styler.fontWeight = weight === 'thin' ? '100' : weight === 'regular' ? '400' : String(weight)));
            const textDecorations = [];
            testGo(styles.strikeThough, strike => (strike ? textDecorations.push('line-through') : null));
            if (textDecorations.length)
                styler.textDecoration = textDecorations.join(' ');
            testGo(styles.italic, italic => (styler.textDecoration = italic ? 'italic' : ''));
            testGo(styles.size, size => (styler.fontSize = pixeled(size)));
            testGo(styles.letterSpacing, spacing => (styler.letterSpacing = pixeled(spacing)));
            testGo(styles.shadow, shadow => (styler.textShadow = utils_ts_1.makeArray(shadow)
                .map(shadow => `${shadow.x || 0}px ${shadow.y || 0}px ${shadow.blur || 0}px ${stringify_color_ts_1.stringifyColor(shadow.color)}`)
                .join(', ')));
            testGo(styles.allowSelection, allow => (allow ? (styler.userSelect = 'text') : null));
            testGo(styles.textAlign, align => (styler.textAlign = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center'));
            testGo(styles.greedy, greedy => {
                core.awaitEvent('mount').then(() => {
                    if (!greedy)
                        return;
                    const parentDirection = element.parentElement?.style?.flexDirection;
                    if (parentDirection === 'column' || parentDirection === 'column-reverse')
                        styler.alignSelf = 'stretch';
                    else
                        styler.flexGrow = '1';
                });
            });
            testGo(styles.tabSize, size => {
                if (typeof size === 'number')
                    styler.tabSize = String(size);
                else
                    styler.tabSize = pixeled(size.length);
            });
            testGo(styles.ignoreWhitespace, ignore => (styler.whiteSpace = ignore ? 'normal' : ''));
            testGo(styles.noWrap, noWrap => {
                if (!noWrap)
                    return;
                if (styler.whiteSpace === 'normal')
                    styler.whiteSpace = 'nowrap';
                else
                    styler.whiteSpace = 'pre';
            });
            testGo(styles.catchTextOverflow, overflow => console.warn('catchTextOverflow is not supported at this time'));
        }
        const self = {
            raw: element,
            style(styles) {
                style(styles);
                return self;
            },
            dispatchEvent: core.dispatchEvent,
            on: core.on,
            once: core.once,
        };
        return self;
    }
    exports_11("Label", Label);
    return {
        setters: [
            function (mod_ts_4_1) {
                mod_ts_4 = mod_ts_4_1;
            },
            function (mod_ts_5_1) {
                mod_ts_5 = mod_ts_5_1;
            },
            function (utils_ts_1_1) {
                utils_ts_1 = utils_ts_1_1;
            },
            function (stringify_color_ts_1_1) {
                stringify_color_ts_1 = stringify_color_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("components/Block", ["mod", "core/mod", "lib/stringify-color", "lib/utils", "components/Label"], function (exports_12, context_12) {
    "use strict";
    var mod_ts_6, mod_ts_7, stringify_color_ts_2, utils_ts_2, Label_ts_1;
    var __moduleName = context_12 && context_12.id;
    function Block() {
        const core = mod_ts_7.Element('div');
        const element = core.raw;
        const styler = element.style;
        element.setAttribute('tabIndex', '-1');
        element.classList.add('element');
        const self = {
            ...core,
            style(styles) {
                const isOk = (value) => value !== undefined && Object.keys(value).length;
                mod_ts_6.groupSubscribe(changed => {
                    if (changed !== null) {
                        if (changed === 0 && !isOk(styles.hovering))
                            return;
                        if (changed === 1 && !isOk(styles.active))
                            return;
                        if (changed === 2 && !isOk(styles.focused))
                            return;
                        element.style.cssText = ``;
                    }
                    style(styles);
                    if (core.hovering.get() && isOk(styles.hovering))
                        style(styles.hovering);
                    else if (core.active.get() && isOk(styles.active))
                        style(styles.active);
                    else if (core.focused.get() && isOk(styles.focused))
                        style(styles.focused);
                }, core.hovering, core.active, core.focused, ...Object.values(styles));
                return self;
            },
            $(...children) {
                core.$(...children.map(child => (typeof child === 'string' ? Label_ts_1.Label(child) : child)));
                return self;
            },
            vertical() {
                style({ stackY: true });
                return self;
            },
            packX() {
                style({ packX: true });
                return self;
            },
            packY() {
                style({ packY: true });
                return self;
            },
        };
        const runIfIsOk = (val, fn) => {
            if (val !== undefined && val !== null)
                fn(val);
        };
        const testGo = (value, subscriber, ...additionalWatches) => {
            if (value !== undefined)
                subscriber(mod_ts_6.sureGet(value));
            return {
                otherwise: (fn) => {
                    if (value === undefined)
                        fn();
                },
            };
        };
        const pixeled = (value) => {
            if (value)
                return `${value}px`;
            return ``;
        };
        const parseStringPosition = (val) => {
            const positionsChanged = {
                top: 'flex-start',
                bottom: 'flex-end',
                start: 'flex-start',
                end: 'flex-end',
            };
            return positionsChanged[val] || val;
        };
        function style(styles) {
            testGo(styles.height, height => {
                styler.height = pixeled(height);
                styles.packY = true;
            });
            testGo(styles.width, width => {
                styler.width = pixeled(width);
                styles.packX = true;
            });
            testGo(styles.maxWidth, width => (styler.maxWidth = pixeled(width)));
            testGo(styles.packX, pack => {
                if (pack) {
                    self.awaitEvent('mount').then(() => {
                        const parentDirection = element.parentElement?.style?.flexDirection;
                        if (parentDirection === 'column' || parentDirection === 'column-reverse')
                            styler.alignSelf = 'unset';
                        else
                            styler.flexGrow = 'unset';
                    });
                }
            }, styles.alignSelfY);
            testGo(styles.packY, pack => {
                if (pack) {
                    self.awaitEvent('mount').then(() => {
                        const parentDirection = element.parentElement?.style?.flexDirection;
                        if (!parentDirection || parentDirection === 'row' || parentDirection === 'row-reverse')
                            styler.alignSelf = 'unset';
                        else
                            styler.flexGrow = 'unset';
                    });
                }
            }, styles.alignSelfY);
            testGo(styles.grow, grow => {
                if (!grow)
                    return;
                if (grow < 1)
                    styler.flexShrink = String(grow * 10);
                else
                    styler.flexGrow = String(grow);
            });
            testGo(styles.margin, margin => {
                if (typeof margin === 'number')
                    margin = {
                        top: margin,
                        right: margin,
                        bottom: margin,
                        left: margin,
                    };
                styler.marginTop = pixeled(margin.top);
                styler.marginRight = pixeled(margin.right);
                styler.marginBottom = pixeled(margin.bottom);
                styler.marginLeft = pixeled(margin.left);
            });
            testGo(styles.padding, padding => {
                if (typeof padding === 'number')
                    padding = {
                        top: padding,
                        right: padding,
                        bottom: padding,
                        left: padding,
                    };
                styler.paddingTop = pixeled(padding.top);
                styler.paddingRight = pixeled(padding.right);
                styler.paddingBottom = pixeled(padding.bottom);
                styler.paddingLeft = pixeled(padding.left);
            });
            testGo(styles.border, border => {
                if (typeof border === 'number')
                    return (styler.borderWidth = pixeled(border));
                const stringify = (border) => `${border.width}px ${border.style} ${stringify_color_ts_2.stringifyColor(border.color)}`;
                const isBorderStyle = (v) => 'style' in v;
                if (isBorderStyle(border))
                    return (styler.border = stringify(border));
                if (border.top)
                    styler.borderTop = stringify(border.top);
                if (border.right)
                    styler.borderRight = stringify(border.right);
                if (border.bottom)
                    styler.borderBottom = stringify(border.bottom);
                if (border.left)
                    styler.borderLeft = stringify(border.left);
            });
            testGo(styles.background, style => (styler.background = stringify_color_ts_2.stringifyColor(style)));
            const textures = [];
            testGo(styles.blur, val => textures.push(`blur(${pixeled(val)})`));
            testGo(styles.brightness, val => textures.push(`brightness(${val})`));
            testGo(styles.contrast, val => textures.push(`contrast(${val})`));
            testGo(styles.grayscale, val => textures.push(`grayscale(${val})`));
            testGo(styles.invert, val => textures.push(`invert(${val})`));
            testGo(styles.hueRotate, val => textures.push(`hueRotate(${val}deg)`));
            testGo(styles.saturate, val => textures.push(`saturate(${val})`));
            testGo(styles.sepia, val => textures.push(`sepia(${val})`));
            if (textures.length)
                styler.filter = textures.join(', ');
            const transformations = [];
            testGo(styles.rotate, val => {
                if (typeof val === 'number')
                    return transformations.push(`rotate(${val}deg)`);
                runIfIsOk(val.z, z => transformations.push(`rotateZ(${z}deg)`));
                runIfIsOk(val.x, x => transformations.push(`rotateX(${x}deg)`));
                runIfIsOk(val.y, y => transformations.push(`rotateY(${y}deg)`));
            });
            testGo(styles.scale, val => {
                if (typeof val === 'number')
                    return transformations.push(`scale(${val})`);
                const x = val.x ?? 1;
                const y = val.y ?? 1;
                const z = val.z ?? 1;
                transformations.push(`scale3d(${x}, ${y}, ${z})`);
            });
            testGo(styles.translate, val => {
                if (typeof val === 'number')
                    return transformations.push(`translate(${val}px)`);
                runIfIsOk(val.z, z => transformations.push(`translateZ(${z}px)`));
                runIfIsOk(val.x, x => transformations.push(`translateX(${x}px)`));
                runIfIsOk(val.y, y => transformations.push(`translateY(${y}px)`));
            });
            testGo(styles.skew, val => transformations.push(`skew(${val.ax}deg, ${val.ay}deg)`));
            if (transformations.length)
                styler.transform = transformations.join(', ');
            testGo(styles.visible, isVisible => (styler.visibility = isVisible ? 'visible' : 'hidden'));
            testGo(styles.display, display => (styler.display = display ? 'flex' : 'none'));
            testGo(styles.absolute, isAbsolute => (styler.position = isAbsolute ? 'absolute' : 'relative'));
            testGo(styles.position, position => {
                styler.top = pixeled(position.top);
                styler.right = pixeled(position.right);
                styler.bottom = pixeled(position.bottom);
                styler.left = pixeled(position.left);
            });
            testGo(styles.zIndex, index => (styler.zIndex = String(index)));
            testGo(styles.boxShadow, shadow => {
                if (!shadow)
                    return;
                styler.boxShadow = utils_ts_2.makeArray(shadow)
                    .map(shadow => `${shadow.x ?? 2}px ${shadow.y ?? 2}px ${shadow.blur ?? 10}px ${shadow.spread ?? 4}px ${stringify_color_ts_2.stringifyColor(shadow.color)}`)
                    .join(', ');
            });
            testGo(styles.opacity, opacity => (styler.opacity = String(opacity)));
            testGo(styles.order, order => (styler.order = String(order)));
            testGo(styles.hideFromMouse, hide => (styler.pointerEvents = hide ? 'none' : 'auto'));
            testGo(styles.cursor, cursor => (styler.cursor = cursor ? cursor : ''));
            testGo(styles.borderRadius, radius => {
                if (typeof radius === 'number')
                    styler.borderRadius = pixeled(radius);
                else {
                    const favor0 = (val) => (val ? pixeled(val) : '0');
                    styler.borderRadius = `${favor0(radius.topLeft)} ${favor0(radius.topRight)} ${favor0(radius.bottomRight)} ${favor0(radius.bottomLeft)}`;
                }
            });
            testGo(styles.alignSelfY, val => (styler.alignSelf = parseStringPosition(val)));
            testGo(styles.alignY, val => styler.flexDirection === 'row' || styler.flexDirection === 'row-reverse'
                ? (styler.alignItems = parseStringPosition(val))
                : (styler.justifyContent = parseStringPosition(val)));
            testGo(styles.alignX, val => styler.flexDirection === 'column' || styler.flexDirection === 'column-reverse'
                ? (styler.alignItems = parseStringPosition(val))
                : (styler.justifyContent = parseStringPosition(val)));
            testGo(styles.wrapChildren, wrap => (styler.flexWrap = !wrap ? 'nowrap' : mod_ts_6.sureGet(styles.wrapReverse) ? 'wrap-reverse' : 'wrap'), styles.wrapReverse);
            testGo(styles.stackY, y => {
                if (y) {
                    styler.flexDirection = mod_ts_6.sureGet(styles.stackReverse) ? 'column-reverse' : 'column';
                    if ((mod_ts_6.sureGet(styles.width) === undefined || mod_ts_6.sureGet(styles.width) === null) &&
                        (mod_ts_6.sureGet(styles.packX) === undefined || mod_ts_6.sureGet(styles.packX) === null) &&
                        !styler.width)
                        styler.width = '100%';
                }
                else {
                    styler.flexDirection = mod_ts_6.sureGet(styles.stackReverse) ? 'row-reverse' : 'row';
                }
            }, styles.stackReverse).otherwise(() => {
                if (!styler.flexDirection)
                    styler.flexDirection = mod_ts_6.sureGet(styles.stackReverse) ? 'row-reverse' : 'row';
            });
            testGo(styles.transition, transitions => {
                styler.transition = utils_ts_2.makeArray(transitions)
                    .map(transition => utils_ts_2.makeArray(transition.style)
                    .map(what => `${what} ${transition.time}ms`)
                    .join(', '))
                    .join(', ');
            });
            if (styles.labelDefaults) {
                testGo(styles.labelDefaults.color, color => {
                    if (!color)
                        return;
                    styler.color = stringify_color_ts_2.stringifyColor(color);
                });
                testGo(styles.labelDefaults.font, font => (styler.fontFamily = font ? font : ''));
                testGo(styles.labelDefaults.weight, weight => (styler.fontWeight = weight === 'thin' ? '100' : weight === 'regular' ? '400' : String(weight)));
                testGo(styles.labelDefaults.italic, italic => (styler.textDecoration = italic ? 'italic' : ''));
                testGo(styles.labelDefaults.size, size => (styler.fontSize = pixeled(size)));
                testGo(styles.labelDefaults.letterSpacing, spacing => (styler.letterSpacing = pixeled(spacing)));
                testGo(styles.labelDefaults.shadow, shadow => {
                    styler.textShadow = utils_ts_2.makeArray(shadow)
                        .map(shadow => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${stringify_color_ts_2.stringifyColor(shadow.color)}`)
                        .join(', ');
                });
                testGo(styles.labelDefaults.allowSelection, allow => (allow ? (styler.userSelect = 'text') : null));
            }
            return self;
        }
        return self;
    }
    exports_12("Block", Block);
    return {
        setters: [
            function (mod_ts_6_1) {
                mod_ts_6 = mod_ts_6_1;
            },
            function (mod_ts_7_1) {
                mod_ts_7 = mod_ts_7_1;
            },
            function (stringify_color_ts_2_1) {
                stringify_color_ts_2 = stringify_color_ts_2_1;
            },
            function (utils_ts_2_1) {
                utils_ts_2 = utils_ts_2_1;
            },
            function (Label_ts_1_1) {
                Label_ts_1 = Label_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("types", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("components/ImageBlock", ["core/mod", "mod"], function (exports_14, context_14) {
    "use strict";
    var mod_ts_8, mod_ts_9;
    var __moduleName = context_14 && context_14.id;
    function ImageBlock(img) {
        const element = mod_ts_9.Block();
        const imageElement = mod_ts_8.Element('img');
        const raw = imageElement.raw;
        if (typeof img !== 'string') {
            const blob = new Blob([img], { type: 'image/bmp' });
            img = window.URL.createObjectURL(blob);
        }
        raw.src = img;
        raw.style.width = '100%';
        return {
            ...element.$(imageElement),
            style(styles) {
                element.style(styles.wrapper);
            },
        };
    }
    exports_14("ImageBlock", ImageBlock);
    return {
        setters: [
            function (mod_ts_8_1) {
                mod_ts_8 = mod_ts_8_1;
            },
            function (mod_ts_9_1) {
                mod_ts_9 = mod_ts_9_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("color", [], function (exports_15, context_15) {
    "use strict";
    var colorDefaults;
    var __moduleName = context_15 && context_15.id;
    function makeLinearGrad(stops, options = {}) {
        return {
            type: 'linear-grad',
            stops,
            ...options,
        };
    }
    exports_15("makeLinearGrad", makeLinearGrad);
    function makeHex(hex) {
        if (!hex.startsWith('#'))
            hex = '#' + hex;
        return {
            hex,
        };
    }
    exports_15("makeHex", makeHex);
    function makeRgb(red, green, blue, alpha) {
        return {
            rgb: [red, green, blue, alpha],
        };
    }
    exports_15("makeRgb", makeRgb);
    return {
        setters: [],
        execute: function () {
            exports_15("colorDefaults", colorDefaults = {
                red: `#f44336`,
                tomato: `#ff6347`,
                pink: `#e91e63`,
                violet: `#ee82ee`,
                purple: `#9c27b0`,
                deepPurple: `#673ab7`,
                indigo: `#3f51b5`,
                blue: `#2196f3`,
                dodgerBlue: `#1e90ff`,
                lightBlue: `#87ceeb`,
                slateBlue: `#6a5acd`,
                cobalt: `#0050ef`,
                cyan: `#00bcd4`,
                aqua: `#00ffff`,
                teal: `#009688`,
                green: `#4caf50`,
                seaGreen: `#3cb371`,
                lightGreen: `#8bc34a`,
                darkGreen: `#096347`,
                lime: `#cddc39`,
                sand: `#fdf5e6`,
                khaki: `#f0e68c`,
                yellow: `#ffeb3b`,
                amber: `#ffc107`,
                orange: `#ff9800`,
                deepOrange: `#ff5722`,
                blueGray: `#607d8b`,
                blueGrey: `#607d8b`,
                brown: `#795548`,
                lightGray: `#f1f1f1`,
                lightGrey: `#f1f1f1`,
                gray: `#f1f1f1`,
                grey: `#f1f1f1`,
                darkGray: `#616161`,
                darkGrey: `#616161`,
                paleRed: `#ffdddd`,
                paleYellow: `#ffffcc`,
                paleGreen: `#ddffdd`,
                paleBlue: `#ddffff`,
                black: `#000000`,
                white: `#ffffff`,
            });
        }
    };
});
System.register("components/Icon", ["lib/stringify-color", "mod"], function (exports_16, context_16) {
    "use strict";
    var stringify_color_ts_3, mod_ts_10, svgStrings;
    var __moduleName = context_16 && context_16.id;
    function Icon(value) {
        const svgText = mod_ts_10.derive(mod_ts_10.ensureObservable(value), value => svgStrings[value] || value);
        const container = mod_ts_10.Block().packX().packY();
        const styler = container.raw.style;
        container.raw.classList.add('icon');
        svgText.subscribe(text => (container.raw.innerHTML = text));
        const self = {
            ...container,
            style(styles) {
                const pixeled = (val) => (val === null ? `` : `${val}px`);
                if (styles.color)
                    mod_ts_10.ensureObservable(styles.color).subscribe(color => (styler.color = stringify_color_ts_3.stringifyColor(color)));
                if (styles.size)
                    mod_ts_10.ensureObservable(styles.size).subscribe(size => {
                        styler.width = pixeled(size);
                        styler.height = pixeled(size);
                    });
                if (styles.width)
                    mod_ts_10.ensureObservable(styles.width).subscribe(width => (styler.width = pixeled(width)));
                if (styles.height)
                    mod_ts_10.ensureObservable(styles.height).subscribe(height => (styler.height = pixeled(height)));
                return self;
            },
        };
        return self;
    }
    exports_16("Icon", Icon);
    return {
        setters: [
            function (stringify_color_ts_3_1) {
                stringify_color_ts_3 = stringify_color_ts_3_1;
            },
            function (mod_ts_10_1) {
                mod_ts_10 = mod_ts_10_1;
            }
        ],
        execute: function () {
            svgStrings = {
                'dots-horizontal': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>`,
                'dots-vertical': `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>`,
                x: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
                check: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
                pencil: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`,
            };
        }
    };
});
System.register("components/mod", ["components/AppRoot", "components/Block", "components/Label", "components/ImageBlock", "components/Icon"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_17(exports);
    }
    return {
        setters: [
            function (AppRoot_ts_1_1) {
                exportStar_2(AppRoot_ts_1_1);
            },
            function (Block_ts_1_1) {
                exportStar_2(Block_ts_1_1);
            },
            function (Label_ts_2_1) {
                exportStar_2(Label_ts_2_1);
            },
            function (ImageBlock_ts_1_1) {
                exportStar_2(ImageBlock_ts_1_1);
            },
            function (Icon_ts_1_1) {
                exportStar_2(Icon_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register(".config/deps/asr", [], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
            exports_18("default", (function () {
                'use strict';
                function createCommonjsModule(fn, module) {
                    return module = { exports: {} }, fn(module, module.exports), module.exports;
                }
                var stateStringParser = createCommonjsModule(function (module) {
                    module.exports = function (stateString) {
                        return stateString.split('.').reduce(function (stateNames, latestNameChunk) {
                            stateNames.push(stateNames.length ? stateNames[stateNames.length - 1] + '.' + latestNameChunk : latestNameChunk);
                            return stateNames;
                        }, []);
                    };
                });
                var stateState = function StateState() {
                    var states = {};
                    function getHierarchy(name) {
                        var names = stateStringParser(name);
                        return names.map(function (name) {
                            if (!states[name]) {
                                throw new Error('State ' + name + ' not found');
                            }
                            return states[name];
                        });
                    }
                    function getParent(name) {
                        var parentName = getParentName(name);
                        return parentName && states[parentName];
                    }
                    function getParentName(name) {
                        var names = stateStringParser(name);
                        if (names.length > 1) {
                            var secondToLast = names.length - 2;
                            return names[secondToLast];
                        }
                        else {
                            return null;
                        }
                    }
                    function guaranteeAllStatesExist(newStateName) {
                        var stateNames = stateStringParser(newStateName);
                        var statesThatDontExist = stateNames.filter(function (name) {
                            return !states[name];
                        });
                        if (statesThatDontExist.length > 0) {
                            throw new Error('State ' + statesThatDontExist[statesThatDontExist.length - 1] + ' does not exist');
                        }
                    }
                    function buildFullStateRoute(stateName) {
                        return getHierarchy(stateName).map(function (state) {
                            return '/' + (state.route || '');
                        }).join('').replace(/\/{2,}/g, '/');
                    }
                    function applyDefaultChildStates(stateName) {
                        var state = states[stateName];
                        var defaultChildStateName = state && (typeof state.defaultChild === 'function' ? state.defaultChild() : state.defaultChild);
                        if (!defaultChildStateName) {
                            return stateName;
                        }
                        var fullStateName = stateName + '.' + defaultChildStateName;
                        return applyDefaultChildStates(fullStateName);
                    }
                    return {
                        add: function add(name, state) {
                            states[name] = state;
                        },
                        get: function get(name) {
                            return name && states[name];
                        },
                        getHierarchy: getHierarchy,
                        getParent: getParent,
                        getParentName: getParentName,
                        guaranteeAllStatesExist: guaranteeAllStatesExist,
                        buildFullStateRoute: buildFullStateRoute,
                        applyDefaultChildStates: applyDefaultChildStates
                    };
                };
                var extend = function extend() {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }
                    return Object.assign.apply(Object, [{}].concat(args));
                };
                var combineArrays = function combineArrays(obj) {
                    var keys = Object.keys(obj);
                    keys.forEach(function (key) {
                        if (!Array.isArray(obj[key])) {
                            throw new Error(key + ' is not an array');
                        }
                    });
                    var maxIndex = keys.reduce(function (maxSoFar, key) {
                        var len = obj[key].length;
                        return maxSoFar > len ? maxSoFar : len;
                    }, 0);
                    var output = [];
                    function getObject(index) {
                        var o = {};
                        keys.forEach(function (key) {
                            o[key] = obj[key][index];
                        });
                        return o;
                    }
                    for (var i = 0; i < maxIndex; ++i) {
                        output.push(getObject(i));
                    }
                    return output;
                };
                var isarray = Array.isArray || function (arr) {
                    return Object.prototype.toString.call(arr) == '[object Array]';
                };
                var pathToRegexpWithReversibleKeys = pathToRegexp;
                var PATH_REGEXP = new RegExp([
                    '(\\\\.)',
                    '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
                    '([.+*?=^!:${}()[\\]|\\/])'
                ].join('|'), 'g');
                function escapeGroup(group) {
                    return group.replace(/([=!:$\/()])/g, '\\$1');
                }
                function attachKeys(re, keys, allTokens) {
                    re.keys = keys;
                    re.allTokens = allTokens;
                    return re;
                }
                function flags(options) {
                    return options.sensitive ? '' : 'i';
                }
                function regexpToRegexp(path, keys, allTokens) {
                    var groups = path.source.match(/\((?!\?)/g);
                    if (groups) {
                        for (var i = 0; i < groups.length; i++) {
                            keys.push({
                                name: i,
                                delimiter: null,
                                optional: false,
                                repeat: false
                            });
                        }
                    }
                    return attachKeys(path, keys, allTokens);
                }
                function arrayToRegexp(path, keys, options, allTokens) {
                    var parts = [];
                    for (var i = 0; i < path.length; i++) {
                        parts.push(pathToRegexp(path[i], keys, options, allTokens).source);
                    }
                    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
                    return attachKeys(regexp, keys, allTokens);
                }
                function replacePath(path, keys, allTokens) {
                    var index = 0;
                    var lastEndIndex = 0;
                    function addLastToken(lastToken) {
                        if (lastEndIndex === 0 && lastToken[0] !== '/') {
                            lastToken = '/' + lastToken;
                        }
                        allTokens.push({
                            string: lastToken
                        });
                    }
                    function replace(match, escaped, prefix, key, capture, group, suffix, escape, offset) {
                        if (escaped) {
                            return escaped;
                        }
                        if (escape) {
                            return '\\' + escape;
                        }
                        var repeat = suffix === '+' || suffix === '*';
                        var optional = suffix === '?' || suffix === '*';
                        if (offset > lastEndIndex) {
                            addLastToken(path.substring(lastEndIndex, offset));
                        }
                        lastEndIndex = offset + match.length;
                        var newKey = {
                            name: key || index++,
                            delimiter: prefix || '/',
                            optional: optional,
                            repeat: repeat
                        };
                        keys.push(newKey);
                        allTokens.push(newKey);
                        prefix = prefix ? '\\' + prefix : '';
                        capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');
                        if (repeat) {
                            capture = capture + '(?:' + prefix + capture + ')*';
                        }
                        if (optional) {
                            return '(?:' + prefix + '(' + capture + '))?';
                        }
                        return prefix + '(' + capture + ')';
                    }
                    var newPath = path.replace(PATH_REGEXP, replace);
                    if (lastEndIndex < path.length) {
                        addLastToken(path.substring(lastEndIndex));
                    }
                    return newPath;
                }
                function pathToRegexp(path, keys, options, allTokens) {
                    keys = keys || [];
                    allTokens = allTokens || [];
                    if (!isarray(keys)) {
                        options = keys;
                        keys = [];
                    }
                    else if (!options) {
                        options = {};
                    }
                    if (path instanceof RegExp) {
                        return regexpToRegexp(path, keys, options, allTokens);
                    }
                    if (isarray(path)) {
                        return arrayToRegexp(path, keys, options, allTokens);
                    }
                    var strict = options.strict;
                    var end = options.end !== false;
                    var route = replacePath(path, keys, allTokens);
                    var endsWithSlash = path.charAt(path.length - 1) === '/';
                    if (!strict) {
                        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
                    }
                    if (end) {
                        route += '$';
                    }
                    else {
                        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
                    }
                    return attachKeys(new RegExp('^' + route, flags(options)), keys, allTokens);
                }
                var stateComparison_1 = function StateComparison(stateState) {
                    var getPathParameters = pathParameters();
                    var parametersChanged = function parametersChanged(args) {
                        return parametersThatMatterWereChanged(extend(args, { stateState: stateState, getPathParameters: getPathParameters }));
                    };
                    return function (args) {
                        return stateComparison(extend(args, { parametersChanged: parametersChanged }));
                    };
                };
                function pathParameters() {
                    var parameters = {};
                    return function (path) {
                        if (!path) {
                            return [];
                        }
                        if (!parameters[path]) {
                            parameters[path] = pathToRegexpWithReversibleKeys(path).keys.map(function (key) {
                                return key.name;
                            });
                        }
                        return parameters[path];
                    };
                }
                function parametersThatMatterWereChanged(_ref) {
                    var stateState = _ref.stateState, getPathParameters = _ref.getPathParameters, stateName = _ref.stateName, fromParameters = _ref.fromParameters, toParameters = _ref.toParameters;
                    var state = stateState.get(stateName);
                    var querystringParameters = state.querystringParameters || [];
                    var parameters = getPathParameters(state.route).concat(querystringParameters);
                    return Array.isArray(parameters) && parameters.some(function (key) {
                        return fromParameters[key] !== toParameters[key];
                    });
                }
                function stateComparison(_ref2) {
                    var parametersChanged = _ref2.parametersChanged, original = _ref2.original, destination = _ref2.destination;
                    var states = combineArrays({
                        start: stateStringParser(original.name),
                        end: stateStringParser(destination.name)
                    });
                    return states.map(function (_ref3) {
                        var start = _ref3.start, end = _ref3.end;
                        return {
                            nameBefore: start,
                            nameAfter: end,
                            stateNameChanged: start !== end,
                            stateParametersChanged: start === end && parametersChanged({
                                stateName: start,
                                fromParameters: original.parameters,
                                toParameters: destination.parameters
                            })
                        };
                    });
                }
                var currentState = function CurrentState() {
                    var current = {
                        name: '',
                        parameters: {}
                    };
                    return {
                        get: function get() {
                            return current;
                        },
                        set: function set(name, parameters) {
                            current = {
                                name: name,
                                parameters: parameters
                            };
                        }
                    };
                };
                var stateChangeLogic = function stateChangeLogic(stateComparisonResults) {
                    var hitChangingState = false;
                    var hitDestroyedState = false;
                    var output = {
                        destroy: [],
                        change: [],
                        create: []
                    };
                    stateComparisonResults.forEach(function (state) {
                        hitChangingState = hitChangingState || state.stateParametersChanged;
                        hitDestroyedState = hitDestroyedState || state.stateNameChanged;
                        if (state.nameBefore) {
                            if (hitDestroyedState) {
                                output.destroy.push(state.nameBefore);
                            }
                            else if (hitChangingState) {
                                output.change.push(state.nameBefore);
                            }
                        }
                        if (state.nameAfter && hitDestroyedState) {
                            output.create.push(state.nameAfter);
                        }
                    });
                    return output;
                };
                var stateTransitionManager = function stateTransitionManager(emitter) {
                    var currentTransitionAttempt = null;
                    var nextTransition = null;
                    function doneTransitioning() {
                        currentTransitionAttempt = null;
                        if (nextTransition) {
                            beginNextTransitionAttempt();
                        }
                    }
                    var isTransitioning = function isTransitioning() {
                        return !!currentTransitionAttempt;
                    };
                    function beginNextTransitionAttempt() {
                        currentTransitionAttempt = nextTransition;
                        nextTransition = null;
                        currentTransitionAttempt.beginStateChange();
                    }
                    function cancelCurrentTransition() {
                        currentTransitionAttempt.transition.cancelled = true;
                        var err = new Error('State transition cancelled by the state transition manager');
                        err.wasCancelledBySomeoneElse = true;
                        emitter.emit('stateChangeCancelled', err);
                    }
                    emitter.on('stateChangeAttempt', function (beginStateChange) {
                        nextTransition = createStateTransitionAttempt(beginStateChange);
                        if (isTransitioning() && currentTransitionAttempt.transition.cancellable) {
                            cancelCurrentTransition();
                        }
                        else if (!isTransitioning()) {
                            beginNextTransitionAttempt();
                        }
                    });
                    emitter.on('stateChangeError', doneTransitioning);
                    emitter.on('stateChangeCancelled', doneTransitioning);
                    emitter.on('stateChangeEnd', doneTransitioning);
                    function createStateTransitionAttempt(_beginStateChange) {
                        var transition = {
                            cancelled: false,
                            cancellable: true
                        };
                        return {
                            transition: transition,
                            beginStateChange: function beginStateChange() {
                                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                    args[_key] = arguments[_key];
                                }
                                return _beginStateChange.apply(undefined, [transition].concat(args));
                            }
                        };
                    }
                };
                var defaultRouterOptions = { reverse: false };
                var promiseMapSeries = function sequence(array, iterator) {
                    var currentPromise = Promise.resolve();
                    return Promise.all(array.map(function (value, i) {
                        return currentPromise = currentPromise.then(function () {
                            return iterator(value, i, array);
                        });
                    }));
                };
                var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                    return typeof obj;
                } : function (obj) {
                    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
                };
                var thenDenodeify = function denodeify(fn) {
                    return function () {
                        var self = this;
                        var args = Array.prototype.slice.call(arguments);
                        return new Promise(function (resolve, reject) {
                            args.push(function (err, res) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(res);
                                }
                            });
                            var res = fn.apply(self, args);
                            var isPromise = res && ((typeof res === 'undefined' ? 'undefined' : _typeof(res)) === 'object' || typeof res === 'function') && typeof res.then === 'function';
                            if (isPromise) {
                                resolve(res);
                            }
                        });
                    };
                };
                var eventemitter3 = createCommonjsModule(function (module) {
                    'use strict';
                    var has = Object.prototype.hasOwnProperty, prefix = '~';
                    function Events() { }
                    if (Object.create) {
                        Events.prototype = Object.create(null);
                        if (!new Events().__proto__)
                            prefix = false;
                    }
                    function EE(fn, context, once) {
                        this.fn = fn;
                        this.context = context;
                        this.once = once || false;
                    }
                    function EventEmitter() {
                        this._events = new Events();
                        this._eventsCount = 0;
                    }
                    EventEmitter.prototype.eventNames = function eventNames() {
                        var names = [], events, name;
                        if (this._eventsCount === 0)
                            return names;
                        for (name in events = this._events) {
                            if (has.call(events, name))
                                names.push(prefix ? name.slice(1) : name);
                        }
                        if (Object.getOwnPropertySymbols) {
                            return names.concat(Object.getOwnPropertySymbols(events));
                        }
                        return names;
                    };
                    EventEmitter.prototype.listeners = function listeners(event, exists) {
                        var evt = prefix ? prefix + event : event, available = this._events[evt];
                        if (exists)
                            return !!available;
                        if (!available)
                            return [];
                        if (available.fn)
                            return [available.fn];
                        for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
                            ee[i] = available[i].fn;
                        }
                        return ee;
                    };
                    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
                        var evt = prefix ? prefix + event : event;
                        if (!this._events[evt])
                            return false;
                        var listeners = this._events[evt], len = arguments.length, args, i;
                        if (listeners.fn) {
                            if (listeners.once)
                                this.removeListener(event, listeners.fn, undefined, true);
                            switch (len) {
                                case 1:
                                    return listeners.fn.call(listeners.context), true;
                                case 2:
                                    return listeners.fn.call(listeners.context, a1), true;
                                case 3:
                                    return listeners.fn.call(listeners.context, a1, a2), true;
                                case 4:
                                    return listeners.fn.call(listeners.context, a1, a2, a3), true;
                                case 5:
                                    return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
                                case 6:
                                    return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
                            }
                            for (i = 1, args = new Array(len - 1); i < len; i++) {
                                args[i - 1] = arguments[i];
                            }
                            listeners.fn.apply(listeners.context, args);
                        }
                        else {
                            var length = listeners.length, j;
                            for (i = 0; i < length; i++) {
                                if (listeners[i].once)
                                    this.removeListener(event, listeners[i].fn, undefined, true);
                                switch (len) {
                                    case 1:
                                        listeners[i].fn.call(listeners[i].context);
                                        break;
                                    case 2:
                                        listeners[i].fn.call(listeners[i].context, a1);
                                        break;
                                    case 3:
                                        listeners[i].fn.call(listeners[i].context, a1, a2);
                                        break;
                                    case 4:
                                        listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                                        break;
                                    default:
                                        if (!args)
                                            for (j = 1, args = new Array(len - 1); j < len; j++) {
                                                args[j - 1] = arguments[j];
                                            }
                                        listeners[i].fn.apply(listeners[i].context, args);
                                }
                            }
                        }
                        return true;
                    };
                    EventEmitter.prototype.on = function on(event, fn, context) {
                        var listener = new EE(fn, context || this), evt = prefix ? prefix + event : event;
                        if (!this._events[evt])
                            this._events[evt] = listener, this._eventsCount++;
                        else if (!this._events[evt].fn)
                            this._events[evt].push(listener);
                        else
                            this._events[evt] = [this._events[evt], listener];
                        return this;
                    };
                    EventEmitter.prototype.once = function once(event, fn, context) {
                        var listener = new EE(fn, context || this, true), evt = prefix ? prefix + event : event;
                        if (!this._events[evt])
                            this._events[evt] = listener, this._eventsCount++;
                        else if (!this._events[evt].fn)
                            this._events[evt].push(listener);
                        else
                            this._events[evt] = [this._events[evt], listener];
                        return this;
                    };
                    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
                        var evt = prefix ? prefix + event : event;
                        if (!this._events[evt])
                            return this;
                        if (!fn) {
                            if (--this._eventsCount === 0)
                                this._events = new Events();
                            else
                                delete this._events[evt];
                            return this;
                        }
                        var listeners = this._events[evt];
                        if (listeners.fn) {
                            if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
                                if (--this._eventsCount === 0)
                                    this._events = new Events();
                                else
                                    delete this._events[evt];
                            }
                        }
                        else {
                            for (var i = 0, events = [], length = listeners.length; i < length; i++) {
                                if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
                                    events.push(listeners[i]);
                                }
                            }
                            if (events.length)
                                this._events[evt] = events.length === 1 ? events[0] : events;
                            else if (--this._eventsCount === 0)
                                this._events = new Events();
                            else
                                delete this._events[evt];
                        }
                        return this;
                    };
                    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
                        var evt;
                        if (event) {
                            evt = prefix ? prefix + event : event;
                            if (this._events[evt]) {
                                if (--this._eventsCount === 0)
                                    this._events = new Events();
                                else
                                    delete this._events[evt];
                            }
                        }
                        else {
                            this._events = new Events();
                            this._eventsCount = 0;
                        }
                        return this;
                    };
                    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
                    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
                    EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
                        return this;
                    };
                    EventEmitter.prefixed = prefix;
                    EventEmitter.EventEmitter = EventEmitter;
                    {
                        module.exports = EventEmitter;
                    }
                });
                'use strict';
                var strictUriEncode = function strictUriEncode(str) {
                    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
                        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
                    });
                };
                'use strict';
                var getOwnPropertySymbols = Object.getOwnPropertySymbols;
                var hasOwnProperty = Object.prototype.hasOwnProperty;
                var propIsEnumerable = Object.prototype.propertyIsEnumerable;
                function toObject(val) {
                    if (val === null || val === undefined) {
                        throw new TypeError('Object.assign cannot be called with null or undefined');
                    }
                    return Object(val);
                }
                function shouldUseNative() {
                    try {
                        if (!Object.assign) {
                            return false;
                        }
                        var test1 = new String('abc');
                        test1[5] = 'de';
                        if (Object.getOwnPropertyNames(test1)[0] === '5') {
                            return false;
                        }
                        var test2 = {};
                        for (var i = 0; i < 10; i++) {
                            test2['_' + String.fromCharCode(i)] = i;
                        }
                        var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
                            return test2[n];
                        });
                        if (order2.join('') !== '0123456789') {
                            return false;
                        }
                        var test3 = {};
                        'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
                            test3[letter] = letter;
                        });
                        if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
                            return false;
                        }
                        return true;
                    }
                    catch (err) {
                        return false;
                    }
                }
                var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
                    var from;
                    var to = toObject(target);
                    var symbols;
                    for (var s = 1; s < arguments.length; s++) {
                        from = Object(arguments[s]);
                        for (var key in from) {
                            if (hasOwnProperty.call(from, key)) {
                                to[key] = from[key];
                            }
                        }
                        if (getOwnPropertySymbols) {
                            symbols = getOwnPropertySymbols(from);
                            for (var i = 0; i < symbols.length; i++) {
                                if (propIsEnumerable.call(from, symbols[i])) {
                                    to[symbols[i]] = from[symbols[i]];
                                }
                            }
                        }
                    }
                    return to;
                };
                'use strict';
                function encoderForArrayFormat(opts) {
                    switch (opts.arrayFormat) {
                        case 'index':
                            return function (key, value, index) {
                                return value === null ? [encode(key, opts), '[', index, ']'].join('') : [encode(key, opts), '[', encode(index, opts), ']=', encode(value, opts)].join('');
                            };
                        case 'bracket':
                            return function (key, value) {
                                return value === null ? encode(key, opts) : [encode(key, opts), '[]=', encode(value, opts)].join('');
                            };
                        default:
                            return function (key, value) {
                                return value === null ? encode(key, opts) : [encode(key, opts), '=', encode(value, opts)].join('');
                            };
                    }
                }
                function parserForArrayFormat(opts) {
                    var result;
                    switch (opts.arrayFormat) {
                        case 'index':
                            return function (key, value, accumulator) {
                                result = /\[(\d*)\]$/.exec(key);
                                key = key.replace(/\[\d*\]$/, '');
                                if (!result) {
                                    accumulator[key] = value;
                                    return;
                                }
                                if (accumulator[key] === undefined) {
                                    accumulator[key] = {};
                                }
                                accumulator[key][result[1]] = value;
                            };
                        case 'bracket':
                            return function (key, value, accumulator) {
                                result = /(\[\])$/.exec(key);
                                key = key.replace(/\[\]$/, '');
                                if (!result) {
                                    accumulator[key] = value;
                                    return;
                                }
                                else if (accumulator[key] === undefined) {
                                    accumulator[key] = [value];
                                    return;
                                }
                                accumulator[key] = [].concat(accumulator[key], value);
                            };
                        default:
                            return function (key, value, accumulator) {
                                if (accumulator[key] === undefined) {
                                    accumulator[key] = value;
                                    return;
                                }
                                accumulator[key] = [].concat(accumulator[key], value);
                            };
                    }
                }
                function encode(value, opts) {
                    if (opts.encode) {
                        return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
                    }
                    return value;
                }
                function keysSorter(input) {
                    if (Array.isArray(input)) {
                        return input.sort();
                    }
                    else if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object') {
                        return keysSorter(Object.keys(input)).sort(function (a, b) {
                            return Number(a) - Number(b);
                        }).map(function (key) {
                            return input[key];
                        });
                    }
                    return input;
                }
                var extract = function extract(str) {
                    return str.split('?')[1] || '';
                };
                var parse = function parse(str, opts) {
                    opts = objectAssign({ arrayFormat: 'none' }, opts);
                    var formatter = parserForArrayFormat(opts);
                    var ret = Object.create(null);
                    if (typeof str !== 'string') {
                        return ret;
                    }
                    str = str.trim().replace(/^(\?|#|&)/, '');
                    if (!str) {
                        return ret;
                    }
                    str.split('&').forEach(function (param) {
                        var parts = param.replace(/\+/g, ' ').split('=');
                        var key = parts.shift();
                        var val = parts.length > 0 ? parts.join('=') : undefined;
                        val = val === undefined ? null : decodeURIComponent(val);
                        formatter(decodeURIComponent(key), val, ret);
                    });
                    return Object.keys(ret).sort().reduce(function (result, key) {
                        var val = ret[key];
                        if (Boolean(val) && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !Array.isArray(val)) {
                            result[key] = keysSorter(val);
                        }
                        else {
                            result[key] = val;
                        }
                        return result;
                    }, Object.create(null));
                };
                var stringify = function stringify(obj, opts) {
                    var defaults$$1 = {
                        encode: true,
                        strict: true,
                        arrayFormat: 'none'
                    };
                    opts = objectAssign(defaults$$1, opts);
                    var formatter = encoderForArrayFormat(opts);
                    return obj ? Object.keys(obj).sort().map(function (key) {
                        var val = obj[key];
                        if (val === undefined) {
                            return '';
                        }
                        if (val === null) {
                            return encode(key, opts);
                        }
                        if (Array.isArray(val)) {
                            var result = [];
                            val.slice().forEach(function (val2) {
                                if (val2 === undefined) {
                                    return;
                                }
                                result.push(formatter(key, val2, result.length));
                            });
                            return result.join('&');
                        }
                        return encode(key, opts) + '=' + encode(val, opts);
                    }).filter(function (x) {
                        return x.length > 0;
                    }).join('&') : '';
                };
                var queryString = {
                    extract: extract,
                    parse: parse,
                    stringify: stringify
                };
                var immutable = extend$3;
                var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
                function extend$3() {
                    var target = {};
                    for (var i = 0; i < arguments.length; i++) {
                        var source = arguments[i];
                        for (var key in source) {
                            if (hasOwnProperty$1.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                    return target;
                }
                var hashLocation = function HashLocation(window) {
                    var emitter = new eventemitter3();
                    var last = '';
                    var needToDecode = getNeedToDecode();
                    window.addEventListener('hashchange', function () {
                        if (last !== emitter.get()) {
                            last = emitter.get();
                            emitter.emit('hashchange');
                        }
                    });
                    function ifRouteIsDifferent(actualNavigateFunction) {
                        return function navigate(newPath) {
                            if (newPath !== last) {
                                actualNavigateFunction(window, newPath);
                            }
                        };
                    }
                    emitter.go = ifRouteIsDifferent(go);
                    emitter.replace = ifRouteIsDifferent(replace);
                    emitter.get = get$1.bind(null, window, needToDecode);
                    return emitter;
                };
                function replace(window, newPath) {
                    window.location.replace(everythingBeforeTheSlash(window.location.href) + '#' + newPath);
                }
                function everythingBeforeTheSlash(url) {
                    var hashIndex = url.indexOf('#');
                    return hashIndex === -1 ? url : url.substring(0, hashIndex);
                }
                function go(window, newPath) {
                    window.location.hash = newPath;
                }
                function get$1(window, needToDecode) {
                    var hash = removeHashFromPath(window.location.hash);
                    return needToDecode ? decodeURI(hash) : hash;
                }
                function removeHashFromPath(path) {
                    return path && path[0] === '#' ? path.substr(1) : path;
                }
                function getNeedToDecode() {
                    var a = document.createElement('a');
                    a.href = '#x x';
                    return !/x x/.test(a.hash);
                }
                var hashBrownRouter = function Router(opts, hashLocation$$1) {
                    var emitter = new eventemitter3();
                    if (isHashLocation(opts)) {
                        hashLocation$$1 = opts;
                        opts = null;
                    }
                    opts = opts || {};
                    if (!hashLocation$$1) {
                        hashLocation$$1 = hashLocation(window);
                    }
                    function onNotFound(path, queryStringParameters) {
                        emitter.emit('not found', path, queryStringParameters);
                    }
                    var routes = [];
                    var onHashChange = evaluateCurrentPath.bind(null, routes, hashLocation$$1, !!opts.reverse, onNotFound);
                    hashLocation$$1.on('hashchange', onHashChange);
                    function stop() {
                        hashLocation$$1.removeListener('hashchange', onHashChange);
                    }
                    emitter.add = add.bind(null, routes);
                    emitter.stop = stop;
                    emitter.evaluateCurrent = evaluateCurrentPathOrGoToDefault.bind(null, routes, hashLocation$$1, !!opts.reverse, onNotFound);
                    emitter.replace = hashLocation$$1.replace;
                    emitter.go = hashLocation$$1.go;
                    emitter.location = hashLocation$$1;
                    return emitter;
                };
                function evaluateCurrentPath(routes, hashLocation$$1, reverse, onNotFound) {
                    evaluatePath(routes, stripHashFragment(hashLocation$$1.get()), reverse, onNotFound);
                }
                function getPathParts(path) {
                    var chunks = path.split('?');
                    return {
                        path: chunks.shift(),
                        queryString: queryString.parse(chunks.join(''))
                    };
                }
                function evaluatePath(routes, path, reverse, onNotFound) {
                    var pathParts = getPathParts(path);
                    path = pathParts.path;
                    var queryStringParameters = pathParts.queryString;
                    var matchingRoute = find(reverse ? reverseArray(routes) : routes, path);
                    if (matchingRoute) {
                        var regexResult = matchingRoute.exec(path);
                        var routeParameters = makeParametersObjectFromRegexResult(matchingRoute.keys, regexResult);
                        var params = immutable(queryStringParameters, routeParameters);
                        matchingRoute.fn(params);
                    }
                    else {
                        onNotFound(path, queryStringParameters);
                    }
                }
                function reverseArray(ary) {
                    return ary.slice().reverse();
                }
                function makeParametersObjectFromRegexResult(keys, regexResult) {
                    return keys.reduce(function (memo, urlKey, index) {
                        memo[urlKey.name] = regexResult[index + 1];
                        return memo;
                    }, {});
                }
                function add(routes, routeString, routeFunction) {
                    if (typeof routeFunction !== 'function') {
                        throw new Error('The router add function must be passed a callback function');
                    }
                    var newRoute = pathToRegexpWithReversibleKeys(routeString);
                    newRoute.fn = routeFunction;
                    routes.push(newRoute);
                }
                function evaluateCurrentPathOrGoToDefault(routes, hashLocation$$1, reverse, onNotFound, defaultPath) {
                    var currentLocation = stripHashFragment(hashLocation$$1.get());
                    var canUseCurrentLocation = currentLocation && (currentLocation !== '/' || defaultPath === '/');
                    if (canUseCurrentLocation) {
                        var routesCopy = routes.slice();
                        evaluateCurrentPath(routesCopy, hashLocation$$1, reverse, onNotFound);
                    }
                    else {
                        hashLocation$$1.go(defaultPath);
                    }
                }
                var urlWithoutHashFragmentRegex = /^([^#]*)(:?#.*)?$/;
                function stripHashFragment(url) {
                    var match = url.match(urlWithoutHashFragmentRegex);
                    return match ? match[1] : '';
                }
                function isHashLocation(hashLocation$$1) {
                    return hashLocation$$1 && hashLocation$$1.go && hashLocation$$1.replace && hashLocation$$1.on;
                }
                function find(aryOfRegexes, str) {
                    for (var i = 0; i < aryOfRegexes.length; ++i) {
                        if (str.match(aryOfRegexes[i])) {
                            return aryOfRegexes[i];
                        }
                    }
                }
                var pathParser = function pathParser(pathString) {
                    var parseResults = pathToRegexpWithReversibleKeys(pathString);
                    return {
                        regex: parseResults,
                        allTokens: parseResults.allTokens
                    };
                };
                var stringifyQuerystring = queryString.stringify;
                var pagePathBuilder = function pagePathBuilder(pathStr, parameters) {
                    var parsed = typeof pathStr === 'string' ? pathParser(pathStr) : pathStr;
                    var allTokens = parsed.allTokens;
                    var regex = parsed.regex;
                    if (parameters) {
                        var path = allTokens.map(function (bit) {
                            if (bit.string) {
                                return bit.string;
                            }
                            var defined = typeof parameters[bit.name] !== 'undefined';
                            if (!bit.optional && !defined) {
                                throw new Error('Must supply argument ' + bit.name + ' for path ' + pathStr);
                            }
                            return defined ? bit.delimiter + encodeURIComponent(parameters[bit.name]) : '';
                        }).join('');
                        if (!regex.test(path)) {
                            throw new Error('Provided arguments do not match the original arguments');
                        }
                        return buildPathWithQuerystring(path, parameters, allTokens);
                    }
                    else {
                        return parsed;
                    }
                };
                function buildPathWithQuerystring(path, parameters, tokenArray) {
                    var parametersInQuerystring = getParametersWithoutMatchingToken(parameters, tokenArray);
                    if (Object.keys(parametersInQuerystring).length === 0) {
                        return path;
                    }
                    return path + '?' + stringifyQuerystring(parametersInQuerystring);
                }
                function getParametersWithoutMatchingToken(parameters, tokenArray) {
                    var tokenHash = tokenArray.reduce(function (memo, bit) {
                        if (!bit.string) {
                            memo[bit.name] = bit;
                        }
                        return memo;
                    }, {});
                    return Object.keys(parameters).filter(function (param) {
                        return !tokenHash[param];
                    }).reduce(function (newParameters, param) {
                        newParameters[param] = parameters[param];
                        return newParameters;
                    }, {});
                }
                var browser = function browser(fn) {
                    typeof setImmediate === 'function' ? setImmediate(fn) : setTimeout(fn, 0);
                };
                var getProperty = function getProperty(name) {
                    return function (obj) {
                        return obj[name];
                    };
                };
                var reverse = function reverse(ary) {
                    return ary.slice().reverse();
                };
                var isFunction = function isFunction(property) {
                    return function (obj) {
                        return typeof obj[property] === 'function';
                    };
                };
                var isThenable = function isThenable(object) {
                    return object && ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' || typeof object === 'function') && typeof object.then === 'function';
                };
                var promiseMe = function promiseMe(fn) {
                    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = arguments[_key];
                    }
                    return new Promise(function (resolve) {
                        return resolve(fn.apply(undefined, args));
                    });
                };
                var expectedPropertiesOfAddState = ['name', 'route', 'defaultChild', 'data', 'template', 'resolve', 'activate', 'querystringParameters', 'defaultQuerystringParameters', 'defaultParameters'];
                var abstractStateRouter6_1_0 = function StateProvider(makeRenderer, rootElement) {
                    var stateRouterOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                    var prototypalStateHolder = stateState();
                    var lastCompletelyLoadedState = currentState();
                    var lastStateStartedActivating = currentState();
                    var stateProviderEmitter = new eventemitter3();
                    var compareStartAndEndStates = stateComparison_1(prototypalStateHolder);
                    var stateNameToArrayofStates = function stateNameToArrayofStates(stateName) {
                        return stateStringParser(stateName).map(prototypalStateHolder.get);
                    };
                    stateTransitionManager(stateProviderEmitter);
                    var _extend = extend({
                        throwOnError: true,
                        pathPrefix: '#'
                    }, stateRouterOptions), throwOnError = _extend.throwOnError, pathPrefix = _extend.pathPrefix;
                    var router = stateRouterOptions.router || hashBrownRouter(defaultRouterOptions);
                    router.on('not found', function (route, parameters) {
                        stateProviderEmitter.emit('routeNotFound', route, parameters);
                    });
                    var destroyDom = null;
                    var getDomChild = null;
                    var renderDom = null;
                    var resetDom = null;
                    var activeStateResolveContent = {};
                    var activeDomApis = {};
                    var activeEmitters = {};
                    function handleError(event, err) {
                        browser(function () {
                            stateProviderEmitter.emit(event, err);
                            console.error(event + ' - ' + err.message);
                            if (throwOnError) {
                                throw err;
                            }
                        });
                    }
                    function destroyStateName(stateName) {
                        var state = prototypalStateHolder.get(stateName);
                        stateProviderEmitter.emit('beforeDestroyState', {
                            state: state,
                            domApi: activeDomApis[stateName]
                        });
                        activeEmitters[stateName].emit('destroy');
                        activeEmitters[stateName].removeAllListeners();
                        delete activeEmitters[stateName];
                        delete activeStateResolveContent[stateName];
                        return destroyDom(activeDomApis[stateName]).then(function () {
                            delete activeDomApis[stateName];
                            stateProviderEmitter.emit('afterDestroyState', {
                                state: state
                            });
                        });
                    }
                    function resetStateName(parameters, stateName) {
                        var domApi = activeDomApis[stateName];
                        var content = getContentObject(activeStateResolveContent, stateName);
                        var state = prototypalStateHolder.get(stateName);
                        stateProviderEmitter.emit('beforeResetState', {
                            domApi: domApi,
                            content: content,
                            state: state,
                            parameters: parameters
                        });
                        activeEmitters[stateName].emit('destroy');
                        delete activeEmitters[stateName];
                        return resetDom({
                            domApi: domApi,
                            content: content,
                            template: state.template,
                            parameters: parameters
                        }).then(function (newDomApi) {
                            if (newDomApi) {
                                activeDomApis[stateName] = newDomApi;
                            }
                            stateProviderEmitter.emit('afterResetState', {
                                domApi: activeDomApis[stateName],
                                content: content,
                                state: state,
                                parameters: parameters
                            });
                        });
                    }
                    function getChildElementForStateName(stateName) {
                        return new Promise(function (resolve) {
                            var parent = prototypalStateHolder.getParent(stateName);
                            if (parent) {
                                var parentDomApi = activeDomApis[parent.name];
                                resolve(getDomChild(parentDomApi));
                            }
                            else {
                                resolve(rootElement);
                            }
                        });
                    }
                    function renderStateName(parameters, stateName) {
                        return getChildElementForStateName(stateName).then(function (element) {
                            var state = prototypalStateHolder.get(stateName);
                            var content = getContentObject(activeStateResolveContent, stateName);
                            stateProviderEmitter.emit('beforeCreateState', {
                                state: state,
                                content: content,
                                parameters: parameters
                            });
                            return renderDom({
                                template: state.template,
                                element: element,
                                content: content,
                                parameters: parameters
                            }).then(function (domApi) {
                                activeDomApis[stateName] = domApi;
                                stateProviderEmitter.emit('afterCreateState', {
                                    state: state,
                                    domApi: domApi,
                                    content: content,
                                    parameters: parameters
                                });
                                return domApi;
                            });
                        });
                    }
                    function renderAll(stateNames, parameters) {
                        return promiseMapSeries(stateNames, function (stateName) {
                            return renderStateName(parameters, stateName);
                        });
                    }
                    function onRouteChange(state, parameters) {
                        try {
                            var finalDestinationStateName = prototypalStateHolder.applyDefaultChildStates(state.name);
                            if (finalDestinationStateName === state.name) {
                                emitEventAndAttemptStateChange(finalDestinationStateName, parameters);
                            }
                            else {
                                var theRouteWeNeedToEndUpAt = makePath(finalDestinationStateName, parameters);
                                var currentRoute = router.location.get();
                                if (theRouteWeNeedToEndUpAt === currentRoute) {
                                    emitEventAndAttemptStateChange(finalDestinationStateName, parameters);
                                }
                                else {
                                    stateProviderEmitter.go(finalDestinationStateName, parameters, { replace: true });
                                }
                            }
                        }
                        catch (err) {
                            handleError('stateError', err);
                        }
                    }
                    function addState(state) {
                        if (typeof state === 'undefined') {
                            throw new Error('Expected \'state\' to be passed in.');
                        }
                        else if (typeof state.name === 'undefined') {
                            throw new Error('Expected the \'name\' option to be passed in.');
                        }
                        else if (typeof state.template === 'undefined') {
                            throw new Error('Expected the \'template\' option to be passed in.');
                        }
                        Object.keys(state).filter(function (key) {
                            return expectedPropertiesOfAddState.indexOf(key) === -1;
                        }).forEach(function (key) {
                            console.warn('Unexpected property passed to addState:', key);
                        });
                        prototypalStateHolder.add(state.name, state);
                        var route = prototypalStateHolder.buildFullStateRoute(state.name);
                        router.add(route, function (parameters) {
                            return onRouteChange(state, parameters);
                        });
                    }
                    function getStatesToResolve(stateChanges) {
                        return stateChanges.change.concat(stateChanges.create).map(prototypalStateHolder.get);
                    }
                    function emitEventAndAttemptStateChange(newStateName, parameters) {
                        stateProviderEmitter.emit('stateChangeAttempt', function stateGo(transition) {
                            attemptStateChange(newStateName, parameters, transition);
                        });
                    }
                    function attemptStateChange(newStateName, parameters, transition) {
                        function ifNotCancelled(fn) {
                            return function () {
                                if (transition.cancelled) {
                                    var err = new Error('The transition to ' + newStateName + ' was cancelled');
                                    err.wasCancelledBySomeoneElse = true;
                                    throw err;
                                }
                                else {
                                    return fn.apply(undefined, arguments);
                                }
                            };
                        }
                        return promiseMe(prototypalStateHolder.guaranteeAllStatesExist, newStateName).then(function applyDefaultParameters() {
                            var state = prototypalStateHolder.get(newStateName);
                            var defaultParams = state.defaultParameters || state.defaultQuerystringParameters || {};
                            var needToApplyDefaults = Object.keys(defaultParams).some(function missingParameterValue(param) {
                                return typeof parameters[param] === 'undefined';
                            });
                            if (needToApplyDefaults) {
                                throw redirector(newStateName, extend(defaultParams, parameters));
                            }
                            return state;
                        }).then(ifNotCancelled(function (state) {
                            stateProviderEmitter.emit('stateChangeStart', state, parameters, stateNameToArrayofStates(state.name));
                            lastStateStartedActivating.set(state.name, parameters);
                        })).then(function getStateChanges() {
                            var stateComparisonResults = compareStartAndEndStates({
                                original: lastCompletelyLoadedState.get(),
                                destination: {
                                    name: newStateName,
                                    parameters: parameters
                                }
                            });
                            return stateChangeLogic(stateComparisonResults);
                        }).then(ifNotCancelled(function resolveDestroyAndActivateStates(stateChanges) {
                            return resolveStates(getStatesToResolve(stateChanges), extend(parameters)).catch(function onResolveError(e) {
                                e.stateChangeError = true;
                                throw e;
                            }).then(ifNotCancelled(function destroyAndActivate(stateResolveResultsObject) {
                                transition.cancellable = false;
                                var activateAll = function activateAll() {
                                    return activateStates(stateChanges.change.concat(stateChanges.create));
                                };
                                activeStateResolveContent = extend(activeStateResolveContent, stateResolveResultsObject);
                                return promiseMapSeries(reverse(stateChanges.destroy), destroyStateName).then(function () {
                                    return promiseMapSeries(reverse(stateChanges.change), function (stateName) {
                                        return resetStateName(extend(parameters), stateName);
                                    });
                                }).then(function () {
                                    return renderAll(stateChanges.create, extend(parameters)).then(activateAll);
                                });
                            }));
                            function activateStates(stateNames) {
                                return stateNames.map(prototypalStateHolder.get).forEach(function (state) {
                                    var emitter = new eventemitter3();
                                    var context = Object.create(emitter);
                                    context.domApi = activeDomApis[state.name];
                                    context.data = state.data;
                                    context.parameters = parameters;
                                    context.content = getContentObject(activeStateResolveContent, state.name);
                                    activeEmitters[state.name] = emitter;
                                    try {
                                        state.activate && state.activate(context);
                                    }
                                    catch (e) {
                                        browser(function () {
                                            throw e;
                                        });
                                    }
                                });
                            }
                        })).then(function stateChangeComplete() {
                            lastCompletelyLoadedState.set(newStateName, parameters);
                            try {
                                stateProviderEmitter.emit('stateChangeEnd', prototypalStateHolder.get(newStateName), parameters, stateNameToArrayofStates(newStateName));
                            }
                            catch (e) {
                                handleError('stateError', e);
                            }
                        }).catch(ifNotCancelled(function handleStateChangeError(err) {
                            if (err && err.redirectTo) {
                                stateProviderEmitter.emit('stateChangeCancelled', err);
                                return stateProviderEmitter.go(err.redirectTo.name, err.redirectTo.params, { replace: true });
                            }
                            else if (err) {
                                handleError('stateChangeError', err);
                            }
                        })).catch(function handleCancellation(err) {
                            if (err && err.wasCancelledBySomeoneElse) {
                            }
                            else {
                                throw new Error('This probably shouldn\'t happen, maybe file an issue or something ' + err);
                            }
                        });
                    }
                    function makePath(stateName, parameters, options) {
                        function getGuaranteedPreviousState() {
                            if (!lastStateStartedActivating.get().name) {
                                throw new Error('makePath required a previous state to exist, and none was found');
                            }
                            return lastStateStartedActivating.get();
                        }
                        if (options && options.inherit) {
                            parameters = extend(getGuaranteedPreviousState().parameters, parameters);
                        }
                        var destinationStateName = stateName === null ? getGuaranteedPreviousState().name : stateName;
                        var destinationState = prototypalStateHolder.get(destinationStateName) || {};
                        var defaultParams = destinationState.defaultParameters || destinationState.defaultQuerystringParameters;
                        parameters = extend(defaultParams, parameters);
                        prototypalStateHolder.guaranteeAllStatesExist(destinationStateName);
                        var route = prototypalStateHolder.buildFullStateRoute(destinationStateName);
                        return pagePathBuilder(route, parameters || {});
                    }
                    var defaultOptions = {
                        replace: false
                    };
                    stateProviderEmitter.addState = addState;
                    stateProviderEmitter.go = function (newStateName, parameters, options) {
                        options = extend(defaultOptions, options);
                        var goFunction = options.replace ? router.replace : router.go;
                        return promiseMe(makePath, newStateName, parameters, options).then(goFunction, function (err) {
                            return handleError('stateChangeError', err);
                        });
                    };
                    stateProviderEmitter.evaluateCurrentRoute = function (defaultState, defaultParams) {
                        return promiseMe(makePath, defaultState, defaultParams).then(function (defaultPath) {
                            router.evaluateCurrent(defaultPath);
                        }).catch(function (err) {
                            return handleError('stateError', err);
                        });
                    };
                    stateProviderEmitter.makePath = function (stateName, parameters, options) {
                        return pathPrefix + makePath(stateName, parameters, options);
                    };
                    stateProviderEmitter.getActiveState = function () {
                        return lastCompletelyLoadedState.get();
                    };
                    stateProviderEmitter.stateIsActive = function (stateName) {
                        var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
                        var currentState$$1 = lastCompletelyLoadedState.get();
                        var stateNameMatches = currentState$$1.name === stateName || currentState$$1.name.indexOf(stateName + '.') === 0;
                        var parametersWereNotPassedIn = !parameters;
                        return stateNameMatches && (parametersWereNotPassedIn || Object.keys(parameters).every(function (key) {
                            return parameters[key] === currentState$$1.parameters[key];
                        }));
                    };
                    var renderer = makeRenderer(stateProviderEmitter);
                    destroyDom = thenDenodeify(renderer.destroy);
                    getDomChild = thenDenodeify(renderer.getChildElement);
                    renderDom = thenDenodeify(renderer.render);
                    resetDom = thenDenodeify(renderer.reset);
                    return stateProviderEmitter;
                };
                function getContentObject(stateResolveResultsObject, stateName) {
                    var allPossibleResolvedStateNames = stateStringParser(stateName);
                    return allPossibleResolvedStateNames.filter(function (stateName) {
                        return stateResolveResultsObject[stateName];
                    }).reduce(function (obj, stateName) {
                        return extend(obj, stateResolveResultsObject[stateName]);
                    }, {});
                }
                function redirector(newStateName, parameters) {
                    return {
                        redirectTo: {
                            name: newStateName,
                            params: parameters
                        }
                    };
                }
                function resolveStates(states, parameters) {
                    var statesWithResolveFunctions = states.filter(isFunction('resolve'));
                    var stateNamesWithResolveFunctions = statesWithResolveFunctions.map(getProperty('name'));
                    var resolves = Promise.all(statesWithResolveFunctions.map(function (state) {
                        return new Promise(function (resolve, reject) {
                            var resolveCb = function resolveCb(err, content) {
                                return err ? reject(err) : resolve(content);
                            };
                            resolveCb.redirect = function (newStateName, parameters) {
                                reject(redirector(newStateName, parameters));
                            };
                            var res = state.resolve(state.data, parameters, resolveCb);
                            if (isThenable(res)) {
                                resolve(res);
                            }
                        });
                    }));
                    return resolves.then(function (resolveResults) {
                        return combineArrays({
                            stateName: stateNamesWithResolveFunctions,
                            resolveResult: resolveResults
                        }).reduce(function (obj, result) {
                            obj[result.stateName] = result.resolveResult;
                            return obj;
                        }, {});
                    });
                }
                return abstractStateRouter6_1_0;
            }()));
        }
    };
});
System.register("router/binding", [".config/deps/asr"], function (exports_19, context_19) {
    "use strict";
    var asr_js_1;
    var __moduleName = context_19 && context_19.id;
    function makeStateRouter(options = {}) {
        const rootElement = options.rootElement || document.getElementById('router-outlet');
        if (!rootElement)
            throw new Error(`options.rootElement was not supplied, and an element with id 'router-outlet' was not found.`);
        const historyRouting = false;
        const stateRouterOptions = {
            pathPrefix: historyRouting ? '' : '#',
            router: historyRouting ? '' : undefined,
            throwOnError: options.throwOnError || true,
        };
        const stateRouter = asr_js_1.default(makeRenderer, rootElement, stateRouterOptions);
        function addState(state) {
            stateRouter.addState({
                name: state.name,
                route: state.route,
                defaultParameters: state.defaultParams,
                template: state.template,
                resolve(_, params, cb) {
                    const actions = {
                        redirect(state, params) {
                            cb.redirect(state, params);
                        },
                        error(code, message) {
                            cb.redirect(`$$error`, { code, message });
                        },
                    };
                    if (state.resolve)
                        state.resolve(params, actions);
                },
            });
        }
        function go(state, params = {}, options = {}) {
            stateRouter.go(state, params, options);
        }
        function evaluateCurrentRoute(fallbackStateName, fallbackStateParams = {}) {
            stateRouter.evaluateCurrentRoute(fallbackStateName, fallbackStateParams);
        }
        function stateIsActive(stateName, stateParams = {}) {
            return stateRouter.stateIsActive(stateName || stateRouter.getActiveState()?.name, stateParams);
        }
        function makePath(stateName, stateParams = {}) {
            return stateRouter.makePath(stateName || stateRouter.getActiveState()?.name, stateParams);
        }
        function getActiveState() {
            return stateRouter.getActiveState();
        }
        stateRouter.on('StateChangeAttempt', (...args) => {
            if (options.onStateChangeAttempt)
                options.onStateChangeAttempt(...args);
        });
        stateRouter.on('StateChangeStart', (...args) => {
            if (options.onStateChangeStart)
                options.onStateChangeStart(...args);
        });
        stateRouter.on('StateChangeCancelled', (...args) => {
            if (options.onStateChangeCancelled)
                options.onStateChangeCancelled(...args);
        });
        stateRouter.on('StateChangeEnd', (...args) => {
            if (options.onStateChangeEnd)
                options.onStateChangeEnd(...args);
        });
        stateRouter.on('StateChangeError', (...args) => {
            if (options.onStateChangeError)
                options.onStateChangeError(...args);
        });
        stateRouter.on('StateError', (...args) => {
            if (options.onStateError)
                options.onStateError(...args);
        });
        stateRouter.on('RouteNotFound', (...args) => {
            if (options.onRouteNotFound)
                options.onRouteNotFound(...args);
        });
        return { addState, go, evaluateCurrentRoute, stateIsActive, makePath, getActiveState };
    }
    exports_19("makeStateRouter", makeStateRouter);
    function makeRenderer(stateRouter) {
        return {
            render: function render(context) {
                const rendered = context.template(context.content);
                context.element.appendChild(rendered);
                return rendered;
            },
            reset: function reset(context) {
                if (context.domApi.setParams)
                    context.domApi.setParams(context.content);
            },
            destroy: function destroy(renderedTemplateApi) {
                renderedTemplateApi.raw.remove();
            },
            getChildElement: function getChildElement(coreElement) {
                const res = coreElement.raw.querySelector('#router-outlet');
                if (!res)
                    throw new Error(`Every time a child route is navigated to, there must be an element with the 'route-outlet' id on it.`);
                return res;
            },
        };
    }
    return {
        setters: [
            function (asr_js_1_1) {
                asr_js_1 = asr_js_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("router/router-store", [], function (exports_20, context_20) {
    "use strict";
    var router;
    var __moduleName = context_20 && context_20.id;
    function setRouter(stateRouter) {
        router = stateRouter;
    }
    exports_20("setRouter", setRouter);
    function getRouter() {
        return procure();
    }
    exports_20("getRouter", getRouter);
    function addState(state) {
        procure().addState(state);
    }
    exports_20("addState", addState);
    function go(state, params = {}, options = {}) {
        procure().go(state, params, options);
    }
    exports_20("go", go);
    function evaluateCurrentRoute(fallbackStateName, fallbackStateParams = {}) {
        procure().evaluateCurrentRoute(fallbackStateName, fallbackStateParams);
    }
    exports_20("evaluateCurrentRoute", evaluateCurrentRoute);
    function stateIsActive(stateName, stateParams = {}) {
        return procure().stateIsActive(stateName, stateParams);
    }
    exports_20("stateIsActive", stateIsActive);
    function makePath(stateName, stateParams = {}) {
        return procure().makePath(stateName, stateParams);
    }
    exports_20("makePath", makePath);
    function getActiveState() {
        return procure().getActiveState();
    }
    exports_20("getActiveState", getActiveState);
    function procure() {
        if (!router)
            throw new Error(`The state router has not been set.  Did you forget to call 'setRouter' first?`);
        return router;
    }
    return {
        setters: [],
        execute: function () {
            router = null;
        }
    };
});
System.register("router/mod", ["router/binding", "router/router-store"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    function exportStar_3(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_21(exports);
    }
    return {
        setters: [
            function (binding_ts_1_1) {
                exportStar_3(binding_ts_1_1);
            },
            function (router_store_ts_1_1) {
                exportStar_3(router_store_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("theme", ["mod"], function (exports_22, context_22) {
    "use strict";
    var mod_ts_11, defaultTheme;
    var __moduleName = context_22 && context_22.id;
    function setTheme(element, theme) {
        mod_ts_11.setContext(element, 'theme', theme);
        return element;
    }
    exports_22("setTheme", setTheme);
    function getTheme(element) {
        const theme = {
            background1: mod_ts_11.observable(''),
            background2: mod_ts_11.observable(''),
            background3: mod_ts_11.observable(''),
            background4: mod_ts_11.observable(''),
            background5: mod_ts_11.observable(''),
            background6: mod_ts_11.observable(''),
            foreground1: mod_ts_11.observable(''),
            foreground2: mod_ts_11.observable(''),
            foreground3: mod_ts_11.observable(''),
            foreground4: mod_ts_11.observable(''),
            foreground5: mod_ts_11.observable(''),
            foreground6: mod_ts_11.observable(''),
            action1: mod_ts_11.observable(''),
            action2: mod_ts_11.observable(''),
            action3: mod_ts_11.observable(''),
            danger: mod_ts_11.observable(''),
            warn: mod_ts_11.observable(''),
            clear: mod_ts_11.observable(''),
        };
        if (!element)
            element = { raw: document.getElementsByClassName('app-container')[0] };
        if (!element?.raw)
            throw new Error(`Did not provide an element, and could not guess the root.`);
        mod_ts_11.getContext(element, 'theme')
            .then(ctx => {
            if (!ctx)
                throw ``;
            ctx.subscribe(data => {
                Object.keys(data).forEach(key => {
                    theme[key].set(data[key]);
                });
            });
        })
            .catch(() => {
            throw new Error(`Could not get the theme.  Did you set it on the root element?`);
        });
        return theme;
    }
    exports_22("getTheme", getTheme);
    return {
        setters: [
            function (mod_ts_11_1) {
                mod_ts_11 = mod_ts_11_1;
            }
        ],
        execute: function () {
            exports_22("defaultTheme", defaultTheme = {
                background1: 'white',
                background2: 'white',
                background3: 'white',
                background4: 'white',
                background5: 'white',
                background6: 'white',
                foreground1: 'black',
                foreground2: 'black',
                foreground3: 'black',
                foreground4: 'black',
                foreground5: 'black',
                foreground6: 'black',
                action1: 'cobalt',
                action2: 'cobalt',
                action3: 'cobalt',
                danger: 'red',
                warn: 'orange',
                clear: 'green',
            });
        }
    };
});
System.register("context", ["mod"], function (exports_23, context_23) {
    "use strict";
    var mod_ts_12, CONTEXT_ID_ATTR, CONTEXT_SEPARATOR, contextMap, counter;
    var __moduleName = context_23 && context_23.id;
    function setContext(element, key, context) {
        let contextId = element.raw.getAttribute(CONTEXT_ID_ATTR);
        if (!contextId) {
            contextId = String(counter++);
            element.raw.setAttribute(CONTEXT_ID_ATTR, contextId);
        }
        const newObservableContext = () => {
            const observableContext = mod_ts_12.observable(context);
            contextMap.set(contextId + CONTEXT_SEPARATOR + key, observableContext);
            return observableContext;
        };
        const observableContext = contextMap.get(contextId + CONTEXT_SEPARATOR + key) || newObservableContext();
        observableContext.set(context);
    }
    exports_23("setContext", setContext);
    async function getContext(element, key) {
        const testId = element.raw.getAttribute(CONTEXT_ID_ATTR);
        if (testId)
            return contextMap.get(testId + CONTEXT_SEPARATOR + key) || null;
        if (!element.raw.parentElement)
            await tryOnMount(element);
        if (!element.raw.parentElement)
            throw new Error(`Element did not have a parent, and we could not locate an effective on-mount listener`);
        let contextId = null;
        let current = element.raw.parentElement;
        while (current) {
            const id = current.getAttribute(CONTEXT_ID_ATTR);
            if (id) {
                contextId = id;
                break;
            }
            current = current.parentElement;
        }
        if (!contextId)
            throw new Error(`Could not find context`);
        return contextMap.get(contextId + CONTEXT_SEPARATOR + key) || null;
    }
    exports_23("getContext", getContext);
    async function tryOnMount(element) {
        try {
            await element.awaitEvent('mount');
        }
        catch (e) { }
    }
    return {
        setters: [
            function (mod_ts_12_1) {
                mod_ts_12 = mod_ts_12_1;
            }
        ],
        execute: function () {
            CONTEXT_ID_ATTR = 'data-context-id';
            CONTEXT_SEPARATOR = ':$:%:*&^@:%:$:';
            contextMap = new Map();
            counter = 0;
        }
    };
});
System.register("mod", ["components/mod", "router/mod", "types", "color", "theme", "context", "core/observable"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    function exportStar_4(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_24(exports);
    }
    return {
        setters: [
            function (mod_ts_13_1) {
                exportStar_4(mod_ts_13_1);
            },
            function (mod_ts_14_1) {
                exportStar_4(mod_ts_14_1);
            },
            function (types_ts_2_1) {
                exportStar_4(types_ts_2_1);
            },
            function (color_ts_1_1) {
                exportStar_4(color_ts_1_1);
            },
            function (theme_ts_1_1) {
                exportStar_4(theme_ts_1_1);
            },
            function (context_ts_1_1) {
                exportStar_4(context_ts_1_1);
            },
            function (observable_ts_3_1) {
                exportStar_4(observable_ts_3_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("lib/keystroke-manager", [], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function keystrokeManager(element, handlers, options = {}) {
        const inputEl = document.createElement('textarea');
        inputEl.oninput = () => emitCharacters(inputEl.value);
        inputEl.onkeydown = e => {
            keyPressed(e.key, e.ctrlKey);
            if (shouldIgnoreKey(e.key))
                e.preventDefault();
        };
        inputEl.style.position = `absolute`;
        inputEl.style.left = `-999em`;
        inputEl.setAttribute('autocomplete', 'off');
        inputEl.setAttribute('spellcheck', 'false');
        inputEl.setAttribute('autocorrect', 'off');
        element.appendChild(inputEl);
        element.addEventListener('keydown', () => inputEl.focus());
        element.addEventListener('click', () => inputEl.focus());
        function keyPressed(key, ctrlKey) {
            if (key === 'Backspace' || key === 'Delete') {
                if (ctrlKey)
                    handlers.powerRemove();
                else
                    handlers.remove();
            }
            else if (key === 'ArrowUp')
                handlers.moveCaretUp();
            else if (key === 'ArrowDown')
                handlers.moveCaretDown();
            else if (key === 'ArrowRight') {
                if (ctrlKey)
                    handlers.powerMoveCaretRight();
                else
                    handlers.moveCaretRight();
            }
            else if (key === 'ArrowLeft') {
                if (ctrlKey)
                    handlers.powerMoveCaretLeft();
                else
                    handlers.moveCaretLeft();
            }
        }
        function shouldIgnoreKey(key) {
            if (options.allowTabs && key === 'Tab') {
                emitCharacters('\t');
                return true;
            }
            else if (!options.allowNewlines && (key === 'Enter' || key === 'Return'))
                return true;
            return false;
        }
        function emitCharacters(characters) {
            if (characters.length)
                handlers.add(characters.split(''));
            inputEl.value = ``;
        }
    }
    exports_25("keystrokeManager", keystrokeManager);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("components/Caret", ["core/mod", "mod"], function (exports_26, context_26) {
    "use strict";
    var mod_ts_15, mod_ts_16;
    var __moduleName = context_26 && context_26.id;
    function Caret() {
        const container = mod_ts_16.Block().style({
            absolute: true,
            position: { top: 0, left: 0 },
            height: 0,
            opacity: 0,
            width: 2,
            background: 'black',
            transition: [{ style: 'opacity', time: 200 }],
        });
        let interval;
        function startBlinking() {
            let on = true;
            interval = setInterval(() => {
                if (on) {
                    container.style({ opacity: 0 });
                    on = false;
                }
                else {
                    container.style({ opacity: 1 });
                    on = true;
                }
            }, 500);
        }
        function stopBlinking() {
            clearInterval(interval);
            container.style({ opacity: 1 });
        }
        return {
            ...container,
            style(styles) {
                container.style({ width: styles.width, borderRadius: styles.borderRadius, background: styles.color });
                if (styles.smoothTransition)
                    container.style({
                        transition: mod_ts_15.derive(styles.smoothTransition, transition => ({ style: ['left', 'top'], time: transition ? 75 : 0 })),
                    });
                return this;
            },
            move(x, y, height) {
                stopBlinking();
                container.style({ position: { top: y, left: x }, height });
                startBlinking();
            },
            hide() {
                stopBlinking();
                container.style({ display: false });
            },
            show() {
                startBlinking();
                container.style({ display: true });
            },
        };
    }
    exports_26("Caret", Caret);
    return {
        setters: [
            function (mod_ts_15_1) {
                mod_ts_15 = mod_ts_15_1;
            },
            function (mod_ts_16_1) {
                mod_ts_16 = mod_ts_16_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("components/Input", ["core/mod", "lib/keystroke-manager", "mod", "components/Caret"], function (exports_27, context_27) {
    "use strict";
    var mod_ts_17, keystroke_manager_ts_1, mod_ts_18, Caret_ts_1, defaultHandlers;
    var __moduleName = context_27 && context_27.id;
    function Input(value, options = {}, handlers = defaultHandlers()) {
        const container = mod_ts_18.Block().style({ alignX: 'start', cursor: 'text' });
        const caret = (options.caret || Caret_ts_1.Caret)();
        const inputValue = mod_ts_17.ensureObservable(value);
        container.$(caret);
        container.focused.subscribe(focused => {
            if (focused)
                caret.show();
            else
                caret.hide();
        });
        let mappings = [];
        let caretPosition = 0;
        const actions = {
            addition(data, index) {
                const { extraBefore, extraAfter } = handlers.additionReRenderBehavior(data, index);
                if (extraBefore || extraAfter)
                    removeData(index - extraBefore, index + extraAfter);
                const currentValue = inputValue.get();
                currentValue.splice(index, 0, ...data);
                inputValue.set(currentValue);
                addData(inputValue.get().slice(index - extraBefore, index + data.length + extraAfter), index - extraBefore);
                if (caretPosition === index)
                    caretPosition += data.length;
                positionCaret();
            },
            deletion(index, count) {
                const currentInputValue = inputValue.get();
                const { extraBefore, extraAfter } = handlers.deletionReRenderBehavior(currentInputValue.slice(index - count, index), index);
                currentInputValue.splice(index - count, count);
                removeData(index - extraBefore, extraBefore + count + extraAfter);
                if (caretPosition === index + count)
                    caretPosition -= count;
                positionCaret();
            },
            replacement(data, startIndex, endIndex) {
                const { extraBefore, extraAfter } = handlers.replacementReRenderBehavior(inputValue.get().slice(startIndex, endIndex), data, startIndex);
                removeData(startIndex - extraBefore, endIndex + extraAfter);
                addData(data, startIndex - extraBefore);
                sync();
                if (caretPosition === endIndex)
                    caretPosition = startIndex + data.length;
                positionCaret();
            },
            moveCaret(toPosition) {
                if (caretPosition === toPosition)
                    return;
                if (toPosition < 0 || toPosition > inputValue.get().length)
                    return;
                caretPosition = toPosition;
                positionCaret();
            },
            allData() {
                return mappings;
            },
            getCaretPosition() {
                return caretPosition;
            },
        };
        if (inputValue.get().length)
            addData(inputValue.get(), 0);
        keystroke_manager_ts_1.keystrokeManager(container.raw, {
            add(chars) {
                const data = chars.map(char => handlers.addition(char));
                actions.addition(data, caretPosition);
            },
            remove() {
                if (!caretPosition)
                    return;
                actions.deletion(caretPosition - 1, 1);
            },
            powerRemove() {
                if (!caretPosition)
                    return;
                const count = getCountToEndOfWord('left');
                actions.deletion(caretPosition - count, count);
            },
            moveCaretDown() {
                const currentYPosition = getYPosition(caretPosition);
                const index = getIndexOfDataAtYPosition(currentYPosition, caretPosition, 'right');
                actions.moveCaret(index);
            },
            moveCaretUp() {
                const currentYPosition = getYPosition(caretPosition);
                const index = getIndexOfDataAtYPosition(currentYPosition, caretPosition, 'left');
                actions.moveCaret(index);
            },
            moveCaretRight() {
                actions.moveCaret(caretPosition + 1);
            },
            powerMoveCaretRight() {
                const count = getCountToEndOfWord('right');
                actions.moveCaret(caretPosition + count);
            },
            moveCaretLeft() {
                actions.moveCaret(caretPosition - 1);
            },
            powerMoveCaretLeft() {
                const count = getCountToEndOfWord('left');
                actions.moveCaret(caretPosition - count);
            },
        });
        function getCountToEndOfWord(direction) {
            let count = 0;
            const getNewIndex = () => {
                if (direction === 'right')
                    return caretPosition + count;
                else
                    return caretPosition - count;
            };
            const isWord = () => {
                const mapper = mappings[getNewIndex()];
                if (!mapper)
                    return false;
                return handlers.isWord(mapper.data);
            };
            while (isWord()) {
                if (direction === 'right')
                    count++;
                else
                    count--;
            }
            return count;
        }
        function removeData(index, length) {
            const removed = mappings.splice(index, length);
            removed.forEach(map => {
                if (!map.hidden)
                    map.representative.raw.remove();
            });
        }
        function addData(data, index) {
            const res = handlers.render(data, actions);
            const itemAt = getNextRepresentedElement(index, 'right');
            if (!itemAt)
                container.$(...res.body);
            else
                res.body.forEach(el => container.raw.insertBefore(el.raw, itemAt.representative.raw));
            if (res.mapper.length !== data.length)
                throw new Error(`Some bits of data were not represented in the 'mapper' key returned by 'handlers.render'.  We know this because the input array and the array returned in the 'mapper' key of do not have the same length.`);
            mappings.splice(index, 0, ...res.mapper);
        }
        function sync() {
            inputValue.set(mappings.map(({ data }) => data));
        }
        function positionCaret() {
            const dataElement = getNextRepresentedElement(caretPosition - 1, 'left');
            if (!dataElement)
                caret.move(0, 0, options.defaultCaretHeight || 18);
            else {
                const pos = dataElement.position();
                caret.move(pos.topRight.x, pos.topRight.y, pos.height);
            }
        }
        function getIndexOfDataAtYPosition(yPosition, seekIndex, seekDirection) {
            return 0;
        }
        function getNextRepresentedElement(index, seekDirection) {
            let item = mappings[index];
            while (item && item.hidden) {
                if (seekDirection === 'right')
                    index++;
                else
                    index--;
                item = mappings[index];
            }
            return item || null;
        }
        function getYPosition(index) {
            const nextRepresentedElementToRight = getNextRepresentedElement(index, 'right');
            if (!nextRepresentedElementToRight) {
                const nextRepresentedElementToLeft = getNextRepresentedElement(index, 'left');
                if (!nextRepresentedElementToLeft)
                    return 0;
                return nextRepresentedElementToLeft.position().topRight.y;
            }
            return nextRepresentedElementToRight.position().topLeft.y;
        }
        return {
            ...container,
            style(styles) {
                if (styles.container)
                    container.style(styles.container);
                if (styles.caret)
                    caret.style(styles.caret);
                return this;
            },
        };
    }
    exports_27("Input", Input);
    function inputWholeString(string) {
        if (!mod_ts_17.isObservable(string))
            return string.split('');
        const newObs = mod_ts_17.observable([]);
        mod_ts_17.twoWayBinding(string, newObs, { map1to2: v => v.split(''), map2to1: v => v.join('') });
        return newObs;
    }
    exports_27("inputWholeString", inputWholeString);
    return {
        setters: [
            function (mod_ts_17_1) {
                mod_ts_17 = mod_ts_17_1;
            },
            function (keystroke_manager_ts_1_1) {
                keystroke_manager_ts_1 = keystroke_manager_ts_1_1;
            },
            function (mod_ts_18_1) {
                mod_ts_18 = mod_ts_18_1;
            },
            function (Caret_ts_1_1) {
                Caret_ts_1 = Caret_ts_1_1;
            }
        ],
        execute: function () {
            defaultHandlers = () => ({
                addition(char) {
                    return char;
                },
                additionReRenderBehavior() {
                    return { extraAfter: 0, extraBefore: 0 };
                },
                deletionReRenderBehavior() {
                    return { extraAfter: 0, extraBefore: 0 };
                },
                replacementReRenderBehavior() {
                    return { extraAfter: 0, extraBefore: 0 };
                },
                isWord(char) {
                    return /[a-zA-Z09_]/.test(char);
                },
                render(chars) {
                    const mapper = chars.map(char => {
                        if (typeof char !== 'string')
                            throw new Error(`The default input handlers can only handle strings.  Write your own handlers if you want to deal with more complicated data types.`);
                        const map = {
                            data: char,
                            hidden: false,
                            representative: mod_ts_18.Label(char),
                            position() {
                                const el = this.representative.raw;
                                if (!el.parentElement)
                                    throw new Error(`Can't get element's position before it is mounted`);
                                return {
                                    topRight: { y: el.offsetTop, x: el.offsetLeft + el.offsetWidth },
                                    bottomRight: { y: el.offsetTop + el.offsetHeight, x: el.offsetLeft + el.offsetWidth },
                                    topLeft: { y: el.offsetTop, x: el.offsetLeft },
                                    bottomLeft: { y: el.offsetTop + el.offsetHeight, x: el.offsetLeft },
                                    height: el.clientHeight,
                                };
                            },
                        };
                        return map;
                    });
                    return {
                        body: mapper.map(({ representative }) => representative),
                        mapper,
                    };
                },
            });
        }
    };
});
System.register("uiv/mod", ["components/Input", "components/mod", "mod"], function (exports_28, context_28) {
    "use strict";
    var Input_ts_1, mod_ts_19, mod_ts_20;
    var __moduleName = context_28 && context_28.id;
    function makeUiVisualizer(name, ...components) {
        return mod_ts_19.Block()
            .style({ alignX: 'start' })
            .$(mod_ts_19.Block()
            .style({
            width: 230,
            background: 'paleRed',
            alignY: 'top',
            stackY: true,
            padding: { top: 5, bottom: 5, right: 16, left: 16 },
        })
            .vertical()
            .$(mod_ts_19.Block()
            .style({ height: 40 })
            .$(mod_ts_19.Block()
            .style({ alignX: 'start' })
            .$(mod_ts_20.Label(name).style({ weight: 'bold', allowSelection: true })), mod_ts_19.Block()
            .packX()
            .$(mod_ts_20.Icon('dots-horizontal').style({ size: 24 }))), mod_ts_19.Block()
            .style({
            padding: 5,
            border: { color: 'black', width: 1, style: 'solid' },
            borderRadius: 4,
            focused: { border: { color: 'blue', width: 1, style: 'solid' } },
            height: 20,
        })
            .$(Input_ts_1.Input(Input_ts_1.inputWholeString(`hello there`)).style({ caret: { color: 'blue' } }))), mod_ts_19.Block().style({ background: 'paleBlue' }));
    }
    exports_28("makeUiVisualizer", makeUiVisualizer);
    function uivComponent(name, ...stories) {
        return {
            name,
            stories,
        };
    }
    exports_28("uivComponent", uivComponent);
    function uivStory(description, fn) {
        const props = [];
        const actions = {
            editString(name, observable) {
                props.push({ name, type: 'string', observable });
            },
            editNumber(name, observable, options = {}) {
                props.push({ name, type: 'number', observable, min: options.min || null, max: options.max || null });
            },
            selectStrings(name, observable, values) {
                props.push({ name, type: 'select', observable, values: values });
            },
        };
        const component = fn(actions);
        return {
            description,
            component,
            props,
        };
    }
    exports_28("uivStory", uivStory);
    return {
        setters: [
            function (Input_ts_1_1) {
                Input_ts_1 = Input_ts_1_1;
            },
            function (mod_ts_19_1) {
                mod_ts_19 = mod_ts_19_1;
            },
            function (mod_ts_20_1) {
                mod_ts_20 = mod_ts_20_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("test/main", ["mod", "uiv/mod"], function (exports_29, context_29) {
    "use strict";
    var mod_ts_21, mod_ts_22;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (mod_ts_21_1) {
                mod_ts_21 = mod_ts_21_1;
            },
            function (mod_ts_22_1) {
                mod_ts_22 = mod_ts_22_1;
            }
        ],
        execute: function () {
            mod_ts_21.AppRoot().$(mod_ts_22.makeUiVisualizer(`My Components`));
        }
    };
});

__instantiate("test/main", false);

;
/// <reference lib="dom"/>

function startSocketListener() {
	const socket = new WebSocket(`ws://${location.hostname}:${location.port}/_livereload.ws`)

	socket.addEventListener('open', () => {
		console.log(`[dev] livereload enabled`)
	})

	socket.addEventListener('message', e => {
		if (e.data === 'should-reload') {
			console.log(`[dev] changes detected via livereload server.  Reloading...`)
			window.location.reload()
		} else {
			console.warn(`[dev] received an unexpected message from the livereload server.`, e.data)
		}
	})

	socket.addEventListener('error', e => {
		console.log(`[dev] could not connect to livereload server.`, e)
	})

	socket.addEventListener('close', e => {
		console.log(`[dev] livereload server disconnected!`)
		tryReconnect()
	})
}

function tryReconnect() {
	console.log(`[dev] running a livereload reconnect attempt in 5s...`)
	setTimeout(() => {
		console.log(`[dev] reconnecting livereload server...`)
		startSocketListener()
	}, 5000)
}

startSocketListener()
