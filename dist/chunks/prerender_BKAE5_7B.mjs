import { prependForwardSlash } from '@astrojs/internal-helpers/path';
/* empty css                         */
import { c as createAstro, a as createComponent, r as renderTemplate, b as addAttribute, m as maybeRenderHead, s as spreadAttributes, d as renderSlot, e as renderComponent, f as renderHead, A as AstroError, U as UnknownContentCollectionError, g as renderUniqueStylesheet, h as renderScriptElement, i as createHeadAndContent, u as unescapeHTML } from './astro_DKsuLc-H.mjs';
import 'kleur/colors';
/* empty css                         */
/* empty css                         */
import 'clsx';
/* empty css                          */
/* empty css                         */
/* empty css                         */
/* empty css                         */
/* empty css                         */
/* empty css                         */
/* empty css                         */
import rss from '@astrojs/rss';
/* empty css                         */
/* empty css                          */
import { atom } from 'nanostores';
import { persistentAtom, persistentMap } from '@nanostores/persistent';
/* empty css                          */

const $$Astro$n = createAstro("https://laalquimia.github.io");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$n, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  const { title, description, image = "/emaTendence.png" } = Astro2.props;
  return renderTemplate`<!-- Global Metadata --><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.ico"><meta name="generator"${addAttribute(Astro2.generator, "content")}><!-- Canonical URL --><link rel="canonical"${addAttribute(canonicalURL, "href")}><!-- Primary Meta Tags --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(Astro2.url, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(new URL(image, Astro2.url), "content")}><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"${addAttribute(Astro2.url, "content")}><meta property="twitter:title"${addAttribute(title, "content")}><meta property="twitter:description"${addAttribute(description, "content")}><meta property="twitter:image"${addAttribute(new URL(image, Astro2.url), "content")}>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/BaseHead.astro", void 0);

const $$Astro$m = createAstro("https://laalquimia.github.io");
const $$HeaderLink = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$m, $$props, $$slots);
  Astro2.self = $$HeaderLink;
  const { href, class: className, ...props } = Astro2.props;
  const { pathname } = Astro2.url;
  const subpath = pathname.match(/[^\/]+/g);
  const isActive = href === pathname || href === "/" + subpath?.[0];
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(["hover:scale-105", [className, { active: isActive }]], "class:list")}${spreadAttributes(props)} data-astro-cid-eimmu3lg> ${renderSlot($$result, $$slots["default"])} </a> `;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/HeaderLink.astro", void 0);

const SITE_TITLE = "🐢 La Alquimia";
const SITE_DESCRIPTION = "La Alquimia Tools for Traders";

const $$Astro$l = createAstro("https://laalquimia.github.io");
const $$Header = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$l, $$props, $$slots);
  Astro2.self = $$Header;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 w-full glass-header" data-astro-cid-3ef6ksr2> <nav data-astro-cid-3ef6ksr2> <h2 class="brand-title" data-astro-cid-3ef6ksr2><a href="/" data-astro-cid-3ef6ksr2>${SITE_TITLE}</a></h2> <div class="internal-links" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/", "data-astro-cid-3ef6ksr2": true }, { "default": ($$result2) => renderTemplate`Home` })} ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/blog", "data-astro-cid-3ef6ksr2": true }, { "default": ($$result2) => renderTemplate`Blog` })} ${renderComponent($$result, "HeaderLink", $$HeaderLink, { "href": "/bot", "data-astro-cid-3ef6ksr2": true }, { "default": ($$result2) => renderTemplate`Bot` })} <!-- <HeaderLink href="/stake">Stake</HeaderLink> --> </div> <div class="social-links" data-astro-cid-3ef6ksr2> ${renderComponent($$result, "Balance", null, { "client:only": true, "client:component-hydration": "only", "data-astro-cid-3ef6ksr2": true, "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/balance/Balance.svelte", "client:component-export": "default" })} </div> </nav> </header> `;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/Header.astro", void 0);

const isLogin = atom(false);
atom(false); 
persistentAtom( false );
persistentAtom( 0 );
persistentAtom('config','basic');

persistentMap(
    {
        address: '',
        balance: 0,
});

const $$Astro$k = createAstro("https://laalquimia.github.io");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$k, $$props, $$slots);
  Astro2.self = $$Footer;
  const today = /* @__PURE__ */ new Date();
  isLogin.get();
  return renderTemplate`${maybeRenderHead()}<footer data-astro-cid-sz7xmlte>
&copy; ${today.getFullYear()} La Alquimia.
<div class="social-links" data-astro-cid-sz7xmlte> <a href="https://x.com/laalquimiaorg" target="_blank" data-astro-cid-sz7xmlte> <span class="sr-only" data-astro-cid-sz7xmlte>Follow La Alquimia on Twitter</span> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" astro-icon="social/twitter" data-astro-cid-sz7xmlte><path fill="currentColor" d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" data-astro-cid-sz7xmlte></path></svg> </a> <a href="https://github.com/laalquimia" target="_blank" data-astro-cid-sz7xmlte> <span class="sr-only" data-astro-cid-sz7xmlte>Go to La Alquimia GitHub repo</span> <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32" astro-icon="social/github" data-astro-cid-sz7xmlte><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" data-astro-cid-sz7xmlte></path></svg> </a> <a href="https://t.me/la_alquimia" target="_blank" data-astro-cid-sz7xmlte> <span class="sr-only" data-astro-cid-sz7xmlte>Go to La La Alquimia Group</span> <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" data-astro-cid-sz7xmlte><g id="SVGRepo_bgCarrier" stroke-width="0" data-astro-cid-sz7xmlte></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-sz7xmlte></g><g id="SVGRepo_iconCarrier" data-astro-cid-sz7xmlte> <path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM12.43 8.85893C11.2629 9.3444 8.93015 10.3492 5.43191 11.8733C4.86385 12.0992 4.56628 12.3202 4.53919 12.5363C4.4934 12.9015 4.95073 13.0453 5.57349 13.2411C5.6582 13.2678 5.74598 13.2954 5.83596 13.3246C6.44866 13.5238 7.27284 13.7568 7.70131 13.766C8.08996 13.7744 8.52375 13.6142 9.00266 13.2853C12.2712 11.079 13.9584 9.96381 14.0643 9.93977C14.1391 9.92281 14.2426 9.90148 14.3128 9.96385C14.3829 10.0262 14.3761 10.1443 14.3686 10.176C14.3233 10.3691 12.5281 12.0381 11.5991 12.9018C11.3095 13.171 11.1041 13.362 11.0621 13.4056C10.968 13.5034 10.8721 13.5958 10.78 13.6846C10.2108 14.2333 9.78393 14.6448 10.8036 15.3168C11.2937 15.6397 11.6858 15.9067 12.077 16.1731C12.5042 16.4641 12.9303 16.7543 13.4816 17.1157C13.6221 17.2078 13.7562 17.3034 13.8869 17.3965C14.3841 17.751 14.8308 18.0694 15.3826 18.0186C15.7033 17.9891 16.0345 17.6876 16.2027 16.7884C16.6002 14.6632 17.3816 10.0585 17.5622 8.16098C17.5781 7.99473 17.5582 7.78197 17.5422 7.68858C17.5262 7.59518 17.4928 7.46211 17.3714 7.3636C17.2276 7.24694 17.0057 7.22234 16.9064 7.22408C16.455 7.23204 15.7626 7.47282 12.43 8.85893Z" fill="currentColor" data-astro-cid-sz7xmlte></path> </g></svg> </a> </div> </footer> `;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/Footer.astro", void 0);

const $$Astro$j = createAstro("https://laalquimia.github.io");
const $$Index$9 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$j, $$props, $$slots);
  Astro2.self = $$Index$9;
  return renderTemplate`<html lang="es" data-astro-cid-3slt56y2> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": "La Alquimia - Arbitraje", "description": "Arbitraje", "data-astro-cid-3slt56y2": true })}${renderHead()}</head> <body data-astro-cid-3slt56y2> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-3slt56y2": true })} <div id="ppal" class="flex flex-col items-center justify-center w-full" data-astro-cid-3slt56y2> <h3 data-astro-cid-3slt56y2>Arbitraje</h3> <div class="order-book-container text-white" data-astro-cid-3slt56y2> <div id="btcusdttable" class="order-book" data-astro-cid-3slt56y2> <h4 data-astro-cid-3slt56y2>BTCUSDT</h4> <div id="BTCUSDTaskprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Ask</p> </div> <div id="BTCUSDTbidprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Bid</p> </div> </div> <div id="ETHBTCtable" class="order-book" data-astro-cid-3slt56y2> <h4 data-astro-cid-3slt56y2>ETHBTC</h4> <div id="ETHBTCaskprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Ask</p> </div> <div id="ETHBTCbidprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Bid</p> </div> </div> <div id="ETHusdttable" class="order-book" data-astro-cid-3slt56y2> <h4 data-astro-cid-3slt56y2>ETHUSDT</h4> <div id="ETHUSDTaskprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Ask</p> </div> <div id="ETHUSDTbidprice" data-astro-cid-3slt56y2> <p data-astro-cid-3slt56y2>Bid</p> </div> </div> </div> <div id="arbitrageResult" class="flex flex-col items-center justify-center text-white w-full mt-5" data-astro-cid-3slt56y2></div> </div> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-3slt56y2": true })}  </body> </html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/arbitraje/index.astro", void 0);

const $$file$a = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/arbitraje/index.astro";
const $$url$a = "/arbitraje";

const index$9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$9,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1)
      continue;
    const collection = segments[0];
    collectionToGlobResultMap[collection] ??= {};
    collectionToGlobResultMap[collection][key] = globResult[key];
  }
  return collectionToGlobResultMap;
}
const cacheEntriesByCollection = /* @__PURE__ */ new Map();
function createGetCollection({
  contentCollectionToEntryMap,
  dataCollectionToEntryMap,
  getRenderEntryImport
}) {
  return async function getCollection(collection, filter) {
    let type;
    if (collection in contentCollectionToEntryMap) {
      type = "content";
    } else if (collection in dataCollectionToEntryMap) {
      type = "data";
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Ensure a collection directory with this name exists.`
      );
      return;
    }
    const lazyImports = Object.values(
      type === "content" ? contentCollectionToEntryMap[collection] : dataCollectionToEntryMap[collection]
    );
    let entries = [];
    if (!Object.assign({"PUBLIC_WALLETCONNECT_PROJECT_ID": "e4a4e920cd46c4b766fb33d1051ed19b", "BASE_URL": "/", "MODE": "production", "DEV": false, "PROD": true, "SSR": true, "SITE": "https://laalquimia.github.io", "ASSETS_PREFIX": undefined}, { _: process.env._ })?.DEV && cacheEntriesByCollection.has(collection)) {
      entries = [...cacheEntriesByCollection.get(collection)];
    } else {
      entries = await Promise.all(
        lazyImports.map(async (lazyImport) => {
          const entry = await lazyImport();
          return type === "content" ? {
            id: entry.id,
            slug: entry.slug,
            body: entry.body,
            collection: entry.collection,
            data: entry.data,
            async render() {
              return render({
                collection: entry.collection,
                id: entry.id,
                renderEntryImport: await getRenderEntryImport(collection, entry.slug)
              });
            }
          } : {
            id: entry.id,
            collection: entry.collection,
            data: entry.data
          };
        })
      );
      cacheEntriesByCollection.set(collection, entries);
    }
    if (typeof filter === "function") {
      return entries.filter(filter);
    } else {
      return entries;
    }
  };
}
async function render({
  collection,
  id,
  renderEntryImport
}) {
  const UnexpectedRenderError = new AstroError({
    ...UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
  });
  if (typeof renderEntryImport !== "function")
    throw UnexpectedRenderError;
  const baseMod = await renderEntryImport();
  if (baseMod == null || typeof baseMod !== "object")
    throw UnexpectedRenderError;
  const { default: defaultMod } = baseMod;
  if (isPropagatedAssetsModule(defaultMod)) {
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
    if (typeof getMod !== "function")
      throw UnexpectedRenderError;
    const propagationMod = await getMod();
    if (propagationMod == null || typeof propagationMod !== "object")
      throw UnexpectedRenderError;
    const Content = createComponent({
      factory(result, baseProps, slots) {
        let styles = "", links = "", scripts = "";
        if (Array.isArray(collectedStyles)) {
          styles = collectedStyles.map((style) => {
            return renderUniqueStylesheet(result, {
              type: "inline",
              content: style
            });
          }).join("");
        }
        if (Array.isArray(collectedLinks)) {
          links = collectedLinks.map((link) => {
            return renderUniqueStylesheet(result, {
              type: "external",
              src: prependForwardSlash(link)
            });
          }).join("");
        }
        if (Array.isArray(collectedScripts)) {
          scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
        }
        let props = baseProps;
        if (id.endsWith("mdx")) {
          props = {
            components: propagationMod.components ?? {},
            ...baseProps
          };
        }
        return createHeadAndContent(
          unescapeHTML(styles + links + scripts),
          renderTemplate`${renderComponent(
            result,
            "Content",
            propagationMod.Content,
            props,
            slots
          )}`
        );
      },
      propagation: "self"
    });
    return {
      Content,
      headings: propagationMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
    };
  } else if (baseMod.Content && typeof baseMod.Content === "function") {
    return {
      Content: baseMod.Content,
      headings: baseMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: baseMod.frontmatter ?? {}
    };
  } else {
    throw UnexpectedRenderError;
  }
}
function isPropagatedAssetsModule(module) {
  return typeof module === "object" && module != null && "__astroPropagation" in module;
}

// astro-head-inject

const contentDir = '/src/content/';

const contentEntryGlob = /* #__PURE__ */ Object.assign({"/src/content/blog/linear-regression.md": () => import('./linear-regression_Oyyo6nei.mjs'),"/src/content/blog/mean-in-trading.md": () => import('./mean-in-trading_CPNNRSgT.mjs'),"/src/content/blog/mean-reversion-tutorial.md": () => import('./mean-reversion-tutorial_DKrnHht6.mjs'),"/src/content/blog/stddev.md": () => import('./stddev_CXV3v_25.mjs'),"/src/content/blog/tendences-basic.md": () => import('./tendences-basic_D9EF1eau.mjs'),"/src/content/blog/trading-nivel-0.md": () => import('./trading-nivel-0_CXM3a8uV.mjs'),"/src/content/blog/trading-nivel-1.md": () => import('./trading-nivel-1_BXku3FsV.mjs')});
const contentCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: contentEntryGlob,
	contentDir,
});

const dataEntryGlob = /* #__PURE__ */ Object.assign({});
const dataCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: dataEntryGlob,
	contentDir,
});
createCollectionToGlobResultMap({
	globResult: { ...contentEntryGlob, ...dataEntryGlob },
	contentDir,
});

let lookupMap = {};
lookupMap = {"blog":{"type":"content","entries":{"linear-regression":"/src/content/blog/linear-regression.md","mean-in-trading":"/src/content/blog/mean-in-trading.md","stddev":"/src/content/blog/stddev.md","mean-reversion-tutorial":"/src/content/blog/mean-reversion-tutorial.md","tendences-basic":"/src/content/blog/tendences-basic.md","trading-nivel-0":"/src/content/blog/trading-nivel-0.md","trading-nivel-1":"/src/content/blog/trading-nivel-1.md"}}};

function createGlobLookup(glob) {
	return async (collection, lookupId) => {
		const filePath = lookupMap[collection]?.entries[lookupId];

		if (!filePath) return undefined;
		return glob[collection][filePath];
	};
}

const renderEntryGlob = /* #__PURE__ */ Object.assign({"/src/content/blog/linear-regression.md": () => import('./linear-regression_B1UIFPj8.mjs'),"/src/content/blog/mean-in-trading.md": () => import('./mean-in-trading_DVMREHrr.mjs'),"/src/content/blog/mean-reversion-tutorial.md": () => import('./mean-reversion-tutorial_BtO3UhkH.mjs'),"/src/content/blog/stddev.md": () => import('./stddev_h5_-iGue.mjs'),"/src/content/blog/tendences-basic.md": () => import('./tendences-basic_CHvD-RxE.mjs'),"/src/content/blog/trading-nivel-0.md": () => import('./trading-nivel-0_DfU-A74z.mjs'),"/src/content/blog/trading-nivel-1.md": () => import('./trading-nivel-1_D6tTVWUM.mjs')});
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
	globResult: renderEntryGlob,
	contentDir,
});

const getCollection = createGetCollection({
	contentCollectionToEntryMap,
	dataCollectionToEntryMap,
	getRenderEntryImport: createGlobLookup(collectionToRenderEntryMap),
});

const $$Astro$i = createAstro("https://laalquimia.github.io");
const $$FormattedDate = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$i, $$props, $$slots);
  Astro2.self = $$FormattedDate;
  const { date } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<time${addAttribute(date.toISOString(), "datetime")}> ${date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })} </time>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/FormattedDate.astro", void 0);

const $$Astro$h = createAstro("https://laalquimia.github.io");
const $$Index$8 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$h, $$props, $$slots);
  Astro2.self = $$Index$8;
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return renderTemplate`<html lang="en" data-astro-cid-5tznm7mj> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION, "data-astro-cid-5tznm7mj": true })}${renderHead()}</head> <body data-astro-cid-5tznm7mj> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-5tznm7mj": true })} <main data-astro-cid-5tznm7mj> <section class="py-5" data-astro-cid-5tznm7mj> <ul data-astro-cid-5tznm7mj> ${posts.map((post) => renderTemplate`<li data-astro-cid-5tznm7mj> <a${addAttribute(`/blog/${post.slug}/`, "href")} data-astro-cid-5tznm7mj> <img${addAttribute(720, "width")}${addAttribute(360, "height")}${addAttribute(post.data.heroImage, "src")} alt="" data-astro-cid-5tznm7mj> <h4 class="text-gray-300" data-astro-cid-5tznm7mj>${post.data.title}</h4> <p class="date" data-astro-cid-5tznm7mj> ${renderComponent($$result, "FormattedDate", $$FormattedDate, { "date": post.data.pubDate, "data-astro-cid-5tznm7mj": true })} </p> </a> </li>`)} </ul> </section> </main> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-5tznm7mj": true })} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/blog/index.astro", void 0);

const $$file$9 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/blog/index.astro";
const $$url$9 = "/blog";

const index$8 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$8,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$g = createAstro("https://laalquimia.github.io");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, description, pubDate, updatedDate, heroImage } = Astro2.props;
  return renderTemplate`<html lang="en" data-astro-cid-bvzihdzo> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description, "data-astro-cid-bvzihdzo": true })}${renderHead()}</head> <body data-astro-cid-bvzihdzo> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-bvzihdzo": true })} <main data-astro-cid-bvzihdzo> <article class="" data-astro-cid-bvzihdzo> <div class="prose" data-astro-cid-bvzihdzo> <div class="title" data-astro-cid-bvzihdzo> <div class="date" data-astro-cid-bvzihdzo> ${renderComponent($$result, "FormattedDate", $$FormattedDate, { "date": pubDate, "data-astro-cid-bvzihdzo": true })} ${updatedDate && renderTemplate`<div class="last-updated-on" data-astro-cid-bvzihdzo>
Last updated on ${renderComponent($$result, "FormattedDate", $$FormattedDate, { "date": updatedDate, "data-astro-cid-bvzihdzo": true })} </div>`} </div> <div class="hero-image py-5 w-1/2 md:w-1/2" data-astro-cid-bvzihdzo> ${heroImage && renderTemplate`<img${addAttribute(720, "width")}${addAttribute(520, "height")}${addAttribute(heroImage, "src")} alt="" data-astro-cid-bvzihdzo>`} </div> <h1 data-astro-cid-bvzihdzo>${title}</h1> <hr data-astro-cid-bvzihdzo> </div> ${renderSlot($$result, $$slots["default"])} </div> </article> </main> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-bvzihdzo": true })} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/layouts/BlogPost.astro", void 0);

const $$Astro$f = createAstro("https://laalquimia.github.io");
async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: post
  }));
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$;
  const post = Astro2.props;
  const { Content } = await post.render();
  return renderTemplate`${renderComponent($$result, "BlogPost", $$BlogPost, { ...post.data }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Content", Content, {})} ` })}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/blog/[...slug].astro", void 0);

const $$file$8 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/blog/[...slug].astro";
const $$url$8 = "/blog/[...slug]";

const ____slug_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$,
	file: $$file$8,
	getStaticPaths,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

/** @returns {void} */

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;

/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 * @param {unknown} value
 * @returns {string}
 */
function escape(value, is_attr = false) {
	const str = String(value);
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = '';
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}
	return escaped + str.substring(last);
}

/** @returns {string} */
function each(items, fn) {
	items = ensure_array_like(items);
	let str = '';
	for (let i = 0; i < items.length; i += 1) {
		str += fn(items[i], i);
	}
	return str;
}

function validate_component(component, name) {
	if (!component || !component.$$render) {
		if (name === 'svelte:component') name += ' this={...}';
		throw new Error(
			`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`
		);
	}
	return component;
}

let on_destroy;

/** @returns {{ render: (props?: {}, { $$slots, context }?: { $$slots?: {}; context?: Map<any, any>; }) => { html: any; css: { code: string; map: any; }; head: string; }; $$render: (result: any, props: any, bindings: any, slots: any, context: any) => any; }} */
function create_ssr_component(fn) {
	function $$render(result, props, bindings, slots, context) {
		const parent_component = current_component;
		const $$ = {
			on_destroy,
			context: new Map(context || (parent_component ? parent_component.$$.context : [])),
			// these will be immediately discarded
			on_mount: [],
			before_update: [],
			after_update: [],
			callbacks: blank_object()
		};
		set_current_component({ $$ });
		const html = fn(result, props, bindings, slots);
		set_current_component(parent_component);
		return html;
	}
	return {
		render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
			on_destroy = [];
			const result = { title: '', head: '', css: new Set() };
			const html = $$render(result, props, {}, $$slots, context);
			run_all(on_destroy);
			return {
				html,
				css: {
					code: Array.from(result.css)
						.map((css) => css.code)
						.join('\n'),
					map: null // TODO
				},
				head: result.title + result.head
			};
		},
		$$render
	};
}

/** @returns {string} */
function add_attribute(name, value, boolean) {
	if (value == null || (boolean && !value)) return '';
	const assignment = boolean && value === true ? '' : `="${escape(value, true)}"`;
	return ` ${name}${assignment}`;
}

const contractAddress = "0xd78be833ed889929b50d2ad3ab7ba94f76a9a8bf";
const tokenIds = [1,2,3];
const botUrl = [ `meanRev`,`meanRevBinance`,`TraderBot`] ;
const botNames = [ `Bybit Mean Rev`,`Binance Mean Rev`,`Trader`] ;
const botImages = [ `botMeanRev1.png`, `BinanceMRBot.png`, `TraderBot.png`] ;
const openseaLink = `https://opensea.io/assets/base/${contractAddress}`;

/* src/components/chart/GlassSelector.svelte generated by Svelte v4.2.12 */

const css$4 = {
	code: ".glass-selector-container.svelte-zcwq76{position:relative;display:inline-block;min-width:160px;font-family:inherit;z-index:9999}.hidden-native-select.svelte-zcwq76{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}.glass-trigger.svelte-zcwq76{width:100%;background:rgba(255, 255, 255, 0.05);backdrop-filter:blur(12px) saturate(180%);-webkit-backdrop-filter:blur(12px) saturate(180%);border:1px solid rgba(255, 255, 255, 0.12);border-radius:12px;color:#fff;padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:0 4px 30px rgba(0, 0, 0, 0.2), \n                inset 0 1px 1px rgba(255, 255, 255, 0.1)}.glass-trigger.svelte-zcwq76:hover{background:rgba(255, 255, 255, 0.1);border-color:rgba(255, 255, 255, 0.25);box-shadow:0 4px 30px rgba(0, 0, 0, 0.3),\n                0 0 10px rgba(255, 255, 255, 0.1),\n                inset 0 1px 1px rgba(255, 255, 255, 0.2);transform:translateY(-1px)}.glass-trigger.svelte-zcwq76:active{transform:translateY(0)}.symbol-label.svelte-zcwq76{letter-spacing:0.5px}.arrow-icon.svelte-zcwq76{display:inline-flex;align-items:center;transition:transform 0.3s ease;opacity:0.7}.arrow-icon.rotated.svelte-zcwq76{transform:rotate(180deg);opacity:1}.glass-dropdown.svelte-zcwq76{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:99999;background:rgba(15, 20, 35, 0.95);backdrop-filter:blur(20px) saturate(190%);-webkit-backdrop-filter:blur(20px) saturate(190%);border:1px solid rgba(255, 255, 255, 0.08);border-radius:14px;box-shadow:0 20px 40px rgba(0, 0, 0, 0.5),\n                inset 0 1px 0 rgba(255, 255, 255, 0.05);overflow:hidden;animation:svelte-zcwq76-slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)}@keyframes svelte-zcwq76-slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}.search-container.svelte-zcwq76{display:flex;align-items:center;padding:8px 12px;background:rgba(255, 255, 255, 0.04);border-bottom:1px solid rgba(255, 255, 255, 0.06);animation:svelte-zcwq76-fadeIn 0.15s ease-out}@keyframes svelte-zcwq76-fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.search-icon.svelte-zcwq76{color:rgba(255, 255, 255, 0.4);margin-right:8px}.search-input.svelte-zcwq76{flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:13px;padding:4px 0;font-family:inherit}.search-input.svelte-zcwq76::-moz-placeholder{color:rgba(255, 255, 255, 0.35)}.search-input.svelte-zcwq76::placeholder{color:rgba(255, 255, 255, 0.35)}.clear-search.svelte-zcwq76{background:transparent;border:none;color:rgba(255, 255, 255, 0.5);font-size:16px;cursor:pointer;padding:0 4px;transition:color 0.2s}.clear-search.svelte-zcwq76:hover{color:#fff}.options-list.svelte-zcwq76{list-style:none;padding:6px;margin:0;max-height:250px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255, 255, 255, 0.15) transparent}.options-list.svelte-zcwq76::-webkit-scrollbar{width:6px}.options-list.svelte-zcwq76::-webkit-scrollbar-track{background:transparent}.options-list.svelte-zcwq76::-webkit-scrollbar-thumb{background:rgba(255, 255, 255, 0.15);border-radius:10px}.option-item.svelte-zcwq76{padding:10px 14px;font-size:13px;border-radius:10px;color:rgba(255, 255, 255, 0.8);cursor:pointer;transition:all 0.2s ease;-webkit-user-select:none;-moz-user-select:none;user-select:none}.option-item.svelte-zcwq76:hover{background:rgba(255, 255, 255, 0.08);color:#fff;padding-left:16px}.option-item.selected.svelte-zcwq76{background:rgba(255, 255, 255, 0.12);color:#40cde0;font-weight:700}.priority-badge.svelte-zcwq76{background:rgba(64, 205, 224, 0.15);border:1px solid rgba(64, 205, 224, 0.3);color:#40cde0;font-size:10px;padding:1px 6px;border-radius:6px;font-weight:bold;letter-spacing:0.5px}.empty-state.svelte-zcwq76{padding:20px;pointer-events:none}",
	map: null
};

const GlassSelector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { id = "symbolSelector" } = $$props;
	let { className = "" } = $$props;
	let { defaultValue = "BTCUSDT" } = $$props;
	let hiddenSelect;
	let selectedValue = defaultValue;
	let isOpen = false;

	// Handle typing to trigger search when selector is open or focused
	function handleKeyDown(event) {
		return;
	}

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeyDown);
	});

	if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
	if ($$props.className === void 0 && $$bindings.className && className !== void 0) $$bindings.className(className);
	if ($$props.defaultValue === void 0 && $$bindings.defaultValue && defaultValue !== void 0) $$bindings.defaultValue(defaultValue);
	$$result.css.add(css$4);

	return `<div class="${"glass-selector-container " + escape(className, true) + " svelte-zcwq76"}"> <select${add_attribute("id", id, 0)} class="hidden-native-select svelte-zcwq76"${add_attribute("this", hiddenSelect, 0)}>${slots.default ? slots.default({}) : ``}</select>  <button type="button" class="glass-trigger flex justify-between items-center svelte-zcwq76" aria-haspopup="listbox"${add_attribute("aria-expanded", isOpen, 0)}><span class="symbol-label svelte-zcwq76">${escape(selectedValue || "Seleccionar...")}</span> <span class="${["arrow-icon svelte-zcwq76", ""].join(' ').trim()}" data-svelte-h="svelte-1mmktbl"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span></button>  ${``} </div>`;
});

/* src/components/chart/ChartSv.svelte generated by Svelte v4.2.12 */

const css$3 = {
	code: ".liquid-glass-card.svelte-6f2vhm.svelte-6f2vhm{background:rgba(255, 255, 255, 0.03);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border:1px solid rgba(255, 255, 255, 0.08);box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.37);border-radius:16px;transition:all 0.3s ease}.liquid-glass-card.svelte-6f2vhm.svelte-6f2vhm:hover{border-color:rgba(255, 255, 255, 0.12);box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.5)}.glass-table.svelte-6f2vhm th.svelte-6f2vhm{background:rgba(255, 255, 255, 0.05) !important;border-bottom:1px solid rgba(255, 255, 255, 0.1);color:rgba(255, 255, 255, 0.8) !important}.glass-table.svelte-6f2vhm.svelte-6f2vhm{border-collapse:separate;border-spacing:0}.glow-container.svelte-6f2vhm.svelte-6f2vhm{position:relative}.glow-container.svelte-6f2vhm.svelte-6f2vhm::before{content:\"\";position:absolute;width:300px;height:300px;background:radial-gradient(circle, rgba(64, 205, 224, 0.15) 0%, rgba(0,0,0,0) 70%);top:-50px;left:-50px;z-index:-1;pointer-events:none}",
	map: null
};

const ChartSv = create_ssr_component(($$result, $$props, $$bindings, slots) => {

	$$result.css.add(css$3);

	return `    ${``}`;
});

const $$Astro$e = createAstro("https://laalquimia.github.io");
const $$BotSelector$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$BotSelector$1;
  return renderTemplate`${maybeRenderHead()}<span> <div class="mx-3 rounded-xl text-white text-bold text-2xl"> <div> 🚀Bot
<select class="bg-black"> <option>Bibyt Futures</option> <!-- underlined option --> <option>BUY Binance Futures</option> <option>BUY Bybit Spot</option> <option>BUY Binance Spot</option> </select> </div> </div> </span>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/toolbar/BotSelector.astro", void 0);

const $$Astro$d = createAstro("https://laalquimia.github.io");
const $$ToolBar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$ToolBar;
  return renderTemplate`${maybeRenderHead()}<div class="bg-black mt-3 rounded-xl items-center mx-5 w-vw flex justify-between"> ${renderComponent($$result, "BotSelector", $$BotSelector$1, {})} <nav> <div class="space-x-5"> <a href="https://pancakeswap.finance/swap?outputCurrency=0x4b48c0db4e460c894BFC031d602A5c3B57a26857&inputCurrency=0x55d398326f99059fF775485246999027B3197955&chain=bsc" target="_blank">
Buy ALQ </a> <a href="https://partner.bybit.com/b/LaAlquimia" target="_blank">Trade on Bybit</a> </div> </nav> <svg class="mx-5" width="64px" height="64px" viewBox="-3.2 -3.2 38.40 38.40" fill="#ffffff" stroke="#ffffff" stroke-width="2.048"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.8320000000000001"></g><g id="SVGRepo_iconCarrier"><title>file_type_config</title><path d="M23.265,24.381l.9-.894c4.164.136,4.228-.01,4.411-.438l1.144-2.785L29.805,20l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89,2.936-3.038,2.765-3.461L28.538,9.225c-.171-.422-.236-.587-4.37-.474l-.9-.93a20.166,20.166,0,0,0-.141-4.106l-.116-.263-2.974-1.3c-.438-.2-.592-.272-3.4,2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149,3.182c-.433.175-.586.237-.418,4.437l-.893.89c-4.162-.136-4.226.012-4.407.438L2.285,11.733,2.195,12l.094.232c.049.12.194.48,2.8,2.962l0,1.3c-3,2.89-2.935,3.038-2.763,3.462l1.138,2.817c.174.431.236.584,4.369.476l.9.935a20.243,20.243,0,0,0,.137,4.1l.116.265,2.993,1.308c.435.182.586.247,3.386-2.8l1.262.016c2.895,3.09,3.043,3.03,3.466,2.859l2.759-1.115C23.288,28.644,23.44,28.583,23.265,24.381ZM11.407,17.857a4.957,4.957,0,1,1,6.488,2.824A5.014,5.014,0,0,1,11.407,17.857Z" style="fill:#99b8c400"></path></g></svg> </div>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/toolbar/ToolBar.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$Astro$c = createAstro("https://laalquimia.github.io");
const $$Calc = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Calc;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", "  ", `<div class="liquid-glass-card max-w-2xl mx-auto p-8 space-y-6" data-astro-cid-2vhxyw32> <h3 class="text-center text-2xl font-extrabold tracking-tight" data-astro-cid-2vhxyw32>Calculadora de Entradas 1%</h3> <div class="flex flex-col space-y-5" data-astro-cid-2vhxyw32> <div class="justify-center flex items-center gap-3" data-astro-cid-2vhxyw32> <select id="calcSymbol" class="min-w-[150px]" data-astro-cid-2vhxyw32></select> <button onclick="updatePrices()" class="button p-3 aspect-square" title="Actualizar precio" data-astro-cid-2vhxyw32> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-astro-cid-2vhxyw32> <path d="M4.39502 12.0014C4.39544 12.4156 4.73156 12.751 5.14577 12.7506C5.55998 12.7502 5.89544 12.4141 5.89502 11.9999L4.39502 12.0014ZM6.28902 8.1116L6.91916 8.51834L6.91952 8.51777L6.28902 8.1116ZM9.33502 5.5336L9.0396 4.84424L9.03866 4.84464L9.33502 5.5336ZM13.256 5.1336L13.4085 4.39927L13.4062 4.39878L13.256 5.1336ZM16.73 7.0506L16.1901 7.57114L16.1907 7.57175L16.73 7.0506ZM17.7142 10.2078C17.8286 10.6059 18.2441 10.8358 18.6422 10.7214C19.0403 10.607 19.2703 10.1915 19.1558 9.79342L17.7142 10.2078ZM17.7091 9.81196C17.6049 10.2129 17.8455 10.6223 18.2464 10.7265C18.6473 10.8307 19.0567 10.5901 19.1609 10.1892L17.7091 9.81196ZM19.8709 7.45725C19.9751 7.05635 19.7346 6.6469 19.3337 6.54272C18.9328 6.43853 18.5233 6.67906 18.4191 7.07996L19.8709 7.45725ZM18.2353 10.7235C18.6345 10.8338 19.0476 10.5996 19.1579 10.2004C19.2683 9.80111 19.034 9.38802 18.6348 9.2777L18.2353 10.7235ZM15.9858 8.5457C15.5865 8.43537 15.1734 8.66959 15.0631 9.06884C14.9528 9.46809 15.187 9.88119 15.5863 9.99151L15.9858 8.5457ZM19.895 11.9999C19.8946 11.5856 19.5585 11.2502 19.1443 11.2506C18.7301 11.251 18.3946 11.5871 18.395 12.0014L19.895 11.9999ZM18.001 15.8896L17.3709 15.4829L17.3705 15.4834L18.001 15.8896ZM14.955 18.4676L15.2505 19.157L15.2514 19.1566L14.955 18.4676ZM11.034 18.8676L10.8815 19.6019L10.8839 19.6024L11.034 18.8676ZM7.56002 16.9506L8.09997 16.4301L8.09938 16.4295L7.56002 16.9506ZM6.57584 13.7934C6.46141 13.3953 6.04593 13.1654 5.64784 13.2798C5.24974 13.3942 5.01978 13.8097 5.13421 14.2078L6.57584 13.7934ZM6.58091 14.1892C6.6851 13.7884 6.44457 13.3789 6.04367 13.2747C5.64277 13.1705 5.23332 13.4111 5.12914 13.812L6.58091 14.1892ZM4.41914 16.544C4.31495 16.9449 4.55548 17.3543 4.95638 17.4585C5.35727 17.5627 5.76672 17.3221 5.87091 16.9212L4.41914 16.544ZM6.05478 13.2777C5.65553 13.1674 5.24244 13.4016 5.13212 13.8008C5.02179 14.2001 5.25601 14.6132 5.65526 14.7235L6.05478 13.2777ZM8.30426 15.4555C8.70351 15.5658 9.11661 15.3316 9.22693 14.9324C9.33726 14.5331 9.10304 14.12 8.70378 14.0097L8.30426 15.4555ZM5.89502 11.9999C5.89379 10.7649 6.24943 9.55591 6.91916 8.51834L5.65889 7.70487C4.83239 8.98532 4.3935 10.4773 4.39502 12.0014L5.89502 11.9999ZM6.91952 8.51777C7.57513 7.50005 8.51931 6.70094 9.63139 6.22256L9.03866 4.84464C7.65253 5.4409 6.47568 6.43693 5.65852 7.70544L6.91952 8.51777ZM9.63045 6.22297C10.7258 5.75356 11.9383 5.62986 13.1059 5.86842L13.4062 4.39878C11.9392 4.09906 10.4158 4.25448 9.0396 4.84424L9.63045 6.22297ZM13.1035 5.86793C14.2803 6.11232 15.3559 6.7059 16.1901 7.57114L17.27 6.53006C16.2264 5.44761 14.8807 4.70502 13.4085 4.39927L13.1035 5.86793ZM16.1907 7.57175C16.9065 8.31258 17.4296 9.21772 17.7142 10.2078L19.1558 9.79342C18.8035 8.5675 18.1557 7.44675 17.2694 6.52945L16.1907 7.57175ZM19.1609 10.1892L19.8709 7.45725L18.4191 7.07996L17.7091 9.81196L19.1609 10.1892ZM18.6348 9.2777L15.9858 8.5457L15.5863 9.99151L18.2353 10.7235L18.6348 9.2777ZM18.395 12.0014C18.3963 13.2363 18.0406 14.4453 17.3709 15.4829L18.6312 16.2963C19.4577 15.0159 19.8965 13.5239 19.895 11.9999L18.395 12.0014ZM17.3705 15.4834C16.7149 16.5012 15.7707 17.3003 14.6587 17.7786L15.2514 19.1566C16.6375 18.5603 17.8144 17.5643 18.6315 16.2958L17.3705 15.4834ZM14.6596 17.7782C13.5643 18.2476 12.3517 18.3713 11.1842 18.1328L10.8839 19.6024C12.3508 19.9021 13.8743 19.7467 15.2505 19.157L14.6596 17.7782ZM11.1865 18.1333C10.0098 17.8889 8.93411 17.2953 8.09997 16.4301L7.02008 17.4711C8.06363 18.5536 9.40936 19.2962 10.8815 19.6019L11.1865 18.1333ZM8.09938 16.4295C7.38355 15.6886 6.86042 14.7835 6.57584 13.7934L5.13421 14.2078C5.48658 15.4337 6.13433 16.5545 7.02067 17.4718L8.09938 16.4295ZM5.12914 13.812L4.41914 16.544L5.87091 16.9212L6.58091 14.1892L5.12914 13.812ZM5.65526 14.7235L8.30426 15.4555L8.70378 14.0097L6.05478 13.2777L5.65526 14.7235Z" fill="currentColor" data-astro-cid-2vhxyw32></path> </svg> </button> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Tama\xF1o de Cuenta</h4> <input type="number" min="0" value="1000" max="100000" id="accountsize" class="w-32 text-right font-bold" data-astro-cid-2vhxyw32> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Precio Moneda</h4> <input type="number" id="coinprice" value="1" class="w-32 text-right font-bold" data-astro-cid-2vhxyw32> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Porcentaje</h4> <input type="number" id="percent" value="1" class="w-32 text-right font-bold" data-astro-cid-2vhxyw32> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Apalancamiento</h4> <input type="number" id="leverage" value="10" class="w-32 text-right font-bold" data-astro-cid-2vhxyw32> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Tama\xF1o de Posici\xF3n</h4> <h4 id="positionsize" class="text-right text-cyan-400 font-extrabold text-lg" data-astro-cid-2vhxyw32>
...$
</h4> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Cantidad de Monedas</h4> <h4 id="coinamount" class="text-right text-white font-extrabold text-lg" data-astro-cid-2vhxyw32>xALQ</h4> </div> </div> <div class="space-y-4 pt-4 border-t border-white/5" data-astro-cid-2vhxyw32> <div class="flex justify-center" data-astro-cid-2vhxyw32> <select id="sideSelector" class="min-w-[120px] text-center" data-astro-cid-2vhxyw32> <option value="buy" data-astro-cid-2vhxyw32>Comprar</option> <option value="sell" data-astro-cid-2vhxyw32>Vender</option> </select> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <div class="tooltip" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Stop loss (?)</h4> <span class="tooltiptext" data-astro-cid-2vhxyw32>% De la Cuenta</span> </div> <div class="flex items-center gap-1" data-astro-cid-2vhxyw32> <input type="number" min="0" value="1" max="100" id="stoplosspercent" class="w-24 text-right font-bold" data-astro-cid-2vhxyw32> <span class="text-gray-400 font-semibold" data-astro-cid-2vhxyw32>%</span> </div> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Stop loss Price</h4> <div class="flex items-center gap-1" data-astro-cid-2vhxyw32> <h4 id="stoploss" class="text-rose-400 font-extrabold text-lg" data-astro-cid-2vhxyw32></h4> <span class="text-gray-400 font-semibold" data-astro-cid-2vhxyw32>$</span> </div> </div> </div> <div class="space-y-4" data-astro-cid-2vhxyw32> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <div class="tooltip" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Take Profit Ratio (?)</h4> <span class="tooltiptext" data-astro-cid-2vhxyw32>Ratio de Ganancia 1 = 1:1</span> </div> <input type="number" min="0" value="1" max="100" id="takeprofitRatio" class="w-24 text-right font-bold" data-astro-cid-2vhxyw32> </div> <div class="flex items-center justify-between border-b border-white/5 py-3" data-astro-cid-2vhxyw32> <h4 class="text-base font-semibold text-gray-300" data-astro-cid-2vhxyw32>Take Profit Price</h4> <div class="flex items-center gap-1" data-astro-cid-2vhxyw32> <h4 id="takeprofitprice" class="text-emerald-400 font-extrabold text-lg" data-astro-cid-2vhxyw32></h4> <span class="text-gray-400 font-semibold" data-astro-cid-2vhxyw32>$</span> </div> </div> </div> <div class="text-center pt-4" data-astro-cid-2vhxyw32> <button onclick="calculate()" class="button w-full bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-bold transition-all" data-astro-cid-2vhxyw32>
Calcular
</button> </div> </div> <script>
        let lastPrices = {}
        const tickerInfo = async () => {
            const fetched = await fetch('https://api.bybit.com/v5/market/tickers?category=linear').then(res => res.json())
            const prices = {}
            fetched.result.list.map(ticker => {
                prices[ticker.symbol] = ticker.lastPrice
                lastPrices[ticker.symbol] = ticker.lastPrice
                
            }) 
            return prices
            
            
        }
        const updatePrices = async () => {
            const fetched = await fetch('https://api.bybit.com/v5/market/tickers?category=linear').then(res => res.json())
            fetched.result.list.map(ticker => {
                lastPrices[ticker.symbol] = ticker.lastPrice
            }) 
            coinprice.value = lastPrices[calcSymbol.value]
        }
        const populate = async () => {
            tickerInfo().then(prices => {
                console.log(prices);
                for (const [key, value] of Object.entries(prices)) {
                    const option = document.createElement("option");
                    option.value = key;
                    option.text = key;
                    calcSymbol.appendChild(option);
                }
            })
        }
        tickerInfo()
        updatePrices()
        populate()
        
        // function to get the value of an element
        
            
        const calcSymbol = document.getElementById('calcSymbol');
        const accountsize = document.getElementById("accountsize");
        const coinprice = document.getElementById("coinprice");
        const percent = document.getElementById("percent");
        const leverage = document.getElementById("leverage");
        const side = document.getElementById("sideSelector");
        const takeprofitRatio = document.getElementById("takeprofitRatio");
        takeprofitRatio.addEventListener("input", calculate);
        side.addEventListener("input", calculate);
        accountsize.addEventListener("input", calculate);
        coinprice.addEventListener("input", calculate);
        percent.addEventListener("input", calculate);
        leverage.addEventListener("input", calculate);
        calcSymbol.addEventListener("input",
            ()=>{               
                const value = calcSymbol.value
                coinprice.value = lastPrices[value]
                calculate()
            });
        function getValue() {
            const accountsize = document.getElementById("accountsize").value;
            const coinprice = Number(
                document.getElementById("coinprice").value,
            );
            const percent = document.getElementById("percent").value;
            const leverage = document.getElementById("leverage").value;
            const stoplosspercent =
                document.getElementById("stoplosspercent").value;
            const side = document.getElementById("sideSelector").value;
            const takeprofitRatio = document.getElementById("takeprofitRatio").value;
            return [
                accountsize,
                coinprice,
                percent,
                leverage,
                stoplosspercent,
                side,
                takeprofitRatio

            ];
        }
        function calculate() {
            const [
                accountsize,
                coinprice,
                percent,
                leverage,
                stoplosspercent,
                side,
                takeprofitRatio
            ] = getValue();
            // get decimals but ignore trailing zeros
            const priceDecimals = coinprice.toString().split(".")[1]?.length || 0;
            const positionsize = (accountsize * percent) / 100;
            const coinamount = (positionsize / coinprice) * leverage;
            const stoplossAmount = (accountsize * stoplosspercent) / 100;

            var stoplossPrice = 0;
            var takeprofitPrice = 0;
            if (side == "buy") {
                stoplossPrice = coinprice - stoplossAmount / coinamount;
                takeprofitPrice = coinprice + takeprofitRatio * (coinprice - stoplossPrice);
            } else {
                stoplossPrice = coinprice + stoplossAmount / coinamount;
                takeprofitPrice = coinprice - takeprofitRatio * (stoplossPrice - coinprice);
            }

            document.getElementById("positionsize").innerHTML =
                positionsize + " $";
            document.getElementById("coinamount").innerHTML =
                coinamount.toFixed(3);
            document.getElementById("stoploss").innerHTML =
                stoplossPrice.toFixed(priceDecimals);
            document.getElementById("takeprofitprice").innerHTML =
                takeprofitPrice.toFixed(priceDecimals);
        }
    <\/script>`])), renderComponent($$result, "BaseHead", $$BaseHead, { "title": "Calculadora", "description": "Calculadora", "data-astro-cid-2vhxyw32": true }), maybeRenderHead());
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/calc/Calc.astro", void 0);

const $$Astro$b = createAstro("https://laalquimia.github.io");
const $$Chart = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Chart;
  return renderTemplate`${renderComponent($$result, "ChartSv", ChartSv, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/ChartSv.svelte", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Toolbar", $$ToolBar, {})} ` })} ${renderComponent($$result, "Calc", $$Calc, {})}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/Chart.astro", void 0);

const $$Astro$a = createAstro("https://laalquimia.github.io");
const $$Index$7 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Index$7;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "Chart", $$Chart, {})} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/meanRev/index.astro", void 0);

const $$file$7 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/meanRev/index.astro";
const $$url$7 = "/bot/meanRev";

const index$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$7,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

/* src/components/chart/BinanceChartSv.svelte generated by Svelte v4.2.12 */

const css$2 = {
	code: ".liquid-glass-card.svelte-6f2vhm.svelte-6f2vhm{background:rgba(255, 255, 255, 0.03);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border:1px solid rgba(255, 255, 255, 0.08);box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.37);border-radius:16px;transition:all 0.3s ease}.liquid-glass-card.svelte-6f2vhm.svelte-6f2vhm:hover{border-color:rgba(255, 255, 255, 0.12);box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.5)}.glass-table.svelte-6f2vhm th.svelte-6f2vhm{background:rgba(255, 255, 255, 0.05) !important;border-bottom:1px solid rgba(255, 255, 255, 0.1);color:rgba(255, 255, 255, 0.8) !important}.glass-table.svelte-6f2vhm.svelte-6f2vhm{border-collapse:separate;border-spacing:0}.glow-container.svelte-6f2vhm.svelte-6f2vhm{position:relative}.glow-container.svelte-6f2vhm.svelte-6f2vhm::before{content:\"\";position:absolute;width:300px;height:300px;background:radial-gradient(circle, rgba(64, 205, 224, 0.15) 0%, rgba(0,0,0,0) 70%);top:-50px;left:-50px;z-index:-1;pointer-events:none}",
	map: null
};

const BinanceChartSv = create_ssr_component(($$result, $$props, $$bindings, slots) => {

	$$result.css.add(css$2);

	return `    ${``}`;
});

const $$Astro$9 = createAstro("https://laalquimia.github.io");
const $$BinanceChart = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$BinanceChart;
  return renderTemplate`${renderComponent($$result, "BinanceChartSv", BinanceChartSv, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/BinanceChartSv.svelte", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Toolbar", $$ToolBar, {})} ` })}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/BinanceChart.astro", void 0);

const $$Astro$8 = createAstro("https://laalquimia.github.io");
const $$Index$6 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Index$6;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "BinanceChart", $$BinanceChart, {})} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/meanRevBinance/index.astro", void 0);

const $$file$6 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/meanRevBinance/index.astro";
const $$url$6 = "/bot/meanRevBinance";

const index$6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$6,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

/* src/components/chart/TraderChartSv.svelte generated by Svelte v4.2.12 */

const css$1 = {
	code: ".trader-panel.svelte-kjp6po.svelte-kjp6po{background:radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent),\n                radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.05), transparent)}.glass-card.svelte-kjp6po.svelte-kjp6po{background:rgba(13, 15, 24, 0.6);-webkit-backdrop-filter:blur(24px) saturate(190%);backdrop-filter:blur(24px) saturate(190%);border:1px solid rgba(255, 255, 255, 0.06);box-shadow:0 16px 40px 0 rgba(0, 0, 0, 0.5),\n                inset 0 1px 1px rgba(255, 255, 255, 0.03);border-radius:24px;transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1)}.glass-card.svelte-kjp6po.svelte-kjp6po:hover{border-color:rgba(6, 182, 212, 0.2);box-shadow:0 20px 48px rgba(0, 0, 0, 0.6),\n                0 0 24px rgba(6, 182, 212, 0.08)}.glow-green.svelte-kjp6po.svelte-kjp6po{box-shadow:0 0 15px rgba(16, 185, 129, 0.3)}.glow-violet.svelte-kjp6po.svelte-kjp6po{box-shadow:0 0 15px rgba(139, 92, 246, 0.3)}.gtable.svelte-kjp6po.svelte-kjp6po{width:100%;border-collapse:separate;border-spacing:0 8px}.gtable.svelte-kjp6po th.svelte-kjp6po{padding:12px 16px;font-weight:600;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px}.gtable.svelte-kjp6po tr.trow.svelte-kjp6po{background:rgba(255, 255, 255, 0.015);transition:all 0.2s ease}.gtable.svelte-kjp6po tr.trow.svelte-kjp6po:hover{background:rgba(255, 255, 255, 0.04)}.gtable.svelte-kjp6po td.svelte-kjp6po{padding:14px 16px;border-top:1px solid rgba(255, 255, 255, 0.03);border-bottom:1px solid rgba(255, 255, 255, 0.03);color:#e2e8f0;font-size:13px}.gtable.svelte-kjp6po td.svelte-kjp6po:first-child{border-left:1px solid rgba(255, 255, 255, 0.03);border-top-left-radius:12px;border-bottom-left-radius:12px}.gtable.svelte-kjp6po td.svelte-kjp6po:last-child{border-right:1px solid rgba(255, 255, 255, 0.03);border-top-right-radius:12px;border-bottom-right-radius:12px}",
	map: null
};

const TraderChartSv = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let checklist;
	let isLongTriggered;

	// Selected coin and state
	let selectedSymbol = "ETHUSDT";

	// Strategy values for UI
	let stats = {
		spread: 0,
		delta: 0,
		deltaPrev: 0,
		acceleration: 0,
		score: 0,
		scorePrev: 0,
		rvol: 0,
		oiCurrent: 0,
		oiPrev: 0,
		oiChangePct: 0,
		macroDirection: false, // EMA50 > EMA200 (1H)
		macroSupport: false, // Price > EMA200 (1H)
		macroBandwidth: 0,
		macroBandwidthPrev: 0,
		macroBandwidthP20: 0,
		macroAntiChoppy: false,
		macroEnabled: false,
		signal: "NEUTRAL",
		sl: 0,
		entryPrice: 0
	};

	// Scanned results list
	let scanResults = [];

	let signalLogs = [];

	// WebSocket and chart variables
	let chartContainer;

	const hotTokens = [
		"ETHUSDT",
		"SOLUSDT",
		"WIFUSDT",
		"PEPEUSDT",
		"BONKUSDT",
		"BTCUSDT",
		"BOMEUSDT",
		"FTMUSDT",
		"XRPUSDT",
		"AVAXUSDT"
	];

	onDestroy(() => {
	});

	$$result.css.add(css$1);

	checklist = {
		macroTrend: stats.macroEnabled,
		confirmGiro: stats.delta > 0 ,
		inercia: stats.acceleration > 0,
		momentum: stats.score > 0 ,
		confirmPrice: false,
		rvol: stats.rvol > 1.5,
		capitalFlow: stats.oiCurrent > stats.oiPrev
	};

	isLongTriggered = checklist.macroTrend && checklist.confirmGiro && checklist.inercia && checklist.momentum && checklist.confirmPrice && checklist.rvol && checklist.capitalFlow;

	return ` ${`<div class="trader-panel text-white py-12 px-6 lg:px-12 w-full min-h-screen svelte-kjp6po"><div class="max-w-7xl mx-auto flex flex-col gap-10"> <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8"><div data-svelte-h="svelte-1b5p3zy"><div class="flex items-center gap-3"><span class="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 rounded-full">QUANT V2 FÚTURES</span> <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span class="text-xs text-gray-400">Bybit Conexión Activa</span></div> <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">Algoritmo Score de Expansión</h1> <p class="text-gray-400 text-sm mt-1">Medias de Inercia, Flujo de Capital (Open Interest) y Volumen Relativo (RVOL).</p></div>  <div class="flex items-center gap-3"><span class="text-sm text-gray-400 font-medium" data-svelte-h="svelte-1oa4noy">Activo:</span> ${validate_component(GlassSelector, "GlassSelector").$$render(
			$$result,
			{
				id: "traderCoinSelector",
				defaultValue: selectedSymbol
			},
			{},
			{
				default: () => {
					return `${each(hotTokens, tok => {
						return `<option${add_attribute("value", tok, 0)}>${escape(tok)}</option>`;
					})}`;
				}
			}
		)}</div></div>  ${``}  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2 flex flex-col gap-6"><div class="glass-card p-6 flex flex-col gap-4 svelte-kjp6po"><div class="flex justify-between items-center"><div class="flex items-center gap-3"><span class="text-lg font-bold text-gray-200">${escape(selectedSymbol)}</span> <span class="text-xs text-cyan-400 font-semibold border border-cyan-800 bg-cyan-950/30 px-2 py-0.5 rounded" data-svelte-h="svelte-10c8jod">5M</span></div> <div class="flex items-center gap-4 text-sm"><span class="text-gray-400">SL Calculado: <b class="text-rose-400">$${escape(stats.sl.toFixed(4))}</b></span> <span class="text-gray-400">Precio: <b class="text-white">$${escape(stats.entryPrice.toFixed(4))}</b></span></div></div> <div class="rounded-xl overflow-hidden border border-white/5 bg-black/60 relative"><div class="w-full" style="height: 400px;"${add_attribute("this", chartContainer, 0)}></div></div>  <div class="flex flex-wrap gap-6 text-xs text-gray-400 mt-2" data-svelte-h="svelte-1rx2w1"><div class="flex items-center gap-2"><span class="w-3 h-1 bg-cyan-500 rounded"></span> <span>EMA 20 (Rápida)</span></div> <div class="flex items-center gap-2"><span class="w-3 h-1 bg-violet-500 rounded"></span> <span>EMA 50 (Lenta)</span></div> <div class="flex items-center gap-2"><span class="w-3 h-3 bg-emerald-500/30 border border-emerald-500/50 rounded"></span> <span>Ruptura Volumen (&gt;1.5 RVOL)</span></div></div></div>  <div class="glass-card p-6 flex flex-col gap-4 svelte-kjp6po"><div class="flex justify-between items-center"><h3 class="text-lg font-bold text-gray-200" data-svelte-h="svelte-3010hu">Scanner Multiactivo</h3> <button class="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all rounded-lg glow-violet svelte-kjp6po" ${""}>${escape("Escanear Ahora")}</button></div> <div class="overflow-x-auto"><table class="gtable svelte-kjp6po"><thead data-svelte-h="svelte-1nqubf7"><tr><th class="text-left svelte-kjp6po">Symbol</th> <th class="text-right svelte-kjp6po">Precio</th> <th class="text-right svelte-kjp6po">Macro Trend</th> <th class="text-right svelte-kjp6po">RVOL</th> <th class="text-right svelte-kjp6po">Capital OI %</th> <th class="text-right svelte-kjp6po">Score 5M</th> <th class="text-right svelte-kjp6po">Gatillo</th></tr></thead> <tbody>${each(scanResults, item => {
			return `<tr class="trow cursor-pointer svelte-kjp6po"><td class="font-bold text-cyan-400 svelte-kjp6po">${escape(item.symbol)}</td> <td class="text-right font-mono svelte-kjp6po">$${escape(item.price.toFixed(4))}</td> <td class="text-right text-xs svelte-kjp6po">${escape(item.macro)}</td> <td class="${"text-right font-mono " + escape(
				item.rvol > 1.5
				? 'text-emerald-400 font-bold'
				: 'text-gray-400',
				true
			) + " svelte-kjp6po"}">${escape(item.rvol.toFixed(2))}</td> <td class="${"text-right font-mono " + escape(
				item.oiChangePct > 0
				? 'text-emerald-400'
				: 'text-rose-400',
				true
			) + " svelte-kjp6po"}">${escape(item.oiChangePct > 0 ? '+' : '')}${escape(item.oiChangePct.toFixed(2))}%</td> <td class="${"text-right font-mono font-bold " + escape(item.score > 0 ? 'text-cyan-400' : 'text-gray-500', true) + " svelte-kjp6po"}">${escape(item.score.toFixed(4))}</td> <td class="text-right svelte-kjp6po"><span class="${"px-2 py-0.5 rounded text-[10px] font-bold " + escape(
				item.signal.includes('LONG')
				? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400 animate-pulse'
				: 'bg-white/5 border border-white/10 text-gray-400',
				true
			)}">${escape(item.signal)} </span></td> </tr>`;
		})}</tbody></table></div></div></div>  <div class="flex flex-col gap-6"> <div class="glass-card p-6 flex flex-col gap-6 border-l-4 border-cyan-500 svelte-kjp6po"><div data-svelte-h="svelte-cs62im"><h3 class="text-lg font-bold text-gray-200">Gatillo Institucional (5M)</h3> <p class="text-xs text-gray-400">Verificación de condiciones de entrada al cierre de la vela actual.</p></div> <div class="flex flex-col gap-4"> <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.macroTrend
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(
			checklist.macroTrend
			? 'text-emerald-400'
			: 'text-gray-300',
			true
		)}">1. Alineación Macro (1H)</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-1t5tj8s">EMA50 &gt; EMA200, Precio &gt; EMA200 y Bollinger Bandwidth &gt; Percentil 20</span></div> <span class="${"text-xs font-bold " + escape(
			checklist.macroTrend
			? 'text-emerald-400'
			: 'text-rose-400',
			true
		)}">${escape(checklist.macroTrend ? 'Apto' : 'Lateralizado')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.confirmGiro
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(
			checklist.confirmGiro
			? 'text-emerald-400'
			: 'text-gray-300',
			true
		)}">2. Confirmación de Giro</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-12dm2x8">Delta 5M &gt; 0 y Delta Anterior &lt; 0</span></div> <span class="${"text-xs font-bold " + escape(
			checklist.confirmGiro
			? 'text-emerald-400'
			: 'text-rose-400',
			true
		)}">${escape(checklist.confirmGiro ? 'Giro 🟢' : 'Esperando')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.inercia
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(checklist.inercia ? 'text-emerald-400' : 'text-gray-300', true)}">3. Inercia a Favor</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-qp8xls">Aceleración 5M &gt; 0</span></div> <span class="${"text-xs font-bold " + escape(checklist.inercia ? 'text-emerald-400' : 'text-rose-400', true)}">${escape(checklist.inercia ? 'Creciente' : 'Bajando')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.momentum
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(
			checklist.momentum
			? 'text-emerald-400'
			: 'text-gray-300',
			true
		)}">4. Score de Expansión</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-1soq5zi">Score 5M &gt; 0 y mayor que vela anterior</span></div> <span class="${"text-xs font-bold " + escape(
			checklist.momentum
			? 'text-emerald-400'
			: 'text-rose-400',
			true
		)}">${escape(checklist.momentum ? 'Expansión' : 'Débil')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.confirmPrice
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(
			checklist.confirmPrice
			? 'text-emerald-400'
			: 'text-gray-300',
			true
		)}">5. Confirmación de Precio</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-1pi5zi9">Precio de cierre &gt; EMA 20 (5M)</span></div> <span class="${"text-xs font-bold " + escape(
			checklist.confirmPrice
			? 'text-emerald-400'
			: 'text-rose-400',
			true
		)}">${escape(checklist.confirmPrice ? 'Por Encima' : 'Por Debajo')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.rvol
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(checklist.rvol ? 'text-emerald-400' : 'text-gray-300', true)}">6. Filtro Volumen Relativo</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-eu9u3e">RVOL &gt; 1.5 (Volumen de vela &gt; 50% promedio)</span></div> <span class="${"text-xs font-bold " + escape(checklist.rvol ? 'text-emerald-400' : 'text-rose-400', true)}">${escape(checklist.rvol ? 'Ruptura' : 'Bajo Volumen')}</span></div>  <div class="${"flex items-center justify-between p-3 rounded-xl " + escape(
			checklist.capitalFlow
			? 'bg-emerald-950/20 border border-emerald-900/50'
			: 'bg-white/2 border border-white/5',
			true
		)}"><div class="flex flex-col"><span class="${"text-xs font-semibold " + escape(
			checklist.capitalFlow
			? 'text-emerald-400'
			: 'text-gray-300',
			true
		)}">7. Flujo de Capital (Open Interest)</span> <span class="text-[10px] text-gray-400" data-svelte-h="svelte-1d5ez0g">Open Interest actual &gt; Open Interest anterior</span></div> <span class="${"text-xs font-bold " + escape(
			checklist.capitalFlow
			? 'text-emerald-400'
			: 'text-rose-400',
			true
		)}">${escape(checklist.capitalFlow
		? 'Inyección Capital'
		: 'Sin Flujo')}</span></div></div>  <div class="${"p-4 rounded-xl text-center border font-bold " + escape(
			isLongTriggered
			? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 glow-green'
			: 'bg-white/5 border-white/10 text-gray-400',
			true
		) + " svelte-kjp6po"}">${escape(isLongTriggered
		? "¡COMPRA EN LARGO CONFIRMADA! 🟢"
		: "SIN SEÑAL ACTIVA ⚪")}</div></div>  <div class="glass-card p-6 flex flex-col gap-4 svelte-kjp6po"><h3 class="text-lg font-bold text-gray-200" data-svelte-h="svelte-1l2ioi1">Métricas Cuánticas (5M)</h3> <div class="grid grid-cols-2 gap-4"><div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center"><span class="text-[10px] text-gray-400 uppercase tracking-wider block" data-svelte-h="svelte-m5p140">Spread (EMA20-EMA50)</span> <span class="text-base font-mono font-bold text-white mt-1 block">${escape(stats.spread.toFixed(4))}</span></div> <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center"><span class="text-[10px] text-gray-400 uppercase tracking-wider block" data-svelte-h="svelte-qt8bq0">Delta (Velocidad)</span> <span class="${"text-base font-mono font-bold mt-1 block " + escape('text-rose-400', true)}">${escape('')}${escape(stats.delta.toFixed(4))}</span></div> <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center"><span class="text-[10px] text-gray-400 uppercase tracking-wider block" data-svelte-h="svelte-in1ltl">Aceleración (Suavizada)</span> <span class="${"text-base font-mono font-bold mt-1 block " + escape(
			'text-rose-400',
			true
		)}">${escape('')}${escape(stats.acceleration.toFixed(4))}</span></div> <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center"><span class="text-[10px] text-gray-400 uppercase tracking-wider block" data-svelte-h="svelte-atfm3t">Score Expansión</span> <span class="${"text-base font-mono font-bold mt-1 block " + escape('text-gray-400', true)}">${escape(stats.score.toFixed(4))}</span></div></div> <div class="border-t border-white/5 pt-4 flex flex-col gap-2 text-xs"><div class="flex justify-between"><span class="text-gray-400" data-svelte-h="svelte-10yru2k">RVOL:</span> <span class="font-mono text-white">${escape(stats.rvol.toFixed(2))}x</span></div> <div class="flex justify-between"><span class="text-gray-400" data-svelte-h="svelte-oxs8f1">OI Actual:</span> <span class="font-mono text-white">${escape(stats.oiCurrent.toLocaleString())}</span></div> <div class="flex justify-between"><span class="text-gray-400" data-svelte-h="svelte-15j67v0">Cambio OI:</span> <span class="${"font-mono " + escape(
			'text-rose-400',
			true
		)}">${escape('')}${escape(stats.oiChangePct.toFixed(2))}%</span></div></div></div>  <div class="glass-card p-6 flex flex-col gap-4 svelte-kjp6po"><h3 class="text-lg font-bold text-gray-200" data-svelte-h="svelte-11j4feb">Alertas Recientes</h3> <div class="flex flex-col gap-2 max-h-40 overflow-y-auto">${signalLogs.length
		? each(signalLogs, log => {
				return `<div class="flex justify-between items-center p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs"><div><b class="text-emerald-400">${escape(log.symbol)}</b> <span class="text-gray-400">- LONG @ ${escape(log.price.toFixed(4))}</span></div> <span class="text-gray-500 font-mono text-[10px]">${escape(log.timestamp)}</span> </div>`;
			})
		: `<p class="text-xs text-gray-500 text-center py-4" data-svelte-h="svelte-tso755">Esperando señales...</p>`}</div></div></div></div></div></div>`
	}`;
});

const $$Astro$7 = createAstro("https://laalquimia.github.io");
const $$TraderChart = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$TraderChart;
  return renderTemplate`${renderComponent($$result, "TraderChartSv", TraderChartSv, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/TraderChartSv.svelte", "client:component-export": "default" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Toolbar", $$ToolBar, {})} ` })} ${renderComponent($$result, "Calc", $$Calc, {})}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/chart/TraderChart.astro", void 0);

const $$Astro$6 = createAstro("https://laalquimia.github.io");
const $$Index$5 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Index$5;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "TraderChart", $$TraderChart, {})} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/TraderBot/index.astro", void 0);

const $$file$5 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/TraderBot/index.astro";
const $$url$5 = "/bot/TraderBot";

const index$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$5,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

/* src/components/bots/selector.svelte generated by Svelte v4.2.12 */

const css = {
	code: ".bot-container.svelte-8gnjeb.svelte-8gnjeb{display:flex;gap:30px;justify-content:center;flex-wrap:wrap}.bot-glass-card.svelte-8gnjeb.svelte-8gnjeb{background:rgba(255, 255, 255, 0.03);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:1px solid rgba(255, 255, 255, 0.08);box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.37),\n                inset 0 1px 1px rgba(255, 255, 255, 0.05);border-radius:20px;padding:24px;text-align:center;width:200px;transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1);display:flex;flex-direction:column;align-items:center;gap:16px;text-decoration:none;color:#fff}.bot-glass-card.svelte-8gnjeb.svelte-8gnjeb:hover{transform:translateY(-8px) scale(1.02);border-color:rgba(64, 205, 224, 0.3);box-shadow:0 15px 45px rgba(0, 0, 0, 0.5),\n                0 0 20px rgba(64, 205, 224, 0.15),\n                inset 0 1px 1px rgba(255, 255, 255, 0.1)}.bot-title.svelte-8gnjeb.svelte-8gnjeb{font-size:1.15rem;font-weight:800;letter-spacing:0.5px;background:linear-gradient(120deg, #fff 40%, #a5b1f4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.bot-img-container.svelte-8gnjeb.svelte-8gnjeb{width:100%;height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:12px;background:rgba(255, 255, 255, 0.02);border:1px solid rgba(255, 255, 255, 0.05)}.bot-img.svelte-8gnjeb.svelte-8gnjeb{max-height:100%;max-width:100%;-o-object-fit:contain;object-fit:contain;transition:transform 0.4s ease}.bot-glass-card.svelte-8gnjeb:hover .bot-img.svelte-8gnjeb{transform:scale(1.1) rotate(2deg)}.action-btn.svelte-8gnjeb.svelte-8gnjeb{width:100%;padding:10px 16px;border-radius:12px;font-size:14px;font-weight:bold;text-decoration:none;transition:all 0.3s ease;border:1px solid transparent}.action-btn.green.svelte-8gnjeb.svelte-8gnjeb{background:rgba(16, 185, 129, 0.15);border-color:rgba(16, 185, 129, 0.3);color:#34d399}.action-btn.green.svelte-8gnjeb.svelte-8gnjeb:hover{background:rgba(16, 185, 129, 0.25);box-shadow:0 0 15px rgba(16, 185, 129, 0.2)}.action-btn.red.svelte-8gnjeb.svelte-8gnjeb{background:rgba(239, 68, 68, 0.12);border-color:rgba(239, 68, 68, 0.25);color:#f87171}.action-btn.red.svelte-8gnjeb.svelte-8gnjeb:hover{background:rgba(239, 68, 68, 0.22);box-shadow:0 0 15px rgba(239, 68, 68, 0.15)}",
	map: null
};

const Selector = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let balances = {};

	$$result.css.add(css);

	return `<div class="bot-container pt-10 pb-10 svelte-8gnjeb">${each(tokenIds, id => {
		return `<div class="bot-glass-card svelte-8gnjeb"><span class="bot-title svelte-8gnjeb">Bot ${escape(botNames[id - 1])}</span> <div class="bot-img-container svelte-8gnjeb" data-svelte-h="svelte-einq4j"><img src="${"/images/" + escape(botImages[id - 1], true)}" class="bot-img svelte-8gnjeb" alt="bot icon"></div> ${balances[id] > 0
		? `<a class="action-btn green text-center svelte-8gnjeb" href="${"/bot/" + escape(botUrl[id - 1], true)}" data-svelte-h="svelte-10bpe8u">Entrar</a>`
		: `<a class="action-btn red text-center svelte-8gnjeb" href="${escape(openseaLink, true) + "/" + escape(id, true)}" target="_blank" data-svelte-h="svelte-1ial6vt">OpenSea</a>`} </div>`;
	})}</div>`;
});

const $$Astro$5 = createAstro("https://laalquimia.github.io");
const $$BotSelector = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$BotSelector;
  return renderTemplate`${renderComponent($$result, "Selector", Selector, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/bots/selector.svelte", "client:component-export": "default" })}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/components/bots/BotSelector.astro", void 0);

const $$Astro$4 = createAstro("https://laalquimia.github.io");
const $$Index$4 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Index$4;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "BotSelector", $$BotSelector, {})} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/index.astro", void 0);

const $$file$4 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/bot/index.astro";
const $$url$4 = "/bot";

const index$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$4,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$3 = createAstro("https://laalquimia.github.io");
const $$Index$3 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Index$3;
  return renderTemplate`${renderComponent($$result, "Calc", $$Calc, {})}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/calculadora/index.astro", void 0);

const $$file$3 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/calculadora/index.astro";
const $$url$3 = "/calculadora";

const index$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$3,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

// fetchData.js
const fetchData = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m');
      const data = await response.json();
      
      return data; // Devolver los datos obtenidos
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  };

const fetchData$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	fetchData
}, Symbol.toStringTag, { value: 'Module' }));

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro$2 = createAstro("https://laalquimia.github.io");
const $$Index$2 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index$2;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head>', "", "</head> <body> ", ' <div style="color:beige" id="tabla"></div> <script src="/scripts/fetcher.js"><\/script> <script src="https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js"><\/script> <script>\n		<\/script> <script src="/scripts/functions.js">\n		<\/script> <script>\n		  async function crearTablaInclinaciones() {\n			const tickers = await tradeableCoins();\n			const inclinaciones = {};		\n			const fetchPromises = tickers.map(async (ticker) => {\n			  const klineData = await fetchKlineDev(ticker);\n			  const emaData = klineData.ema.slice(0, 20);\n			  const resultadoRegresion = calcularRegresionLineal(emaData);\n			  console.log(ticker,resultadoRegresion.anguloGrados);\n			  inclinaciones[ticker] = resultadoRegresion.anguloGrados;\n			});\n		\n			await Promise.all(fetchPromises);\n		\n			const tabla = document.createElement("table");\n			tabla.innerHTML = `\n			  <thead>\n				<tr>\n				  <th>Moneda</th>\n				  <th>Inclinaci\xF3n (\xE1ngulo en grados)</th>\n				</tr>\n			  </thead>\n			  <tbody>\n				${Object.entries(inclinaciones)\n				  .map(([moneda, inclinacion]) => {\n					return `<tr><td>${moneda}</td><td>${inclinacion.toFixed(2)}</td></tr>`;\n				  })\n				  .join("")}\n			  </tbody>\n			`;\n		\n			const tablaHead = tabla.querySelector("thead");\n			const inclinacionTH = tablaHead.querySelector("th:nth-child(2)");\n		\n			let sortOrder = "asc";\n			inclinacionTH.addEventListener("click", () => {\n			  const tbody = tabla.querySelector("tbody");\n			  const rows = Array.from(tbody.rows);\n		\n			  rows.sort((a, b) => {\n				const aInclinacion = parseFloat(a.cells[1].innerText);\n				const bInclinacion = parseFloat(b.cells[1].innerText);\n		\n				if (sortOrder === "asc") {\n				  return aInclinacion - bInclinacion;\n				} else {\n				  return bInclinacion - aInclinacion;\n				}\n			  });\n		\n			  while (tbody.firstChild) {\n				tbody.removeChild(tbody.firstChild);\n			  }\n		\n			  for (const row of rows) {\n				tbody.appendChild(row);\n			  }\n		\n			  sortOrder = sortOrder === "asc" ? "desc" : "asc";\n			});\n		\n			document.getElementById("tabla").appendChild(tabla);\n		  }\n		\n		  crearTablaInclinaciones();\n		<\/script> ', " </body></html>"], ['<html lang="en"> <head>', "", "</head> <body> ", ' <div style="color:beige" id="tabla"></div> <script src="/scripts/fetcher.js"><\/script> <script src="https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js"><\/script> <script>\n		<\/script> <script src="/scripts/functions.js">\n		<\/script> <script>\n		  async function crearTablaInclinaciones() {\n			const tickers = await tradeableCoins();\n			const inclinaciones = {};		\n			const fetchPromises = tickers.map(async (ticker) => {\n			  const klineData = await fetchKlineDev(ticker);\n			  const emaData = klineData.ema.slice(0, 20);\n			  const resultadoRegresion = calcularRegresionLineal(emaData);\n			  console.log(ticker,resultadoRegresion.anguloGrados);\n			  inclinaciones[ticker] = resultadoRegresion.anguloGrados;\n			});\n		\n			await Promise.all(fetchPromises);\n		\n			const tabla = document.createElement("table");\n			tabla.innerHTML = \\`\n			  <thead>\n				<tr>\n				  <th>Moneda</th>\n				  <th>Inclinaci\xF3n (\xE1ngulo en grados)</th>\n				</tr>\n			  </thead>\n			  <tbody>\n				\\${Object.entries(inclinaciones)\n				  .map(([moneda, inclinacion]) => {\n					return \\`<tr><td>\\${moneda}</td><td>\\${inclinacion.toFixed(2)}</td></tr>\\`;\n				  })\n				  .join("")}\n			  </tbody>\n			\\`;\n		\n			const tablaHead = tabla.querySelector("thead");\n			const inclinacionTH = tablaHead.querySelector("th:nth-child(2)");\n		\n			let sortOrder = "asc";\n			inclinacionTH.addEventListener("click", () => {\n			  const tbody = tabla.querySelector("tbody");\n			  const rows = Array.from(tbody.rows);\n		\n			  rows.sort((a, b) => {\n				const aInclinacion = parseFloat(a.cells[1].innerText);\n				const bInclinacion = parseFloat(b.cells[1].innerText);\n		\n				if (sortOrder === "asc") {\n				  return aInclinacion - bInclinacion;\n				} else {\n				  return bInclinacion - aInclinacion;\n				}\n			  });\n		\n			  while (tbody.firstChild) {\n				tbody.removeChild(tbody.firstChild);\n			  }\n		\n			  for (const row of rows) {\n				tbody.appendChild(row);\n			  }\n		\n			  sortOrder = sortOrder === "asc" ? "desc" : "asc";\n			});\n		\n			document.getElementById("tabla").appendChild(tabla);\n		  }\n		\n		  crearTablaInclinaciones();\n		<\/script> ', " </body></html>"])), renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION }), renderHead(), renderComponent($$result, "Header", $$Header, {}), renderComponent($$result, "Footer", $$Footer, {}));
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/pro/index.astro", void 0);

const $$file$2 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/pro/index.astro";
const $$url$2 = "/pro";

const index$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$2,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.slug}/`,
		})),
	});
}

const rss_xml = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$1 = createAstro("https://laalquimia.github.io");
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Index$1;
  const SITE_TITLE = "Stake";
  const SITE_DESCRIPTION = "Stake ALQ EARN Rewards";
  return renderTemplate`${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })} ${renderComponent($$result, "Header", $$Header, {})} ${renderComponent($$result, "Staking", null, { "client:only": true, "client:component-hydration": "only", "client:component-path": "/Users/laalquimia/Projects/laalquimia.github.io/src/components/staking/Staking.svelte", "client:component-export": "default" })}`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/stake/index.astro", void 0);

const $$file$1 = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/stake/index.astro";
const $$url$1 = "/stake";

const index$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$1,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro("https://laalquimia.github.io");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} <main class="py-12 px-4 max-w-5xl mx-auto space-y-12"> <!-- Hero section inside liquid glass card --> <div class="liquid-glass-card flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12"> <div class="flex-1 text-left space-y-4"> <h1 class="text-5xl md:text-6xl font-black tracking-tight">La Alquimia</h1> <h3 class="text-xl md:text-2xl text-cyan-400 font-semibold">Algorithmic Trading 🐢</h3> <p class="text-gray-300 text-lg leading-relaxed max-w-xl">
Desarrollo de sistemas de trading avanzados y automatizados utilizando las mejores estrategias cuantitativas.
</p> <div class="pt-4 flex gap-4"> <a href="/bot" class="button bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400 font-bold px-6 py-3 rounded-xl transition-all">Ver Bots 🤖</a> <!-- <a href="/stake" class="button font-bold px-6 py-3 rounded-xl transition-all">Staking ALQ 💰</a> --> </div> </div> <div class="flex-1 flex justify-center"> <img src="/images/rightlaptop.webp" class="w-full max-w-xs md:max-w-sm hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_0_25px_rgba(64,205,224,0.2)]" alt="laptop"> </div> </div> <!-- Grid features with liquid glass --> <div class="grid grid-cols-1 md:grid-cols-2 gap-8"> <!-- Spot & Futures Card --> <div class="liquid-glass-card flex flex-col justify-between p-8 gap-6"> <div class="space-y-3"> <h2 class="text-3xl font-bold">Spot & Futures</h2> <h4 class="text-cyan-400 font-semibold text-lg">Strategies for trade</h4> <p class="text-gray-400">
Ejecución precisa de algoritmos adaptados para mercados spot y de futuros, maximizando retornos y controlando riesgos.
</p> </div> <div class="flex justify-center pt-4"> <img src="/images/diamondturtle.png" class="h-44 object-contain hover:rotate-3 transition-transform duration-300 filter drop-shadow-[0_0_15px_rgba(165,177,244,0.15)]" alt="diamond turtle"> </div> </div> <!-- Best Trading Bots Card --> <div class="liquid-glass-card flex flex-col justify-between p-8 gap-6"> <div class="space-y-3"> <h2 class="text-3xl font-bold">Best Trading Bots 🤖</h2> <h4 class="text-cyan-400 font-semibold text-lg">Python and JavaScript</h4> <p class="text-gray-400">
Nuestros sistemas están construidos sobre infraestructuras rápidas y seguras que corren 24/7 de forma ininterrumpida.
</p> </div> <div class="flex justify-center pt-4"> <img src="/images/tortugacadenas.png" class="h-44 object-contain hover:scale-105 transition-transform duration-300" alt="tortuga cadenas"> </div> </div> </div> <!-- Banner Section --> <div class="liquid-glass-card text-center p-8 md:p-12"> <h2 class="text-3xl md:text-4xl max-w-3xl mx-auto leading-snug">
Algoritmos de trading diseñados profesionalmente para contratos de futuros.
</h2> </div> </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/index.astro", void 0);

const $$file = "/Users/laalquimia/Projects/laalquimia.github.io/src/pages/index.astro";
const $$url = "";

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { ____slug_ as _, index$8 as a, index$7 as b, index$6 as c, index$5 as d, index$4 as e, index$3 as f, fetchData$1 as g, index$2 as h, index$9 as i, index$1 as j, index as k, rss_xml as r };
