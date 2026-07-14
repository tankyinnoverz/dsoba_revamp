import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};globalThis.__timing__.logStart('Load chunks/build/server');import { hasInjectionContext, getCurrentInstance, useSSRContext, createApp, defineComponent, ref, computed, mergeProps, unref, provide, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, shallowReactive, reactive, effectScope, inject, defineAsyncComponent, getCurrentScope, toRef, h, isReadonly, isRef, isShallow, isReactive, toRaw } from 'vue';
import { p as parseURL, e as encodePath, l as decodePath, m as hasProtocol, n as isScriptProtocol, o as joinURL, w as withQuery, q as sanitizeStatusCode, r as getContext, $ as $fetch, v as createHooks, f as createError$1, x as isEqual, y as createDebugger, z as stringifyParsedURL, A as stringifyQuery, B as parseQuery, C as defu } from '../_/nitro.mjs';
import { b as baseURL, p as publicAssetsURL } from '../routes/renderer.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.8";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.add(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedHeader = encodeURL(location2, isExternalHost);
        const encodedLoc = encodeForHtmlAttr(encodedHeader);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    const pathname = url.pathname.replace(/^\/{2,}/, "/");
    return pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher("", typeof path === "string" ? path.toLowerCase() : path).map((r) => r.data).reverse());
const routeRulesMatcher = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher(path.toLowerCase());
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return await handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    const initialLayoutProps = nuxtApp.payload.state._layoutProps;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
          to.meta.layoutProps = initialLayoutProps;
        }
        nuxtApp._processingMiddleware = true;
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          const routeRules = getRouteRules({ path: to.path });
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              const guard = nuxtApp._middleware.named[key];
              if (!guard) {
                continue;
              }
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(guard);
              } else {
                middlewareEntries.delete(guard);
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
const debug_hooks_hyXe6laRLyyi6S6XoqeItfe9HTFGNswlS09LT9GQbmQ = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:debug:hooks",
  enforce: "pre",
  setup(nuxtApp) {
    createDebugger(nuxtApp.hooks, { tag: "nuxt-app" });
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw,
  debug_hooks_hyXe6laRLyyi6S6XoqeItfe9HTFGNswlS09LT9GQbmQ,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];
const _imports_0 = publicAssetsURL("/assets/logo.png");
const _imports_1 = publicAssetsURL("/assets/home-centenary-banner.jpg");
const _imports_2 = publicAssetsURL("/assets/chapter-dinner.jpeg");
const _imports_3 = publicAssetsURL("/assets/charity-service.jpeg");
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const route = ref("home"), menu = ref(false), openGroup = ref(""), member = ref("life"), filter = ref("All"), eventCategory = ref("All"), selectedEvent = ref("annual-dinner"), selectedNews = ref("president-note"), registered = ref(false), toast = ref("");
    const news = [
      { id: "president-note", title: "President’s mid-year note", date: "18 Jun 2026", category: "Association", excerpt: "A message on reconnecting, supporting the school and what lies ahead for our community.", color: "bg-navy" },
      { id: "annual-volunteers", title: "Annual Dinner committee welcomes volunteers", date: "08 Jun 2026", category: "Annual Dinner", excerpt: "Join the working team shaping this year’s landmark gathering and community showcase.", image: "/assets/chapter-dinner-event.jpeg" },
      { id: "dragonboat-win", title: "Dragon Boat Team brings home an award", date: "23 May 2026", category: "Sports", excerpt: "A brilliant result after months of training, teamwork and support from fellow Old Boys.", image: "/assets/dragonboat-award.jpeg" },
      { id: "summer-happy-hour", title: "Summer alumni Happy Hour", date: "12 May 2026", category: "Social", excerpt: "An easy evening in Central for alumni across years, chapters and professions.", image: "/assets/happy-hour-event.jpeg" },
      { id: "cfl-scholarship", title: "CFL Trust scholarship update", date: "30 Apr 2026", category: "Community", excerpt: "A short update on education support and the impact of alumni contributions.", color: "bg-wine" },
      { id: "chapter-dinner-news", title: "Professional Chapters Dinner highlights", date: "19 Apr 2026", category: "Chapters", excerpt: "Members from five professional chapters gathered for exchange, mentoring and dinner.", image: "/assets/chapter-dinner-event.jpeg" },
      { id: "overseas-london", title: "Overseas alumni gathering — London", date: "08 Apr 2026", category: "Overseas", excerpt: "A simple notice for Old Boys based in the United Kingdom.", color: "bg-[#263a4a]" },
      { id: "charity-service-news", title: "Alumni families serve together", date: "24 Mar 2026", category: "Community", excerpt: "A practical service day bringing alumni and families together in Kowloon.", image: "/assets/charity-service-event.jpeg" }
    ];
    const activeNews = computed(() => news.find((n) => n.id === selectedNews.value) || news[0]);
    const publicGroups = [
      { label: "About", items: [["About DSOBA", "about"], ["Mission", "about-mission"], ["General Committee", "about-general-committee"], ["Past Presidents", "about-past-presidents"], ["CFL Trust", "about-cfl"]] },
      { label: "Chapters & Groups", items: [["Professional Chapters", "professional-chapters"], ["Interest Groups", "interest-groups"], ["Overseas", "overseas"]] },
      { label: "News", items: [["News", "news"]] },
      { label: "Events", items: [["Upcoming Events", "events"], ["Past Events", "events-past"], ["Social Activities", "events-social"], ["Annual Dinner", "event-detail"]] },
      { label: "Membership", items: [["Why Join", "membership-why"], ["Life / Trial / Youth", "membership-types"], ["Apply Now", "membership-apply"], ["Enquiry", "membership-enquiry"], ["DSOBA Credit Card", "membership-credit-card"]] }
    ];
    const contentPages = {
      "about-mission": { eyebrow: "About DSOBA", title: "Our mission", intro: "Connect Old Boys across generations, strengthen fellowship and support the school community.", items: ["Build lasting alumni connections", "Support the school and charitable initiatives", "Create professional and social opportunities"] },
      "about-committees": { eyebrow: "Governance", title: "Committees", intro: "Volunteer committees turn the association’s mission into year-round programmes.", items: ["General Committee", "IT Subcommittee", "Annual Dinner Committee", "Membership and Communications"] },
      "about-general-committee": { eyebrow: "2026–2027", title: "General Committee", intro: "Meet the office bearers serving DSOBA.", items: ["President · Edward Lau", "Vice President · Brian Lee", "Honorary Secretary · Alex Chan", "Honorary Treasurer · Daniel Wong"] },
      "about-past-presidents": { eyebrow: "Heritage", title: "Past Presidents", intro: "Recognising the alumni who guided the association through each chapter.", items: ["2024–2026 · Anthony Ho", "2022–2024 · Raymond Lee", "2020–2022 · Michael Chan", "View earlier terms"] },
      "about-past-gencom": { eyebrow: "Archive", title: "Past General Committees", intro: "Previous committee terms and office bearers.", items: ["2024–2026 Committee", "2022–2024 Committee", "2020–2022 Committee"] },
      "about-cfl": { eyebrow: "Community impact", title: "CFL Trust", intro: "The Charitable Foundation Limited supports education and community initiatives.", items: ["Scholarship support", "Community service", "Donation enquiries"], cta: ["Contact the trust", "contact"] },
      "about-booklet": { eyebrow: "Publication", title: "DSOBA booklet", intro: "Association highlights, school stories and alumni milestones.", items: ["Centenary edition", "Annual Dinner booklet", "Association highlights"] },
      "professional-chapters": { eyebrow: "Network", title: "Professional chapters", intro: "Connect through shared expertise and professional interests.", items: ["Legal", "FIBA", "Medical", "ICT & Media", "Design & Built", "TLM", "CARE", "Discipline"] },
      "interest-groups": { eyebrow: "Shared interests", title: "Interest groups", intro: "Groups created around music, sport and alumni-led activities.", items: ["Music Group", "Sports Group", "Suggest a new group"] },
      "group-music": { eyebrow: "Interest group", title: "Music group", intro: "Rehearsals, performances and gatherings for alumni musicians.", items: ["Summer open rehearsal", "Annual Dinner performance", "Join the group"] },
      "group-sports": { eyebrow: "Interest group", title: "Sports group", intro: "Dragon boat, family days and friendly competitions.", items: ["Dragon Boat Team", "Games Day", "Poolside gathering"] },
      "overseas": { eyebrow: "Around the world", title: "Overseas alumni", intro: "Stay connected with alumni living and working overseas.", items: ["United Kingdom", "Canada", "Australia", "United States", "Contact a convenor"] },
      "news-archive": { eyebrow: "News", title: "News archive", intro: "Browse one year of DSOBA association updates.", items: ["June 2026", "May 2026", "April 2026", "March 2026"] },
      "news-gallery": { eyebrow: "Photos", title: "Community gallery", intro: "Highlights from alumni events, service and sport.", items: ["Charity Service", "Dragon Boat Team", "Happy Hour", "Chapter Dinner"] },
      "events-past": { eyebrow: "Archive", title: "Past events", intro: "Recent event recaps remain available for one year.", items: ["Annual Dinner 2025", "Games Day 2026", "Legal Chapter dinner", "Spring Happy Hour"] },
      "events-social": { eyebrow: "Meet up", title: "Social activities", intro: "Reconnect through regular informal gatherings.", items: ["Monthly Happy Hour", "Alumni Luncheon", "Games Day", "Poolside Gathering"] },
      "annual-dinner-programme": { eyebrow: "Annual Dinner", title: "Evening programme", intro: "A believable run of show for stakeholder review.", items: ["18:30 · Reception", "19:15 · Opening remarks", "20:00 · Dinner and performances", "21:30 · Raffle and closing"] },
      "membership-why": { eyebrow: "Membership", title: "Why join DSOBA?", intro: "Stay close to your alumni network and association life.", items: ["Member events and pricing", "Alumni directory access", "Professional chapters", "Community initiatives"], cta: ["Compare membership types", "membership-types"] },
      "membership-life": { eyebrow: "From age 28", title: "Life membership", intro: "One payment for lifelong access to the member community.", items: ["Lifetime status", "Directory and portal access", "Member event benefits"], cta: ["Apply now", "membership-apply"] },
      "membership-trial": { eyebrow: "Ages 18–27", title: "Trial membership", intro: "Stay connected before converting to Life membership.", items: ["Portal access", "Event invitations", "Lifecycle reminders"] },
      "membership-youth": { eyebrow: "Under 18", title: "Youth membership", intro: "An early connection to the Old Boys’ community.", items: ["Association updates", "Youth-to-Trial transition", "Profile and event access"] },
      "membership-enquiry": { eyebrow: "Membership", title: "Membership enquiry", intro: "Send a demo enquiry to the membership team.", items: ["Eligibility question", "Application status", "Member type query"] },
      "membership-credit-card": { eyebrow: "Member benefit", title: "DSOBA Credit Card", intro: "Preview the association credit-card programme.", items: ["Programme highlights", "Eligibility", "Application information"] },
      "useful-links": { eyebrow: "Information", title: "Useful links", intro: "School and alumni-related resources.", items: ["Dalton School website", "CFL Trust", "Chapter contacts", "Event enquiries"] },
      "contact": { eyebrow: "Get in touch", title: "Contact DSOBA", intro: "Reach the association by email or WhatsApp.", items: ["Email · info@dsoba.example", "WhatsApp · +852 9123 4567", "General enquiries", "Membership support"] },
      "privacy": { eyebrow: "Policy", title: "Privacy policy", intro: "How personal information is handled.", items: ["Information collected", "How information is used", "Retention and security", "Your rights"] },
      "terms": { eyebrow: "Policy", title: "Terms & conditions", intro: "Terms governing the website and member services.", items: ["Website use", "Event registration", "Member responsibilities", "Liability"] },
      "personal-data": { eyebrow: "Policy", title: "Personal data", intro: "Personal Information Collection Statement preview.", items: ["Purpose of collection", "Data transfers", "Access and correction", "Contact the data officer"] }
    };
    const eventsData = [
      { id: "annual-dinner", category: "Annual Dinner", title: "105th Annual Dinner", date: "28 Nov 2026", venue: "Grand Ballroom, Hopewell Hotel", image: "/assets/annual-dinner-venue.jpg", status: "Registration open", description: "The association’s landmark annual gathering brings generations together for dinner, performances and community giving.", highlights: ["Individual seats and tables", "Guest registration welcome", "Charity service showcase"] },
      { id: "dragonboat-award", category: "Sports", title: "Dragon Boat Team Award Celebration", date: "18 Jul 2026", venue: "DSOBA Clubhouse", image: "/assets/dragonboat-award.jpeg", status: "Members welcome", description: "Celebrate the DSOBA Dragon Boat Team after a brilliant competition result and a season built on teamwork.", highlights: ["Team award presentation", "Season photo gallery", "Meet the paddlers"] },
      { id: "happy-hour", category: "Social", title: "Summer Alumni Happy Hour", date: "07 Aug 2026", venue: "Central, Hong Kong", image: "/assets/happy-hour-event.jpeg", status: "RSVP open", description: "A relaxed monthly gathering for alumni across years and professions.", highlights: ["Informal networking", "First drink included", "Members and guests"] },
      { id: "chapter-dinner", category: "Chapters", title: "Professional Chapters Dinner", date: "12 Sep 2026", venue: "The Mira Hong Kong", image: "/assets/chapter-dinner-event.jpeg", status: "Limited seats", description: "An evening connecting members from Legal, FIBA, Medical, ICT & Media and Design & Built chapters.", highlights: ["Cross-chapter tables", "Guest speaker", "Mentoring introductions"] },
      { id: "charity-service", category: "Community", title: "DSOBA Charity Service Day", date: "24 Oct 2026", venue: "Kowloon Community Centre", image: "/assets/charity-service-event.jpeg", status: "Volunteer places open", description: "Alumni and families volunteer together in a practical community service programme featured in the Annual Dinner community report.", highlights: ["Family-friendly service", "Volunteer briefing", "Annual Dinner recognition"] }
    ];
    const eventCategories = ["All", "Annual Dinner", "Sports", "Social", "Chapters", "Community"];
    const eventsShown = computed(() => eventCategory.value === "All" ? eventsData : eventsData.filter((e) => e.category === eventCategory.value));
    const activeEvent = computed(() => eventsData.find((e) => e.id === selectedEvent.value) || eventsData[0]);
    const people = [["Alex Chan", "Finance", "2004"], ["Brian Lee", "Legal", "1999"], ["Cyrus Ho", "Technology", "2008"], ["Daniel Wong", "Finance", "1994"], ["Eddie Lau", "Design", "2007"], ["Felix Ng", "Medical", "2001"]];
    const shown = computed(() => filter.value === "All" ? people : people.filter((p) => p[1] === filter.value));
    const portal = computed(() => route.value.startsWith("portal"));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "shell relative overflow-hidden" }, _attrs))}><header class="sticky top-0 z-20 flex h-[66px] items-center justify-between bg-navy px-4 text-white"><button class="flex items-center gap-2"><img${ssrRenderAttr("src", _imports_0)} class="h-12 w-11 object-contain" alt="DSOBA crest"></button><span class="text-xs font-bold">${ssrInterpolate(unref(portal) ? "Member Portal" : "Mobile Demo")}</span><button class="text-2xl">☰</button></header>`);
      if (unref(menu)) {
        _push(`<aside class="fixed right-0 top-0 z-30 flex h-full w-[82%] max-w-[350px] flex-col bg-white p-6 shadow-2xl"><button class="ml-auto text-2xl">×</button><h2 class="serif mt-5 text-3xl text-navy">${ssrInterpolate(unref(portal) ? "Member menu" : "Explore DSOBA")}</h2><nav class="mt-6 overflow-y-auto pr-1">`);
        if (unref(portal)) {
          _push(`<!--[-->`);
          ssrRenderList([["Dashboard", "portal-home"], ["Profile", "portal-profile"], ["Directory", "portal-directory"], ["Membership", "portal-membership"], ["Messages", "portal-messages"]], (x) => {
            _push(`<button class="flex w-full justify-between border-b border-navy/10 py-4 text-left font-bold text-navy">${ssrInterpolate(x[0])} <span>›</span></button>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<!--[--><button class="flex w-full justify-between border-b border-navy/10 py-4 text-left font-bold text-navy">Home <span>›</span></button><!--[-->`);
          ssrRenderList(publicGroups, (group) => {
            _push(`<div class="border-b border-navy/10">`);
            if (group.items.length === 1) {
              _push(`<button class="flex w-full justify-between py-4 text-left font-bold text-navy">${ssrInterpolate(group.label)} <span>›</span></button>`);
            } else {
              _push(`<!--[--><button class="flex w-full justify-between py-4 text-left font-bold text-navy"${ssrRenderAttr("aria-expanded", unref(openGroup) === group.label)}>${ssrInterpolate(group.label)} <span class="text-wine">${ssrInterpolate(unref(openGroup) === group.label ? "−" : "+")}</span></button>`);
              if (unref(openGroup) === group.label) {
                _push(`<div class="border-t border-navy/5 pb-2 pl-3"><!--[-->`);
                ssrRenderList(group.items, (item) => {
                  _push(`<button class="flex w-full justify-between py-2.5 text-left text-sm text-navy/75">${ssrInterpolate(item[0])} <span>›</span></button>`);
                });
                _push(`<!--]--></div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--><!--]-->`);
        }
        _push(`</nav><button class="mt-auto rounded-xl bg-gold py-3 font-bold">${ssrInterpolate(unref(portal) ? "Switch demo member" : "Member login")}</button></aside>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(route) === "home") {
        _push(`<section><div class="hero relative min-h-[410px] overflow-hidden px-6 pt-24 text-white"><img${ssrRenderAttr("src", _imports_1)} class="absolute inset-0 h-full w-full object-cover"><div class="relative z-10"><p class="text-xs font-bold tracking-[.2em] text-gold">SINCE 1926</p><h1 class="serif mt-3 text-5xl leading-[.92]">A lifelong<br>connection.</h1><p class="mt-4 max-w-xs text-sm leading-6 text-white/80">Community, conversation and shared purpose across generations.</p><div class="mt-6 flex gap-3"><button class="rounded-lg bg-gold px-5 py-3 font-bold text-black">Join DSOBA</button><button class="rounded-lg border border-white/50 px-5 py-3 font-bold">Our story</button></div></div></div><section class="p-5 py-8"><div class="flex items-end justify-between"><div><p class="text-[11px] font-bold tracking-[.18em] text-wine">FEATURED EVENT</p><h2 class="serif mt-1 text-3xl text-navy">Coming together</h2></div><button class="text-xs font-bold text-wine">All events →</button></div><button class="mt-5 w-full overflow-hidden rounded-2xl bg-white text-left shadow"><img${ssrRenderAttr("src", _imports_2)} class="h-52 w-full object-cover"><span class="block p-4"><b class="text-xs text-wine">28 NOVEMBER 2026 · HOPEWELL HOTEL</b><strong class="serif mt-1 block text-2xl text-navy">105th Annual Dinner</strong><small class="mt-2 block leading-5 text-navy/65">Celebrate a century of friendship. Individual seats and full tables are available.</small><span class="mt-4 inline-block rounded-lg bg-gold px-4 py-2 text-xs font-bold text-black">View event &amp; RSVP</span></span></button></section><section class="bg-wine p-5 py-8 text-white"><div class="flex items-end justify-between"><div><p class="text-[11px] font-bold tracking-[.18em] text-gold">ASSOCIATION FEED</p><h2 class="serif mt-1 text-3xl">Latest from DSOBA</h2></div><button class="text-xs font-bold text-gold">View all →</button></div><button class="mt-5 w-full overflow-hidden rounded-2xl bg-white text-left text-navy"><img${ssrRenderAttr("src", _imports_1)} class="h-40 w-full object-cover"><span class="block p-4"><small class="font-bold text-wine">18 JUNE 2026</small><strong class="serif mt-1 block text-2xl">President’s mid-year note</strong><span class="mt-2 block text-sm leading-5 text-navy/65">On reconnecting, supporting the school and what lies ahead.</span></span></button><div class="mt-3 divide-y divide-white/15"><!--[-->`);
        ssrRenderList(news.slice(1, 6), (n) => {
          _push(`<button class="flex w-full items-center justify-between gap-4 py-4 text-left"><span><b class="text-sm leading-5">${ssrInterpolate(n.title)}</b><small class="mt-1 block text-white/55">${ssrInterpolate(n.date)} 2026 · DSOBA News</small></span><span class="text-gold">›</span></button>`);
        });
        _push(`<!--]--></div><button class="mt-3 w-full rounded-xl border border-gold/60 py-3 text-sm font-bold text-gold">Browse the full news feed</button></section><section class="p-5 py-9"><p class="text-[11px] font-bold tracking-[.18em] text-wine">FIND YOUR PEOPLE</p><h2 class="serif mt-1 text-3xl text-navy">Chapters &amp; groups</h2><p class="mt-3 text-sm leading-6 text-navy/65">Professional exchange, shared interests and friendships that keep growing.</p><div class="mt-5 grid grid-cols-2 gap-3"><!--[-->`);
        ssrRenderList(["Legal", "FIBA", "Medical", "ICT & Media", "Music", "Sports"], (x) => {
          _push(`<button class="min-h-[90px] rounded-2xl border border-navy/10 bg-white p-4 text-left shadow-sm"><b class="serif text-xl text-navy">${ssrInterpolate(x)}</b><small class="mt-2 block text-wine">Explore group →</small></button>`);
        });
        _push(`<!--]--></div></section><section class="relative overflow-hidden bg-navy px-5 py-10 text-white"><img${ssrRenderAttr("src", _imports_3)} class="absolute inset-0 h-full w-full object-cover opacity-20"><div class="relative"><p class="text-[11px] font-bold tracking-[.18em] text-gold">MEMBERSHIP</p><h2 class="serif mt-2 max-w-xs text-4xl leading-tight">Your school years end. The community doesn’t.</h2><p class="mt-4 max-w-xs text-sm leading-6 text-white/70">Stay connected through events, chapters, member services and the alumni directory.</p><button class="mt-6 rounded-xl bg-gold px-5 py-3 font-bold text-black">Explore membership</button></div></section></section>`);
      } else if (unref(route) === "about" || unref(route) === "chapters") {
        _push(`<section class="p-5 py-8"><p class="text-xs font-bold tracking-wider text-wine">${ssrInterpolate(unref(route) === "about" ? "ABOUT DSOBA" : "COMMUNITY")}</p><h1 class="serif mt-3 text-4xl text-navy">${ssrInterpolate(unref(route) === "about" ? "A community with a generous memory." : "Chapters & groups")}</h1><p class="mt-5 leading-7 text-navy/70">DSOBA connects alumni across classes, professions and countries—creating room to contribute and reconnect.</p><div class="mt-6 bg-white p-4"><!--[-->`);
        ssrRenderList(unref(route) === "about" ? ["Our mission", "General Committee", "Past Presidents", "CFL Trust"] : ["Legal", "FIBA", "Medical", "ICT & Media", "Design & Built", "Music", "Sports"], (x) => {
          _push(`<button class="flex w-full justify-between border-b border-navy/10 py-4 font-bold text-navy">${ssrInterpolate(x)} <span>›</span></button>`);
        });
        _push(`<!--]--></div></section>`);
      } else if (unref(route) === "news" || unref(route) === "news-detail") {
        _push(`<section class="p-5 py-8">`);
        if (unref(route) === "news") {
          _push(`<!--[--><p class="text-xs font-bold tracking-[.16em] text-wine">NEWS</p><h1 class="serif mt-2 text-4xl text-navy">Stories from our community</h1><p class="mt-3 text-sm leading-6 text-navy/65">Association notices, event moments and alumni stories in one continuous mobile feed.</p><div class="mt-6 space-y-5"><!--[-->`);
          ssrRenderList(news, (post) => {
            _push(`<article class="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm"><button class="w-full text-left"><span class="flex items-center gap-3 p-4"><img${ssrRenderAttr("src", _imports_0)} class="h-10 w-9 object-contain" alt=""><span class="min-w-0"><b class="block text-sm text-navy">Old Boys’ Association</b><small class="block text-xs text-navy/50">${ssrInterpolate(post.date)} · ${ssrInterpolate(post.category)}</small></span></span><span class="block px-4 pb-4"><strong class="serif block text-2xl leading-tight text-navy">${ssrInterpolate(post.title)}</strong><span class="mt-2 block text-sm leading-6 text-navy/65">${ssrInterpolate(post.excerpt)}</span></span>`);
            if (post.image) {
              _push(`<img${ssrRenderAttr("src", post.image)} class="h-56 w-full object-cover"${ssrRenderAttr("alt", post.title)}>`);
            } else {
              _push(`<span class="${ssrRenderClass([post.color, "grid min-h-[180px] place-items-end p-5 text-white"])}"><span class="serif text-3xl leading-tight">${ssrInterpolate(post.title)}</span></span>`);
            }
            _push(`<span class="flex items-center justify-between border-t border-navy/10 px-4 py-3 text-xs font-bold text-navy/55"><span>Read story</span><span>Share · Save</span></span></button></article>`);
          });
          _push(`<!--]--></div><!--]-->`);
        } else {
          _push(`<article><button class="mb-4 text-sm font-bold text-wine">← Back to news</button><div class="overflow-hidden rounded-2xl border border-navy/10 bg-white"><div class="flex items-center gap-3 p-4"><img${ssrRenderAttr("src", _imports_0)} class="h-10 w-9 object-contain" alt=""><span><b class="block text-sm text-navy">Old Boys’ Association</b><small class="text-xs text-navy/50">${ssrInterpolate(unref(activeNews).date)} · ${ssrInterpolate(unref(activeNews).category)}</small></span></div>`);
          if (unref(activeNews).image) {
            _push(`<img${ssrRenderAttr("src", unref(activeNews).image)} class="h-64 w-full object-cover"${ssrRenderAttr("alt", unref(activeNews).title)}>`);
          } else {
            _push(`<div class="${ssrRenderClass([unref(activeNews).color, "grid min-h-[220px] place-items-end p-5 text-white"])}"><h1 class="serif text-4xl leading-tight">${ssrInterpolate(unref(activeNews).title)}</h1></div>`);
          }
          _push(`<div class="p-5">`);
          if (unref(activeNews).image) {
            _push(`<h1 class="serif text-4xl leading-tight text-navy">${ssrInterpolate(unref(activeNews).title)}</h1>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="mt-4 text-[15px] leading-7 text-navy/70">${ssrInterpolate(unref(activeNews).excerpt)}</p><p class="mt-4 text-[15px] leading-7 text-navy/70">This demo article shows how a post can continue into a readable editorial detail view while preserving the same image, date and category context.</p></div></div></article>`);
        }
        _push(`</section>`);
      } else if (unref(route) === "events" || unref(route) === "event-detail" || unref(route) === "event-register") {
        _push(`<section class="p-5 py-8">`);
        if (unref(route) === "events") {
          _push(`<!--[--><p class="text-xs font-bold tracking-[.16em] text-wine">EVENTS</p><h1 class="serif mt-2 text-4xl text-navy">Find your next gathering</h1><p class="mt-3 text-sm leading-6 text-navy/65">Annual traditions, professional chapters, sport, service and easy social meet-ups.</p><div class="mt-5 flex gap-2 overflow-x-auto pb-2"><!--[-->`);
          ssrRenderList(eventCategories, (category) => {
            _push(`<button class="${ssrRenderClass([unref(eventCategory) === category ? "bg-gold text-black" : "border border-navy/15 bg-white text-navy", "shrink-0 rounded-full px-3 py-2 text-xs font-bold"])}">${ssrInterpolate(category)}</button>`);
          });
          _push(`<!--]--></div><div class="mt-4 space-y-4"><!--[-->`);
          ssrRenderList(unref(eventsShown), (event) => {
            _push(`<button class="w-full overflow-hidden rounded-2xl border border-navy/10 bg-white text-left shadow-sm"><img${ssrRenderAttr("src", event.image)} class="h-44 w-full object-cover"${ssrRenderAttr("alt", event.title)}><span class="block p-4"><span class="flex items-center justify-between gap-3"><small class="font-bold uppercase tracking-wider text-wine">${ssrInterpolate(event.category)}</small><small class="rounded-full bg-gold/25 px-2 py-1 font-bold text-navy">${ssrInterpolate(event.status)}</small></span><strong class="serif mt-2 block text-2xl leading-tight text-navy">${ssrInterpolate(event.title)}</strong><small class="mt-2 block leading-5 text-navy/60">${ssrInterpolate(event.date)} · ${ssrInterpolate(event.venue)}</small></span></button>`);
          });
          _push(`<!--]--></div><!--]-->`);
        } else if (unref(route) === "event-detail") {
          _push(`<!--[--><button class="mb-4 text-sm font-bold text-wine">← All events</button><img${ssrRenderAttr("src", unref(activeEvent).image)} class="h-56 w-full rounded-2xl object-cover"${ssrRenderAttr("alt", unref(activeEvent).title)}><p class="mt-5 text-xs font-bold uppercase tracking-[.16em] text-wine">${ssrInterpolate(unref(activeEvent).category)} · ${ssrInterpolate(unref(activeEvent).status)}</p><h1 class="serif mt-2 text-4xl leading-tight text-navy">${ssrInterpolate(unref(activeEvent).title)}</h1><p class="mt-3 text-sm font-bold text-navy">${ssrInterpolate(unref(activeEvent).date)}<br>${ssrInterpolate(unref(activeEvent).venue)}</p><p class="mt-4 leading-7 text-navy/70">${ssrInterpolate(unref(activeEvent).description)}</p><div class="mt-5 rounded-2xl bg-white p-4"><b class="text-sm text-navy">What to expect</b><!--[-->`);
          ssrRenderList(unref(activeEvent).highlights, (item) => {
            _push(`<div class="mt-3 flex gap-3 text-sm text-navy/70"><span class="text-wine">●</span>${ssrInterpolate(item)}</div>`);
          });
          _push(`<!--]--></div><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Register interest</button><!--]-->`);
        } else {
          _push(`<!--[--><p class="text-xs font-bold text-wine">${ssrInterpolate(unref(activeEvent).category.toUpperCase())}</p><h1 class="serif mt-2 text-4xl text-navy">${ssrInterpolate(unref(registered) ? "Registration submitted" : unref(activeEvent).title)}</h1>`);
          if (!unref(registered)) {
            _push(`<div><div class="mt-6 rounded-2xl bg-white p-4"><b>${ssrInterpolate(unref(activeEvent).date)}</b><small class="mt-1 block text-navy/60">${ssrInterpolate(unref(activeEvent).venue)}</small></div><input class="mt-3 w-full rounded-xl border border-navy/20 bg-white p-3" placeholder="Attendee name"><input class="mt-3 w-full rounded-xl border border-navy/20 bg-white p-3" placeholder="Email address"><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Submit demo registration</button></div>`);
          } else {
            _push(`<div class="mt-6 rounded-2xl bg-wine p-5 text-white"><b>We’ve received your registration.</b><p class="mt-2 text-sm text-white/70">A confirmation has been added to message history. Nothing has been charged.</p><button class="mt-5 rounded-lg bg-gold px-4 py-2 font-bold text-black">View message</button></div>`);
          }
          _push(`<!--]-->`);
        }
        _push(`</section>`);
      } else if (unref(route) === "membership" || unref(route) === "membership-types" || unref(route) === "membership-apply") {
        _push(`<section><div class="hero relative min-h-[250px] overflow-hidden p-5 pt-20 text-white"><img${ssrRenderAttr("src", _imports_3)} class="absolute inset-0 h-full w-full object-cover"><div class="relative z-10"><h1 class="serif text-4xl">Belong for life.</h1></div></div><div class="p-5">`);
        if (unref(route) === "membership") {
          _push(`<!--[--><button class="w-full rounded-xl bg-gold py-3 font-bold">Explore membership types</button><button class="mt-3 w-full rounded-xl border border-navy/20 bg-white py-3 font-bold">Start an application</button><!--]-->`);
        } else if (unref(route) === "membership-types") {
          _push(`<!--[--><h2 class="serif text-3xl text-navy">Membership types</h2><!--[-->`);
          ssrRenderList(["Youth · under 18", "Trial · ages 18–27", "Life · from age 28"], (x) => {
            _push(`<div class="mt-3 rounded-xl bg-white p-4">${ssrInterpolate(x)}</div>`);
          });
          _push(`<!--]--><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Apply now</button><!--]-->`);
        } else {
          _push(`<!--[--><h2 class="serif text-3xl text-navy">Start your application</h2><!--[-->`);
          ssrRenderList(["Full name", "Email address", "Mobile number", "Class of year"], (x) => {
            _push(`<input class="mt-3 w-full rounded-xl border border-navy/20 p-3"${ssrRenderAttr("placeholder", x)}>`);
          });
          _push(`<!--]--><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Submit application</button><!--]-->`);
        }
        _push(`</div></section>`);
      } else if (contentPages[unref(route)]) {
        _push(`<section class="p-5 py-8"><p class="text-xs font-bold tracking-[.16em] text-wine">${ssrInterpolate(contentPages[unref(route)].eyebrow.toUpperCase())}</p><h1 class="serif mt-3 text-4xl leading-tight text-navy">${ssrInterpolate(contentPages[unref(route)].title)}</h1><p class="mt-4 text-[15px] leading-7 text-navy/70">${ssrInterpolate(contentPages[unref(route)].intro)}</p><div class="mt-6 overflow-hidden rounded-2xl border border-navy/10 bg-white"><!--[-->`);
        ssrRenderList(contentPages[unref(route)].items, (item) => {
          _push(`<button class="flex w-full items-center justify-between border-b border-navy/10 p-4 text-left text-sm font-bold text-navy">${ssrInterpolate(item)} <span class="text-wine">›</span></button>`);
        });
        _push(`<!--]--></div>`);
        if (contentPages[unref(route)].cta) {
          _push(`<button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">${ssrInterpolate(contentPages[unref(route)].cta[0])}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else if (unref(route) === "login" || unref(route) === "claim") {
        _push(`<section class="p-5 py-10"><p class="text-xs font-bold text-wine">MEMBER ACCESS</p><h1 class="serif mt-3 text-4xl text-navy">${ssrInterpolate(unref(route) === "login" ? "Welcome back." : "Claim your account.")}</h1>`);
        if (unref(route) === "login") {
          _push(`<div class="mt-7 space-y-3"><button class="w-full rounded-xl bg-navy p-4 text-left text-white"><b>Edward Lau · Life member</b><small class="block text-white/60">Active member experience</small></button><button class="w-full rounded-xl bg-white p-4 text-left"><b>Brian Lee · Trial member</b></button><button class="w-full rounded-xl bg-wine p-4 text-left text-white"><b>Alex Chan · Suspended member</b><small class="block text-white/60">Payment recovery experience</small></button><button class="font-bold text-wine underline">Claim legacy account</button></div>`);
        } else {
          _push(`<div class="mt-6"><input class="w-full rounded-xl border p-3" placeholder="Email"><input class="mt-3 w-full rounded-xl border p-3" placeholder="One-time access code"><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Claim account</button></div>`);
        }
        _push(`</section>`);
      } else if (unref(route) === "portal-suspended") {
        _push(`<section class="p-5 py-9"><p class="text-xs font-bold text-wine">ACCOUNT RESTRICTED</p><h1 class="serif mt-3 text-4xl text-navy">Let’s restore your membership.</h1><div class="mt-6 rounded-2xl bg-wine p-5 text-white"><b>Life membership payment is overdue.</b><p class="mt-2 text-sm text-white/70">Directory and member event access are paused.</p></div><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Review payment reminder</button></section>`);
      } else if (unref(route) === "portal-home") {
        _push(`<section class="p-5 py-8"><p class="text-xs font-bold text-wine">MEMBER HOME</p><h1 class="serif mt-2 text-4xl text-navy">Hi, ${ssrInterpolate(unref(member) === "trial" ? "Brian" : "Edward")}.</h1><div class="mt-5 rounded-2xl bg-navy p-5 text-white"><b class="text-gold">${ssrInterpolate(unref(member) === "trial" ? "TRIAL" : "ACTIVE")}</b><h2 class="serif text-3xl">${ssrInterpolate(unref(member) === "trial" ? "Trial member" : "Life member")}</h2></div><div class="mt-4 grid grid-cols-2 gap-3"><button class="rounded-xl bg-white p-4 text-left"><b class="block text-2xl text-wine">248</b><small>Directory members</small></button><button class="rounded-xl bg-white p-4 text-left"><b class="block text-2xl text-wine">1</b><small>Featured event</small></button></div></section>`);
      } else if (unref(route) === "portal-profile") {
        _push(`<section class="p-5 py-8"><h1 class="serif text-4xl text-navy">My profile</h1><div class="mt-5 flex items-center gap-4"><b class="grid h-16 w-16 place-items-center rounded-full bg-gold">EL</b><span>Edward Lau<small class="block">Class of 2007</small></span></div><!--[-->`);
        ssrRenderList(["Email", "Mobile", "Industry", "Company"], (x) => {
          _push(`<input class="mt-3 w-full rounded-xl border p-3"${ssrRenderAttr("placeholder", x)}>`);
        });
        _push(`<!--]--><button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Save profile</button></section>`);
      } else if (unref(route) === "portal-directory") {
        _push(`<section class="p-5 py-8"><h1 class="serif text-4xl text-navy">Alumni directory</h1><div class="mt-5 flex gap-2 overflow-auto"><!--[-->`);
        ssrRenderList(["All", "Finance", "Legal", "Technology", "Design", "Medical"], (x) => {
          _push(`<button class="${ssrRenderClass([unref(filter) === x ? "bg-gold" : "bg-white", "shrink-0 rounded-full px-3 py-2 text-xs font-bold"])}">${ssrInterpolate(x)}</button>`);
        });
        _push(`<!--]--></div><!--[-->`);
        ssrRenderList(unref(shown), (p) => {
          _push(`<button class="mt-3 flex w-full justify-between rounded-xl bg-white p-4 text-left"><span><b>${ssrInterpolate(p[0])}</b><small class="block">${ssrInterpolate(p[1])} · ${ssrInterpolate(p[2])}</small></span><span>›</span></button>`);
        });
        _push(`<!--]--></section>`);
      } else if (unref(route) === "portal-membership") {
        _push(`<section class="p-5 py-8"><h1 class="serif text-4xl text-navy">${ssrInterpolate(unref(member) === "suspended" ? "Payment recovery" : "Your membership")}</h1><div class="mt-6 rounded-xl bg-white p-5"><b>${ssrInterpolate(unref(member) === "suspended" ? "Life payment overdue" : "Membership active")}</b><p class="mt-2 text-sm">${ssrInterpolate(unref(member) === "suspended" ? "Access returns immediately after demo payment." : "Your record is up to date.")}</p></div>`);
        if (unref(member) === "suspended") {
          _push(`<button class="mt-5 w-full rounded-xl bg-gold py-3 font-bold">Complete demo payment</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<section class="p-5 py-8"><h1 class="serif text-4xl text-navy">Message history</h1><!--[-->`);
        ssrRenderList(["Annual Dinner registration received", "Profile updated", "Life membership reminder"], (x) => {
          _push(`<article class="mt-4 rounded-xl bg-white p-4"><small class="font-bold text-wine">EMAIL + WHATSAPP</small><b class="block">${ssrInterpolate(x)}</b></article>`);
        });
        _push(`<!--]--></section>`);
      }
      if (!unref(portal)) {
        _push(`<footer class="bg-[#07131f] px-5 py-8 text-white"><div class="flex items-center gap-3"><img${ssrRenderAttr("src", _imports_0)} class="h-14 w-12 object-contain"><div><b class="serif text-2xl">DSOBA</b><small class="block text-white/50">Dalton School Old Boys’ Association</small></div></div><p class="mt-5 text-sm leading-6 text-white/60">Connecting alumni across generations, professions and places.</p><div class="mt-7 grid grid-cols-2 gap-x-5"><div><b class="text-xs tracking-wider text-gold">EXPLORE</b><!--[-->`);
        ssrRenderList([["Home", "home"], ["About DSOBA", "about"], ["Mission", "about"], ["Committees", "about"], ["Chapters & Groups", "chapters"]], (x) => {
          _push(`<button class="block py-2 text-left text-sm text-white/75">${ssrInterpolate(x[0])}</button>`);
        });
        _push(`<!--]--></div><div><b class="text-xs tracking-wider text-gold">DISCOVER</b><!--[-->`);
        ssrRenderList([["DSOBA News", "news"], ["Upcoming Events", "events"], ["Past Events", "events"], ["Annual Dinner", "event-detail"], ["Membership", "membership"]], (x) => {
          _push(`<button class="block py-2 text-left text-sm text-white/75">${ssrInterpolate(x[0])}</button>`);
        });
        _push(`<!--]--></div><div class="mt-5"><b class="text-xs tracking-wider text-gold">MEMBERSHIP</b><!--[-->`);
        ssrRenderList([["Why Join", "membership"], ["Life / Trial / Youth", "membership-types"], ["Apply Now", "membership-apply"], ["Enquiry", "membership"], ["DSOBA Credit Card", "membership"]], (x) => {
          _push(`<button class="block py-2 text-left text-sm text-white/75">${ssrInterpolate(x[0])}</button>`);
        });
        _push(`<!--]--></div><div class="mt-5"><b class="text-xs tracking-wider text-gold">MEMBER SERVICES</b><button class="block py-2 text-left text-sm text-white/75">Member login</button><button class="block py-2 text-left text-sm text-white/75">Claim account</button><button class="block py-2 text-left text-sm text-white/75">Alumni directory</button><button class="block py-2 text-left text-sm text-white/75">Contact / WhatsApp</button></div></div><div class="mt-7 border-t border-white/10 pt-5"><div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/45"><button>Useful Links</button><button>Privacy Policy</button><button>Terms &amp; Conditions</button><button>Personal Data</button></div><p class="mt-5 text-[11px] text-white/35">© 2026 DSOBA · Mobile stakeholder demo</p></div></footer>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(toast)) {
        _push(`<div class="fixed bottom-5 left-1/2 z-40 w-[calc(100%-3rem)] max-w-[380px] -translate-x-1/2 rounded-xl bg-navy p-3 text-center text-sm font-bold text-white">${ssrInterpolate(unref(toast))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-BokZdymi.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-DX_iIo_h.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, entry_default as default, encodeRoutePath as e, navigateTo as n, resolveRouteObject as r, tryUseNuxtApp as t, useRouter as u };;globalThis.__timing__.logEnd('Load chunks/build/server');
//# sourceMappingURL=server.mjs.map
