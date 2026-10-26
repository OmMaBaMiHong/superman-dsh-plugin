import { n as Ze, t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as generateHeaders, r as generatedHeaders } from "./header-generator-DACPoxdp.mjs";
import { t as proxyExport } from "./proxy-Dm18LCRO.mjs";
import { c as Layout, d as getDebugInfo, f as setDebugInfo, l as gitDate, o as tracer, r as namespaces, s as requestMetric, t as app$2, u as gitHash } from "./registry-p-HYZsHc.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import { t as RejectError } from "./reject-RVevp-dP.mjs";
import { t as RequestInProgressError } from "./request-in-progress-BjSkP8tJ.mjs";
import { a as time, n as getRouteNameFromPath, t as getPath } from "./helpers-5QIj7EjI.mjs";
import { n as convertDateToISO8601, t as collapseWhitespace } from "./common-utils-xJr7JYuG.mjs";
import x, { FormData, Headers, Request, Response } from "undici";
import dayjs from "dayjs";
import http from "node:http";
import https from "node:https";
import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { jsxRenderer } from "hono/jsx-renderer";
import { trimTrailingSlash } from "hono/trailing-slash";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { routePath } from "hono/route";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { parse } from "tldts";
import xxhash from "xxhash-wasm";
import Honeybadger from "@honeybadger-io/js";
import { load } from "cheerio";
import etagCalculate from "etag";
import Parser from "@jocmp/mercury-parser";
import * as entities from "entities";
import { convert } from "html-to-text";
import markdownit from "markdown-it";
import { RE2JS } from "re2js";
import sanitizeHtml from "sanitize-html";
import { simplecc } from "simplecc-wasm";
//#region lib/utils/request-rewriter/fetch.ts
const limiterQueue = new RateLimiterQueue(new RateLimiterMemory({
	points: 10,
	duration: 1,
	execEvenly: true
}), { maxQueueSize: 4800 });
const useCustomHeader = (headers) => {
	process.env.NODE_ENV === "dev" && Ze((req) => {
		for (const [key, value] of headers.entries()) req.requestHeaders[key] = value;
		return req;
	});
};
const wrappedFetch = async (input, init) => {
	const request = new Request(input, init);
	const options = {};
	logger.debug(`Outgoing request: ${request.method} ${request.url}`);
	if (config.isDefaultUA || init?.headerGeneratorOptions) {
		const generatedHeaders$2 = generateHeaders(init?.headerGeneratorOptions);
		if (!request.headers.get("user-agent")) request.headers.set("user-agent", generatedHeaders$2["user-agent"]);
		for (const header of generatedHeaders) {
			const headerValue = generatedHeaders$2[header];
			if (!request.headers.has(header) && headerValue) request.headers.set(header, headerValue);
		}
	} else if (!request.headers.get("user-agent")) request.headers.set("user-agent", config.ua);
	if (!request.headers.get("referer")) try {
		const urlHandler = new URL(request.url);
		request.headers.set("referer", urlHandler.origin);
	} catch {}
	let isRetry = false;
	if (request.headers.get("x-prefer-proxy")) {
		isRetry = true;
		request.headers.delete("x-prefer-proxy");
	}
	config.enableRemoteDebugging && useCustomHeader(request.headers);
	if (!init?.dispatcher && (proxyExport.proxyObj.strategy !== "on_retry" || isRetry)) {
		const proxyRegex = new RegExp(proxyExport.proxyObj.url_regex);
		let urlHandler;
		try {
			urlHandler = new URL(request.url);
		} catch {}
		if (proxyRegex.test(request.url) && request.url.startsWith("http") && !(urlHandler && urlHandler.host === proxyExport.proxyUrlHandler?.host)) {
			const currentProxy = proxyExport.getCurrentProxy();
			if (currentProxy) {
				const dispatcher = proxyExport.getDispatcherForProxy(currentProxy);
				if (dispatcher) {
					options.dispatcher = dispatcher;
					logger.debug(`Proxying request via ${currentProxy.uri}: ${request.url}`);
				}
			}
		}
	}
	await limiterQueue.removeTokens(1);
	const maxRetries = proxyExport.multiProxy?.allProxies.length || 1;
	const attemptRequest = async (attempt) => {
		try {
			return await x.fetch(request, options);
		} catch (error) {
			if (options.dispatcher && proxyExport.multiProxy && attempt < maxRetries - 1) {
				const currentProxy = proxyExport.getCurrentProxy();
				if (currentProxy) {
					logger.warn(`Request failed with proxy ${currentProxy.uri}, trying next proxy: ${error}`);
					proxyExport.markProxyFailed(currentProxy.uri);
					const nextProxy = proxyExport.getCurrentProxy();
					if (nextProxy && nextProxy.uri !== currentProxy.uri) {
						const nextDispatcher = proxyExport.getDispatcherForProxy(nextProxy);
						if (nextDispatcher) options.dispatcher = nextDispatcher;
						logger.debug(`Retrying request with proxy ${nextProxy.uri}: ${request.url}`);
						return attemptRequest(attempt + 1);
					}
					logger.warn("No more proxies available, trying without proxy");
					delete options.dispatcher;
					return attemptRequest(attempt + 1);
				}
			}
			throw error;
		}
	};
	return attemptRequest(0);
};
//#endregion
//#region lib/utils/request-rewriter/get.ts
const getWrappedGet = (origin) => function(...args) {
	let url;
	let options = {};
	let callback;
	if (typeof args[0] === "string" || args[0] instanceof URL) {
		url = new URL(args[0]);
		if (typeof args[1] === "object") {
			options = args[1];
			callback = args[2];
		} else if (typeof args[1] === "function") {
			options = {};
			callback = args[1];
		}
	} else {
		options = args[0];
		try {
			url = new URL(options.href || `${options.protocol || "http:"}//${options.hostname || options.host}${options.path}${options.search || (options.query ? `?${options.query}` : "")}`);
		} catch {
			url = null;
		}
		if (typeof args[1] === "function") callback = args[1];
	}
	if (!url) return Reflect.apply(origin, this, args);
	logger.debug(`Outgoing request: ${options.method || "GET"} ${url}`);
	options.headers ||= {};
	const headersLowerCaseKeys = new Set(Object.keys(options.headers).map((key) => key.toLowerCase()));
	if (config.isDefaultUA || options.headerGeneratorOptions) {
		const generatedHeaders$1 = generateHeaders(options.headerGeneratorOptions);
		if (!headersLowerCaseKeys.has("user-agent")) options.headers["user-agent"] = generatedHeaders$1["user-agent"];
		for (const header of generatedHeaders) {
			const generatedHeader = generatedHeaders$1[header];
			if (!headersLowerCaseKeys.has(header) && generatedHeader) options.headers[header] = generatedHeader;
		}
	} else if (!headersLowerCaseKeys.has("user-agent")) options.headers["user-agent"] = config.ua;
	if (!headersLowerCaseKeys.has("referer")) options.headers.referer = url.origin;
	if (!options.agent && proxyExport.agent) {
		if (new RegExp(proxyExport.proxyObj.url_regex).test(url.toString()) && url.protocol.startsWith("http") && url.host !== proxyExport.proxyUrlHandler?.host && url.host !== "localhost" && !url.host.startsWith("127.") && [config.playwrightWSEndpoint, config.playwrightCDPEndpoint].every((endpoint) => !endpoint?.includes(url.host))) options.agent = proxyExport.agent;
	}
	const { headerGeneratorOptions, ...cleanOptions } = options;
	return Reflect.apply(origin, this, [
		url,
		cleanOptions,
		callback
	]);
};
//#endregion
//#region lib/utils/request-rewriter/index.ts
Object.defineProperties(globalThis, {
	fetch: {
		value: wrappedFetch,
		writable: true,
		configurable: true
	},
	Headers: {
		value: Headers,
		writable: true,
		configurable: true
	},
	FormData: {
		value: FormData,
		writable: true,
		configurable: true
	},
	Request: {
		value: Request,
		writable: true,
		configurable: true
	},
	Response: {
		value: Response,
		writable: true,
		configurable: true
	}
});
http.get = getWrappedGet(http.get);
http.request = getWrappedGet(http.request);
https.get = getWrappedGet(https.get);
https.request = getWrappedGet(https.request);
//#endregion
//#region lib/api/category/one.ts
const categoryList = {};
for (const namespace in namespaces) for (const path in namespaces[namespace].routes) {
	if (!namespaces[namespace].routes[path].categories?.length) continue;
	const categories = namespaces[namespace].routes[path].categories;
	for (const category of categories) {
		if (!Object.hasOwn(categoryList, category)) categoryList[category] = {};
		if (!Object.hasOwn(categoryList[category], namespace)) categoryList[category][namespace] = {
			...namespaces[namespace],
			routes: {}
		};
		categoryList[category][namespace].routes[path] = namespaces[namespace].routes[path];
	}
}
const ParamsSchema = z.object({ category: z.string().openapi({
	param: {
		name: "category",
		in: "path"
	},
	example: "popular"
}) });
const route$6 = createRoute({
	method: "get",
	path: "/category/{category}",
	description: "Namespace list filtered by category",
	tags: ["Category"],
	request: {
		query: z.object({
			categories: z.string().transform((val) => val.split(",")).optional(),
			lang: z.string().optional()
		}),
		params: ParamsSchema
	},
	responses: { 200: { description: "Namespaces matching the requested category" } }
});
const handler$6 = (ctx) => {
	const { categories, lang } = ctx.req.valid("query");
	const { category } = ctx.req.valid("param");
	let allCategories = [category];
	if (categories && categories.length > 0) allCategories = [...allCategories, ...categories];
	const commonNamespaces = Object.keys(categoryList[category] || {}).filter((namespace) => allCategories.every((cat) => categoryList[cat]?.[namespace]));
	let result = Object.fromEntries(commonNamespaces.map((namespace) => [namespace, categoryList[category][namespace]]));
	if (lang) result = Object.fromEntries(Object.entries(result).filter(([, value]) => value.lang === lang));
	return ctx.json(result);
};
//#endregion
//#region lib/api/follow/config.ts
const route$5 = createRoute({
	method: "get",
	path: "/follow/config",
	description: "Follow configuration for the current instance",
	tags: ["Follow"],
	responses: { 200: { description: "Follow configuration for the current instance" } }
});
const handler$5 = (ctx) => ctx.json({
	ownerUserId: config.follow.ownerUserId,
	description: config.follow.description,
	price: config.follow.price,
	userLimit: config.follow.userLimit,
	cacheTime: config.cache.routeExpire,
	gitHash,
	gitDate: gitDate?.getTime()
});
//#endregion
//#region lib/api/namespace/all.ts
const route$4 = createRoute({
	method: "get",
	path: "/namespace",
	description: "Information about all namespaces",
	tags: ["Namespace"],
	responses: { 200: { description: "Namespace registry data for all namespaces" } }
});
const handler$4 = (ctx) => ctx.json(namespaces);
//#endregion
//#region lib/api/namespace/one.ts
const pathParam = (name, example) => z.string().openapi({
	param: {
		name,
		in: "path"
	},
	example
});
const nestedExample = Object.keys(namespaces).find((key) => key.includes("/"))?.split("/") ?? ["namespace", "sub"];
const route$3 = createRoute({
	method: "get",
	path: "/namespace/{namespace}",
	description: "Information about a namespace",
	tags: ["Namespace"],
	request: { params: z.object({ namespace: pathParam("namespace", "github") }) },
	responses: { 200: { description: "Namespace registry data for a namespace" } }
});
const routeNested = createRoute({
	method: "get",
	path: "/namespace/{namespace}/{sub}",
	description: `Information about a nested namespace (e.g. ${nestedExample.join("/")})`,
	tags: ["Namespace"],
	request: { params: z.object({
		namespace: pathParam("namespace", nestedExample[0]),
		sub: pathParam("sub", nestedExample[1])
	}) },
	responses: { 200: { description: "Namespace registry data for a nested namespace" } }
});
const handler$3 = (ctx) => {
	const { namespace, sub } = ctx.req.valid("param");
	return ctx.json(namespaces[[namespace, sub].filter(Boolean).join("/")]);
};
//#endregion
//#region lib/api/radar/rules/all.ts
const radar$1 = {};
for (const namespace in namespaces) for (const path in namespaces[namespace].routes) {
	const realPath = `/${namespace}${path}`;
	const data = namespaces[namespace].routes[path];
	if (data.radar?.length) for (const radarItem of data.radar) {
		const parsedDomain = parse(new URL("https://" + radarItem.source[0]).hostname);
		const subdomain = parsedDomain.subdomain || ".";
		const domain = parsedDomain.domain;
		if (domain) {
			if (!Object.hasOwn(radar$1, domain)) radar$1[domain] = { _name: namespaces[namespace].name };
			if (!Object.hasOwn(radar$1[domain], subdomain)) radar$1[domain][subdomain] = [];
			radar$1[domain][subdomain].push({
				title: radarItem.title || data.name,
				docs: `https://docs.rsshub.app/routes/${data.categories?.[0] || "other"}`,
				source: radarItem.source.map((source) => {
					const sourceURL = new URL("https://" + source);
					return sourceURL.pathname + sourceURL.search + sourceURL.hash;
				}),
				target: radarItem.target ? `/${namespace}${radarItem.target}` : realPath
			});
		}
	}
}
const route$2 = createRoute({
	method: "get",
	path: "/radar/rules",
	description: "All Radar rules grouped by domain",
	tags: ["Radar"],
	responses: { 200: { description: "Radar rules grouped by domain" } }
});
const handler$2 = (ctx) => ctx.json(radar$1);
//#endregion
//#region lib/api/radar/rules/one.ts
const radar = {};
for (const namespace in namespaces) for (const path in namespaces[namespace].routes) {
	const realPath = `/${namespace}${path}`;
	const data = namespaces[namespace].routes[path];
	if (data.radar?.length) for (const radarItem of data.radar) {
		const parsedDomain = parse(new URL("https://" + radarItem.source[0]).hostname);
		const subdomain = parsedDomain.subdomain || ".";
		const domain = parsedDomain.domain;
		if (domain) {
			if (!Object.hasOwn(radar, domain)) radar[domain] = { _name: namespaces[namespace].name };
			if (!Object.hasOwn(radar[domain], subdomain)) radar[domain][subdomain] = [];
			radar[domain][subdomain].push({
				title: radarItem.title || data.name,
				docs: `https://docs.rsshub.app/routes/${data.categories?.[0] || "other"}`,
				source: radarItem.source.map((source) => {
					const sourceURL = new URL("https://" + source);
					return sourceURL.pathname + sourceURL.search + sourceURL.hash;
				}),
				target: radarItem.target ? `/${namespace}${radarItem.target}` : realPath
			});
		}
	}
}
const route$1 = createRoute({
	method: "get",
	path: "/radar/rules/{domain}",
	description: "Radar rules for a domain name",
	tags: ["Radar"],
	request: { params: z.object({ domain: z.string().openapi({
		param: {
			name: "domain",
			in: "path"
		},
		example: "github.com"
	}) }) },
	responses: { 200: { description: "Radar rules for a domain name (no subdomains)" } }
});
const handler$1 = (ctx) => {
	const { domain } = ctx.req.valid("param");
	return ctx.json(radar[domain]);
};
//#endregion
//#region lib/api/route/status.ts
const QuerySchema = z.object({ requestPath: z.string().openapi({
	param: {
		name: "requestPath",
		in: "query"
	},
	example: "/github/comments/DIYgod/RSSHub/20768",
	description: "The route path to check cache status for"
}) });
const ResponseSchema = z.object({
	cached: z.boolean(),
	lastBuildDate: z.string().nullable()
});
const route = createRoute({
	method: "get",
	path: "/route/status",
	description: "Check if a route path is cached",
	tags: ["Route"],
	request: { query: QuerySchema },
	responses: {
		200: {
			content: { "application/json": { schema: ResponseSchema } },
			description: "Cache found"
		},
		404: {
			content: { "application/json": { schema: ResponseSchema } },
			description: "Cache not found"
		},
		503: {
			content: { "application/json": { schema: ResponseSchema } },
			description: "Cache module unavailable"
		}
	}
});
const handler = async (ctx) => {
	if (!cache_default.status.available) return ctx.json({
		cached: false,
		lastBuildDate: null
	}, 503);
	const { requestPath } = ctx.req.valid("query");
	const { h64ToString } = await xxhash();
	const key = "rsshub:koa-redis-cache:" + h64ToString(requestPath + ":rss");
	const cached = await cache_default.globalCache.has(key);
	if (!cached) return ctx.json({
		cached: false,
		lastBuildDate: null
	}, 404);
	let lastBuildDate = null;
	try {
		const cachedData = await cache_default.globalCache.get(key);
		if (cachedData) lastBuildDate = JSON.parse(cachedData).lastBuildDate || null;
	} catch {}
	return ctx.json({
		cached,
		lastBuildDate
	}, 200);
};
//#endregion
//#region lib/api/index.ts
const app$1 = new OpenAPIHono();
app$1.openapi(route$4, handler$4);
app$1.openapi(route$3, handler$3);
app$1.openapi(routeNested, handler$3);
app$1.openapi(route$2, handler$2);
app$1.openapi(route$1, handler$1);
app$1.openapi(route$6, handler$6);
app$1.openapi(route, handler);
app$1.openapi(route$5, handler$5);
const docs = app$1.getOpenAPI31Document({
	openapi: "3.1.0",
	info: {
		version: "0.0.1",
		title: "RSSHub API"
	}
});
for (const path in docs.paths) {
	docs.paths[`/api${path}`] = docs.paths[path];
	delete docs.paths[path];
}
app$1.get("/openapi.json", (ctx) => ctx.json(docs));
app$1.get("/reference", Scalar({
	content: docs,
	hiddenClients: {
		c: true,
		clojure: true,
		csharp: true,
		dart: true,
		fsharp: true,
		go: false,
		http: true,
		java: true,
		js: true,
		kotlin: true,
		node: ["axios"],
		objc: true,
		ocaml: true,
		php: false,
		powershell: true,
		python: false,
		r: true,
		ruby: true,
		rust: true,
		shell: ["httpie", "wget"],
		swift: true
	}
}));
//#endregion
//#region lib/views/error.tsx
const Index = ({ requestPath, message, errorRoute, nodeVersion }) => /* @__PURE__ */ jsxs(Layout, { children: [
	/* @__PURE__ */ jsx("div", {
		className: "pointer-events-none absolute w-full min-h-screen",
		style: {
			backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMicgd2lkdGg9JzMyJyBoZWlnaHQ9JzMyJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYigxNSAyMyA0MiAvIDAuMDQpJz48cGF0aCBkPSdNMCAuNUgzMS41VjMyJy8+PC9zdmc+')`,
			maskImage: "linear-gradient(transparent, black, transparent)"
		}
	}),
	/* @__PURE__ */ jsxs("div", {
		className: "w-full grow shrink-0 py-8 flex items-center justify-center flex-col space-y-4",
		children: [
			/* @__PURE__ */ jsx("img", {
				className: "grayscale",
				src: "/logo.png",
				alt: "RSSHub",
				width: "100",
				loading: "lazy"
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold",
				children: "Looks like something went wrong"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "text-left w-[800px] space-y-6 !mt-10",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "mb-2 font-bold",
								children: "Helpful Information"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: [
									"Error Message:",
									/* @__PURE__ */ jsx("br", {}),
									/* @__PURE__ */ jsx("code", {
										className: "mt-2 block max-h-28 overflow-auto bg-zinc-100 align-bottom w-fit details whitespace-pre-line",
										children: message
									})
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: ["Route: ", /* @__PURE__ */ jsx("code", {
									className: "ml-2 bg-zinc-100",
									children: errorRoute
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: ["Full Route: ", /* @__PURE__ */ jsx("code", {
									className: "ml-2 bg-zinc-100",
									children: requestPath
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: ["Node Version: ", /* @__PURE__ */ jsx("code", {
									className: "ml-2 bg-zinc-100",
									children: nodeVersion
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: ["Git Hash: ", /* @__PURE__ */ jsx("code", {
									className: "ml-2 bg-zinc-100",
									children: gitHash
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "message",
								children: ["Git Date: ", /* @__PURE__ */ jsx("code", {
									className: "ml-2 bg-zinc-100",
									children: gitDate?.toUTCString()
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "mb-2 font-bold",
							children: "Report"
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"After carefully reading the",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								href: "https://docs.rsshub.app/",
								target: "_blank",
								children: "document"
							}),
							", if you think this is a bug of RSSHub, please",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								href: "https://github.com/DIYgod/RSSHub/issues/new?assignees=&labels=RSS+bug&template=bug_report_en.yml",
								target: "_blank",
								children: "submit an issue"
							}),
							" ",
							"on GitHub."
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"在仔细阅读",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								href: "https://docs.rsshub.app/zh/",
								target: "_blank",
								children: "文档"
							}),
							"后，如果你认为这是 RSSHub 的 bug，请在 GitHub",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								href: "https://github.com/DIYgod/RSSHub/issues/new?assignees=&labels=RSS+bug&template=bug_report_zh.yml",
								target: "_blank",
								children: "提交 issue"
							}),
							"。"
						] })
					] }),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "mb-2 font-bold",
							children: "Community"
						}),
						/* @__PURE__ */ jsxs("p", { children: [
							"You can also join our",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								target: "_blank",
								href: "https://t.me/rsshub",
								children: "Telegram group"
							}),
							", or follow our",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								target: "_blank",
								href: "https://t.me/awesomeRSSHub",
								children: "Telegram channel"
							}),
							" ",
							"and",
							" ",
							/* @__PURE__ */ jsx("a", {
								target: "_blank",
								href: "https://x.com/intent/follow?screen_name=_RSSHub",
								className: "text-[#F5712C]",
								children: "Twitter"
							}),
							" ",
							"to get community support and news."
						] }),
						/* @__PURE__ */ jsxs("p", { children: [
							"你也可以加入我们的",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								target: "_blank",
								href: "https://t.me/rsshub",
								children: "Telegram 群组"
							}),
							"，或关注我们的",
							" ",
							/* @__PURE__ */ jsx("a", {
								className: "text-[#F5712C]",
								target: "_blank",
								href: "https://t.me/awesomeRSSHub",
								children: "Telegram 频道"
							}),
							"和",
							" ",
							/* @__PURE__ */ jsx("a", {
								target: "_blank",
								href: "https://x.com/intent/follow?screen_name=_RSSHub",
								className: "text-[#F5712C]",
								children: "Twitter"
							}),
							" ",
							"获取社区支持和新闻。"
						] })
					] })
				]
			})
		]
	}),
	/* @__PURE__ */ jsxs("div", {
		className: "mt-4 pb-8 text-center w-full text-sm font-medium space-y-2",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "space-x-4",
				children: [
					/* @__PURE__ */ jsx("a", {
						target: "_blank",
						href: "https://github.com/DIYgod/RSSHub",
						children: /* @__PURE__ */ jsx("img", {
							className: "inline",
							src: "https://icons.ly/github/_/fff",
							alt: "github",
							width: "20",
							height: "20"
						})
					}),
					/* @__PURE__ */ jsx("a", {
						target: "_blank",
						href: "https://t.me/rsshub",
						children: /* @__PURE__ */ jsx("img", {
							className: "inline",
							src: "https://icons.ly/telegram",
							alt: "telegram group",
							width: "20",
							height: "20"
						})
					}),
					/* @__PURE__ */ jsx("a", {
						target: "_blank",
						href: "https://t.me/awesomeRSSHub",
						children: /* @__PURE__ */ jsx("img", {
							className: "inline",
							src: "https://icons.ly/telegram",
							alt: "telegram channel",
							width: "20",
							height: "20"
						})
					}),
					/* @__PURE__ */ jsx("a", {
						target: "_blank",
						href: "https://x.com/intent/follow?screen_name=_RSSHub",
						className: "text-[#F5712C]",
						children: /* @__PURE__ */ jsx("img", {
							className: "inline",
							src: "https://icons.ly/x",
							alt: "X",
							width: "20",
							height: "20"
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "!mt-6",
				children: [
					"Please consider",
					" ",
					/* @__PURE__ */ jsx("a", {
						target: "_blank",
						href: "https://docs.rsshub.app/sponsor",
						className: "text-[#F5712C]",
						children: "sponsoring"
					}),
					" ",
					"to help keep this open source project alive."
				]
			}),
			/* @__PURE__ */ jsxs("p", { children: [
				"Made with ❤️ by",
				" ",
				/* @__PURE__ */ jsx("a", {
					target: "_blank",
					href: "https://diygod.cc",
					className: "text-[#F5712C]",
					children: "DIYgod"
				}),
				" ",
				"and",
				" ",
				/* @__PURE__ */ jsx("a", {
					target: "_blank",
					href: "https://github.com/DIYgod/RSSHub/graphs/contributors",
					className: "text-[#F5712C]",
					children: "Contributors"
				}),
				" ",
				"under AGPL-3.0 License."
			] })
		]
	})
] });
//#endregion
//#region lib/errors/index.tsx
const Sentry$1 = config.sentry.dsn ? await import("@sentry/node") : void 0;
const errorHandler = (error, ctx) => {
	const requestPath = ctx.req.path;
	const matchedRoute = routePath(ctx);
	const hasMatchedRoute = matchedRoute !== "/*";
	const debug = getDebugInfo();
	try {
		if (ctx.res.headers.get("RSSHub-Cache-Status")) debug.hitCache++;
	} catch {}
	debug.error++;
	if (!debug.errorPaths[requestPath]) debug.errorPaths[requestPath] = 0;
	debug.errorPaths[requestPath]++;
	if (!debug.errorRoutes[matchedRoute] && hasMatchedRoute) debug.errorRoutes[matchedRoute] = 0;
	hasMatchedRoute && debug.errorRoutes[matchedRoute]++;
	setDebugInfo(debug);
	if (config.honeybadger.apiKey) Honeybadger.notify(error, { context: { name: requestPath.split("/", 2)[1] } });
	if (Sentry$1) Sentry$1.withScope((scope) => {
		scope.setTag("name", requestPath.split("/", 2)[1]);
		Sentry$1.captureException(error);
	});
	let errorMessage = (process.env.NODE_ENV || process.env.VERCEL_ENV) === "production" ? error.message : error.stack || error.message;
	switch (error.constructor.name) {
		case "HTTPError":
		case "RequestError":
		case "FetchError":
			ctx.status(503);
			break;
		case "RequestInProgressError":
			ctx.header("Cache-Control", `public, max-age=${config.requestTimeout / 1e3}`);
			ctx.status(503);
			break;
		case "RejectError":
			ctx.status(403);
			break;
		case "NotFoundError":
			ctx.status(404);
			errorMessage += "The route does not exist or has been deleted.";
			break;
		default:
			ctx.status(503);
			break;
	}
	const message = `${error.name}: ${errorMessage}`;
	logger.error(`Error in ${requestPath}: ${message}`);
	requestMetric.error({
		path: matchedRoute,
		method: ctx.req.method,
		status: ctx.res.status
	});
	return config.isPackage || ctx.req.query("format") === "json" ? ctx.json({ error: { message: error.message ?? error } }) : ctx.html(/* @__PURE__ */ jsx(Index, {
		requestPath,
		message,
		errorRoute: hasMatchedRoute ? matchedRoute : requestPath,
		nodeVersion: process.version
	}));
};
const notFoundHandler = (ctx) => errorHandler(new NotFoundError(), ctx);
//#endregion
//#region lib/middleware/access-control.ts
const reject = (requestPath) => {
	throw new RejectError(`Authentication failed. Access denied.\n${requestPath}`);
};
const middleware$10 = async (ctx, next) => {
	const requestPath = new URL(ctx.req.url).pathname;
	const accessKey = ctx.req.query("key");
	const accessCode = ctx.req.query("code");
	if ([
		"/",
		"/robots.txt",
		"/favicon.ico",
		"/logo.png"
	].includes(requestPath)) await next();
	else {
		if (config.accessKey && !(config.accessKey === accessKey || accessCode === md5(requestPath + config.accessKey))) return reject(requestPath);
		await next();
	}
};
//#endregion
//#region lib/middleware/anti-hotlink.ts
const templateRegex = /\$\{([^{}]+)\}/g;
const allowedUrlProperties = /* @__PURE__ */ new Set([
	"hash",
	"host",
	"hostname",
	"href",
	"origin",
	"password",
	"pathname",
	"port",
	"protocol",
	"search",
	"searchParams",
	"username"
]);
const matchPath = (path, paths) => {
	for (const p of paths) if (path.startsWith(p) && (path.length === p.length || path[p.length] === "/")) return true;
	return false;
};
const filterPath = (path) => {
	const include = config.hotlink.includePaths;
	const exclude = config.hotlink.excludePaths;
	return !(include && !matchPath(path, include)) && !(exclude && matchPath(path, exclude));
};
const interpolate = (str, obj) => str.replaceAll(templateRegex, (_, prop) => {
	let needEncode = false;
	if (prop.endsWith("_ue")) {
		prop = prop.slice(0, -3);
		needEncode = true;
	}
	return needEncode ? encodeURIComponent(obj[prop]) : obj[prop];
});
const parseUrl = (str) => {
	let url;
	try {
		url = new URL(str);
	} catch {
		logger.error(`Failed to parse ${str}`);
	}
	return url;
};
const replaceUrl = (template, url) => {
	if (!template || !url) return url;
	const oldUrl = parseUrl(url);
	if (oldUrl && oldUrl.protocol !== "data:") return interpolate(template, oldUrl);
	return url;
};
const replaceUrls = ($, selector, template, attribute = "src") => {
	$(selector).each((_, el) => {
		const oldSrc = $(el).attr(attribute);
		if (oldSrc) {
			const url = parseUrl(oldSrc);
			if (url && url.protocol !== "data:") $(el).attr(attribute, interpolate(template, url));
		}
	});
};
const process$1 = (html, image_hotlink_template, multimedia_hotlink_template) => {
	const $ = load(html, void 0, false);
	if (image_hotlink_template) {
		replaceUrls($, "img, picture > source", image_hotlink_template);
		replaceUrls($, "video[poster]", image_hotlink_template, "poster");
		replaceUrls($, "*[data-rsshub-image=\"href\"]", image_hotlink_template, "href");
	}
	if (multimedia_hotlink_template) {
		replaceUrls($, "video, video > source, audio, audio > source", multimedia_hotlink_template);
		if (!image_hotlink_template) replaceUrls($, "video[poster]", multimedia_hotlink_template, "poster");
	}
	return $.html();
};
const validateTemplate = (template) => {
	if (!template) return;
	for (const match of template.matchAll(templateRegex)) {
		const prop = match[1].endsWith("_ue") ? match[1].slice(0, -3) : match[1];
		if (!allowedUrlProperties.has(prop)) throw new Error(`Invalid URL property: ${prop}`);
	}
};
const middleware$9 = async (ctx, next) => {
	await next();
	let imageHotlinkTemplate;
	let multimediaHotlinkTemplate;
	if (config.feature.allow_user_hotlink_template) {
		multimediaHotlinkTemplate = ctx.req.query("multimedia_hotlink_template");
		imageHotlinkTemplate = ctx.req.query("image_hotlink_template");
	}
	if (config.hotlink.template) {
		imageHotlinkTemplate = filterPath(ctx.req.path) ? config.hotlink.template : void 0;
		multimediaHotlinkTemplate = filterPath(ctx.req.path) ? config.hotlink.template : void 0;
	}
	if (!imageHotlinkTemplate && !multimediaHotlinkTemplate) return;
	validateTemplate(imageHotlinkTemplate);
	validateTemplate(multimediaHotlinkTemplate);
	const data = ctx.get("data");
	if (data) {
		if (data.image) data.image = replaceUrl(imageHotlinkTemplate, data.image);
		if (data.description) data.description = process$1(data.description, imageHotlinkTemplate, multimediaHotlinkTemplate);
		if (data.item) for (const item of data.item) {
			if (item.description) item.description = process$1(item.description, imageHotlinkTemplate, multimediaHotlinkTemplate);
			if (item.enclosure_url && item.enclosure_type) {
				if (item.enclosure_type.startsWith("image/")) item.enclosure_url = replaceUrl(imageHotlinkTemplate, item.enclosure_url);
				else if (/^(?:video|audio)\//.test(item.enclosure_type)) item.enclosure_url = replaceUrl(multimediaHotlinkTemplate, item.enclosure_url);
			}
			if (item.image) item.image = replaceUrl(imageHotlinkTemplate, item.image);
			if (item.itunes_item_image) item.itunes_item_image = replaceUrl(imageHotlinkTemplate, item.itunes_item_image);
		}
		ctx.set("data", data);
	}
};
//#endregion
//#region lib/middleware/cache.ts
const bypassList = /* @__PURE__ */ new Set([
	"/",
	"/robots.txt",
	"/logo.png",
	"/favicon.ico"
]);
const middleware$8 = async (ctx, next) => {
	if (!cache_default.status.available || bypassList.has(ctx.req.path)) {
		await next();
		return;
	}
	const requestPath = ctx.req.path;
	const format = `:${ctx.req.query("format") || "rss"}`;
	const limit = ctx.req.query("limit") ? `:${ctx.req.query("limit")}` : "";
	const { h64ToString } = await xxhash();
	const key = "rsshub:koa-redis-cache:" + h64ToString(requestPath + format + limit);
	const controlKey = "rsshub:path-requested:" + h64ToString(requestPath + format + limit);
	if (await cache_default.globalCache.get(controlKey) === "1") {
		let retryTimes = process.env.NODE_ENV === "test" ? 1 : 10;
		let bypass = false;
		while (retryTimes > 0) {
			await new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 3e3 : 6e3));
			if (await cache_default.globalCache.get(controlKey) !== "1") {
				bypass = true;
				break;
			}
			retryTimes--;
		}
		if (!bypass) throw new RequestInProgressError("This path is currently fetching, please come back later!");
	}
	const value = await cache_default.globalCache.get(key);
	if (value) {
		ctx.status(200);
		ctx.header("RSSHub-Cache-Status", "HIT");
		ctx.set("data", JSON.parse(value));
		await next();
		return;
	}
	await cache_default.globalCache.set(controlKey, "1", config.cache.requestTimeout);
	ctx.set("cacheKey", key);
	ctx.set("cacheControlKey", controlKey);
	try {
		await next();
	} catch (error) {
		await cache_default.globalCache.set(controlKey, "0", config.cache.requestTimeout);
		throw error;
	}
	const data = ctx.get("data");
	if (ctx.res.headers.get("Cache-Control") !== "no-cache" && data) {
		data.lastBuildDate = (/* @__PURE__ */ new Date()).toUTCString();
		ctx.set("data", data);
		const body = JSON.stringify(data);
		await cache_default.globalCache.set(key, body, config.cache.routeExpire);
	}
	await cache_default.globalCache.set(controlKey, "0", config.cache.requestTimeout);
};
//#endregion
//#region lib/middleware/debug.ts
const middleware$7 = async (ctx, next) => {
	{
		const debug = getDebugInfo();
		if (!debug.paths[ctx.req.path]) debug.paths[ctx.req.path] = 0;
		debug.paths[ctx.req.path]++;
		debug.request++;
		setDebugInfo(debug);
	}
	await next();
	{
		const debug = getDebugInfo();
		const rPath = routePath(ctx);
		const hasMatchedRoute = rPath !== "/*";
		if (!debug.routes[rPath] && hasMatchedRoute) debug.routes[rPath] = 0;
		hasMatchedRoute && debug.routes[rPath]++;
		if (ctx.res.headers.get("RSSHub-Cache-Status")) debug.hitCache++;
		if (ctx.res.status === 304) debug.etag++;
		setDebugInfo(debug);
	}
};
//#endregion
//#region lib/middleware/header.ts
const headers = {
	"Access-Control-Allow-Methods": "GET",
	"Content-Type": "application/xml; charset=utf-8",
	"Cache-Control": `public, max-age=${config.cache.routeExpire}`,
	"X-Content-Type-Options": "nosniff"
};
if (config.nodeName) headers["RSSHub-Node"] = config.nodeName;
function etagMatches(etag, ifNoneMatch) {
	return ifNoneMatch !== null && ifNoneMatch.split(/,\s*/).includes(etag);
}
const middleware$6 = async (ctx, next) => {
	for (const key in headers) ctx.header(key, headers[key]);
	ctx.header("Access-Control-Allow-Origin", config.allowOrigin || new URL(ctx.req.url).host);
	await next();
	const rPath = routePath(ctx);
	if (rPath !== "/*") ctx.header("X-RSSHub-Route", rPath);
	const data = ctx.get("data");
	if (!data || ctx.res.headers.get("ETag")) return;
	const { lastBuildDate, ...etagData } = data;
	const etag = etagCalculate(JSON.stringify(etagData));
	ctx.header("ETag", etag);
	if (etagMatches(etag, ctx.req.header("If-None-Match") ?? null)) {
		ctx.status(304);
		ctx.set("no-content", true);
	} else ctx.header("Last-Modified", lastBuildDate);
};
//#endregion
//#region lib/middleware/honeybadger.ts
if (config.honeybadger.apiKey) {
	Honeybadger.configure({
		apiKey: config.honeybadger.apiKey,
		enableUncaught: false
	});
	Honeybadger.setContext({ node_name: config.nodeName });
	logger.info("Honeybadger inited.");
}
const middleware$5 = async (ctx, next) => {
	const time = Date.now();
	await next();
	if (config.honeybadger.apiKey && Date.now() - time >= config.errorTrackingRouteTimeout) Honeybadger.notify(/* @__PURE__ */ new Error("Route Timeout"), { context: { name: getRouteNameFromPath(ctx.req.path) } });
};
//#endregion
//#region lib/middleware/logger.ts
const colorStatus = (status) => {
	return {
		7: `\u{1B}[35m${status}\u{1B}[0m`,
		5: `\u{1B}[31m${status}\u{1B}[0m`,
		4: `\u{1B}[33m${status}\u{1B}[0m`,
		3: `\u{1B}[36m${status}\u{1B}[0m`,
		2: `\u{1B}[32m${status}\u{1B}[0m`,
		1: `\u{1B}[32m${status}\u{1B}[0m`,
		0: `\u{1B}[33m${status}\u{1B}[0m`
	}[Math.trunc(status / 100)];
};
const middleware$4 = async (ctx, next) => {
	const { method, raw, routePath } = ctx.req;
	const path = getPath(raw);
	logger.info(`<-- ${method} ${path}`);
	const start = Date.now();
	await next();
	const status = ctx.res.status;
	logger.info(`--> ${method} ${path} ${colorStatus(status)} ${time(start)}`);
	requestMetric.success(Date.now() - start, {
		path: routePath,
		method,
		status
	});
};
//#endregion
//#region lib/middleware/parameter.ts
const md = markdownit({ html: true });
const resolveRelativeLink = ($, elem, attr, baseUrl) => {
	const $elem = $(elem);
	if (baseUrl) try {
		const oldAttr = $elem.attr(attr);
		if (oldAttr) $elem.attr(attr, new URL(oldAttr, baseUrl).href);
	} catch {}
};
const getAiCompletion = async (prompt, text) => {
	return (await rofetch(`${config.openai.endpoint}/chat/completions`, {
		method: "POST",
		body: {
			model: config.openai.model,
			max_tokens: config.openai.maxTokens,
			messages: [{
				role: "system",
				content: prompt
			}, {
				role: "user",
				content: text
			}],
			temperature: config.openai.temperature
		},
		headers: { Authorization: `Bearer ${config.openai.apiKey}` }
	})).choices[0].message.content;
};
const getAuthorString = (item) => {
	let author = "";
	if (item.author) author = typeof item.author === "string" ? item.author : item.author.map((i) => i.name).join(" ");
	return author;
};
const middleware$3 = async (ctx, next) => {
	await next();
	const data = ctx.get("data");
	if (data) {
		if ((!data.item || data.item.length === 0) && !data.allowEmpty) throw new Error("this route is empty, please check the original site or <a href=\"https://github.com/DIYgod/RSSHub/issues/new/choose\">create an issue</a>");
		data.item ||= [];
		data.title &&= entities.decodeXML(data.title + "");
		data.description &&= entities.decodeXML(data.description + "");
		if (ctx.req.query("sorted") !== "false") data.item = data.item.toSorted((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));
		const handleItem = (item) => {
			item.title &&= entities.decodeXML(item.title + "");
			if (item.pubDate) item.pubDate = new Date(item.pubDate).toUTCString();
			if (item.link) {
				let baseUrl = data.link;
				if (baseUrl && !/^https?:\/\//.test(baseUrl)) baseUrl = baseUrl.startsWith("//") ? "http:" + baseUrl : "http://" + baseUrl;
				item.link = new URL(item.link, baseUrl).href;
			}
			if (item.description) {
				const $ = load(item.description);
				let baseUrl = item.link || data.link;
				if (baseUrl && !/^https?:\/\//.test(baseUrl)) baseUrl = baseUrl.startsWith("//") ? "http:" + baseUrl : "http://" + baseUrl;
				$("script").remove();
				$("img").each((_, ele) => {
					const $ele = $(ele);
					if (!$ele.attr("src")) {
						const lazySrc = $ele.attr("data-src") || $ele.attr("data-original");
						if (lazySrc) $ele.attr("src", lazySrc);
						else for (const key in ele.attribs) {
							const value = ele.attribs[key].trim();
							if ([
								".gif",
								".png",
								".jpg",
								".webp"
							].some((suffix) => value.includes(suffix))) {
								$ele.attr("src", value);
								break;
							}
						}
					}
					for (const e of [
						"onclick",
						"onerror",
						"onload"
					]) $ele.removeAttr(e);
				});
				$("a, area").each((_, elem) => {
					resolveRelativeLink($, elem, "href", baseUrl);
				});
				$("img, video, audio, source, iframe, embed, track").each((_, elem) => {
					resolveRelativeLink($, elem, "src", baseUrl);
				});
				$("video[poster]").each((_, elem) => {
					resolveRelativeLink($, elem, "poster", baseUrl);
				});
				$("img, iframe").each((_, elem) => {
					if (!$(elem).attr("referrerpolicy")) $(elem).attr("referrerpolicy", "no-referrer");
				});
				item.description = $("body").html() + "" + (config.suffix || "");
				if (item._extra?.links && $(".rsshub-quote").length) item._extra?.links?.map((e) => {
					e.content_html = $.html($(".rsshub-quote"));
					return e;
				});
			}
			if (item.category) {
				Array.isArray(item.category) || (item.category = [item.category]);
				item.category = item.category.filter((e) => typeof e === "string");
			}
			return item;
		};
		data.item = await Promise.all(data.item.map((itm) => handleItem(itm)));
		const engine = config.feature.filter_regex_engine;
		const makeRegex = (str) => {
			const insensitive = ctx.req.query("filter_case_sensitive") === "false";
			switch (engine) {
				case "regexp": return new RegExp(str, insensitive ? "i" : "");
				case "re2": return RE2JS.compile(str, insensitive ? RE2JS.CASE_INSENSITIVE : 0);
				default: throw new Error(`Invalid Engine Value: ${engine}, please check your config.`);
			}
		};
		if (ctx.req.query("filter")) {
			const regex = makeRegex(ctx.req.query("filter"));
			data.item = data.item.filter((item) => {
				const title = item.title || "";
				const description = item.description || title;
				const author = getAuthorString(item);
				const category = item.category || [];
				return regex instanceof RE2JS ? regex.matcher(title).find() || regex.matcher(description).find() || regex.matcher(author).find() || category.some((c) => regex.matcher(c).find()) : title.match(regex) || description.match(regex) || author.match(regex) || category.some((c) => c.match(regex));
			});
		}
		if (!ctx.req.query("filter") && (ctx.req.query("filter_title") || ctx.req.query("filter_description") || ctx.req.query("filter_author") || ctx.req.query("filter_category"))) data.item = data.item.filter((item) => {
			const title = item.title || "";
			const description = item.description || title;
			const author = getAuthorString(item);
			const category = item.category || [];
			let isFilter = true;
			if (ctx.req.query("filter_title")) {
				const titleRegex = makeRegex(ctx.req.query("filter_title"));
				isFilter = titleRegex instanceof RE2JS ? titleRegex.matcher(title).find() : !!titleRegex.test(title);
			}
			if (ctx.req.query("filter_description")) {
				const descriptionRegex = makeRegex(ctx.req.query("filter_description"));
				isFilter &&= descriptionRegex instanceof RE2JS ? descriptionRegex.matcher(description).find() : !!descriptionRegex.test(description);
			}
			if (ctx.req.query("filter_author")) {
				const authorRegex = makeRegex(ctx.req.query("filter_author"));
				isFilter &&= authorRegex instanceof RE2JS ? authorRegex.matcher(author).find() : !!authorRegex.test(author);
			}
			if (ctx.req.query("filter_category")) {
				const categoryRegex = makeRegex(ctx.req.query("filter_category"));
				isFilter &&= category.some((c) => categoryRegex instanceof RE2JS ? categoryRegex.matcher(c).find() : c.match(categoryRegex));
			}
			return isFilter;
		});
		if (ctx.req.query("filterout") || ctx.req.query("filterout_title") || ctx.req.query("filterout_description") || ctx.req.query("filterout_author") || ctx.req.query("filterout_category")) data.item = data.item.filter((item) => {
			const title = item.title;
			const description = item.description || title;
			const author = getAuthorString(item);
			const category = item.category || [];
			let isFilter = true;
			if (ctx.req.query("filterout") || ctx.req.query("filterout_title")) {
				const titleRegex = makeRegex(ctx.req.query("filterout_title") || ctx.req.query("filterout"));
				isFilter = titleRegex instanceof RE2JS ? !titleRegex.matcher(title).find() : !titleRegex.test(title);
			}
			if (ctx.req.query("filterout") || ctx.req.query("filterout_description")) {
				const descriptionRegex = makeRegex(ctx.req.query("filterout_description") || ctx.req.query("filterout"));
				isFilter &&= descriptionRegex instanceof RE2JS ? !descriptionRegex.matcher(description).find() : !descriptionRegex.test(description);
			}
			if (ctx.req.query("filterout_author")) {
				const authorRegex = makeRegex(ctx.req.query("filterout_author"));
				isFilter &&= authorRegex instanceof RE2JS ? !authorRegex.matcher(author).find() : !authorRegex.test(author);
			}
			if (ctx.req.query("filterout_category")) {
				const categoryRegex = makeRegex(ctx.req.query("filterout_category"));
				isFilter &&= category.every((c) => !(categoryRegex instanceof RE2JS ? categoryRegex.matcher(c).find() : c.match(categoryRegex)));
			}
			return isFilter;
		});
		if (ctx.req.query("filter_time")) {
			const now = Date.now();
			data.item = data.item.filter(({ pubDate }) => {
				let isFilter = true;
				try {
					isFilter = !pubDate || now - new Date(pubDate).getTime() <= Number.parseInt(ctx.req.query("filter_time")) * 1e3;
				} catch {}
				return isFilter;
			});
		}
		if (ctx.req.query("limit")) data.item = data.item.slice(0, Number.parseInt(ctx.req.query("limit")));
		if (ctx.req.query("tgiv")) data.item.map((item) => {
			if (item.link) {
				item.link = `https://t.me/iv?url=${encodeURIComponent(item.link)}&rhash=${ctx.req.query("tgiv")}`;
				return item;
			}
			return item;
		});
		if (ctx.req.query("mode")?.toLowerCase() === "fulltext") {
			const tasks = data.item.map(async (item) => {
				const { link, author, description } = item;
				const parsed_result = await cache_default.tryGet(`mercury-cache-${link}`, async () => {
					if (link) try {
						const $ = load(await rofetch(link));
						return await Parser.parse(link, { html: $.html() });
					} catch {}
				});
				item.author = author || parsed_result?.author;
				item.description = parsed_result && parsed_result.content.length > 40 ? entities.decodeXML(parsed_result.content) : description;
			});
			await Promise.all(tasks);
		}
		if (ctx.req.query("chatgpt") && config.openai.apiKey) data.item = await Promise.all(data.item.map(async (item) => {
			try {
				if (config.openai.inputOption === "description" && item.description) {
					const description = await cache_default.tryGet(`openai:description:${item.link}`, async () => {
						const description = convert(item.description);
						const descriptionMd = await getAiCompletion(config.openai.promptDescription, description);
						return md.render(descriptionMd);
					});
					if (description !== "") item.description = description + "<hr/><br/>" + item.description;
				} else if (config.openai.inputOption === "title" && item.title) {
					const title = await cache_default.tryGet(`openai:title:${item.link}`, async () => {
						const title = convert(item.title);
						return await getAiCompletion(config.openai.promptTitle, title);
					});
					if (title !== "") item.title = title + "";
				} else if (config.openai.inputOption === "both" && item.title && item.description) {
					const title = await cache_default.tryGet(`openai:title:${item.link}`, async () => {
						const title = convert(item.title);
						return await getAiCompletion(config.openai.promptTitle, title);
					});
					if (title !== "") item.title = title + "";
					const description = await cache_default.tryGet(`openai:description:${item.link}`, async () => {
						const description = convert(item.description);
						const descriptionMd = await getAiCompletion(config.openai.promptDescription, description);
						return md.render(descriptionMd);
					});
					if (description !== "") item.description = description + "<hr/><br/>" + item.description;
				}
			} catch {}
			return item;
		}));
		if (ctx.req.query("scihub")) data.item.map((item) => {
			item.link = item.doi ? `${config.scihub.host}${item.doi}` : `${config.scihub.host}${item.link}`;
			return item;
		});
		if (ctx.req.query("opencc")) for (const item of data.item) {
			item.title = simplecc(item.title ?? item.link, ctx.req.query("opencc"));
			item.description = simplecc(item.description ?? item.title ?? item.link, ctx.req.query("opencc"));
		}
		if (ctx.req.query("brief")) if (/[1-9]\d{2,}/.test(ctx.req.query("brief"))) {
			const brief = Number.parseInt(ctx.req.query("brief"));
			for (const item of data.item) {
				if (!item.description) continue;
				const text = sanitizeHtml(item.description, {
					allowedTags: [],
					allowedAttributes: {}
				});
				item.description = text.length > brief ? `<p>${text.slice(0, brief)}…</p>` : `<p>${text}</p>`;
			}
		} else throw new Error("Invalid parameter brief. Please check the doc https://docs.rsshub.app/guide/parameters#shu-chu-jian-xun");
		ctx.set("data", data);
	}
};
//#endregion
//#region lib/middleware/sentry.ts
let Sentry;
if (config.sentry.dsn) {
	Sentry = await import("@sentry/node");
	Sentry.init({ dsn: config.sentry.dsn });
	Sentry.getCurrentScope().setTag("node_name", config.nodeName);
	logger.info("Sentry inited.");
}
const middleware$2 = async (ctx, next) => {
	const time = Date.now();
	await next();
	if (Sentry && Date.now() - time >= config.errorTrackingRouteTimeout) Sentry.withScope((scope) => {
		scope.setTag("name", getRouteNameFromPath(ctx.req.path));
		Sentry.captureException(/* @__PURE__ */ new Error("Route Timeout"));
	});
};
//#endregion
//#region lib/views/atom.tsx
const RSS$1 = ({ data }) => /* @__PURE__ */ jsxs("feed", {
	xmlns: "http://www.w3.org/2005/Atom",
	"xmlns:rsshub": "http://rsshub.app/xml/schemas",
	children: [
		/* @__PURE__ */ jsx("title", { children: data.title || "RSSHub" }),
		/* @__PURE__ */ jsx("link", { href: data.link || "https://docs.rsshub.app" }),
		/* @__PURE__ */ jsx("id", { children: data.id || data.link }),
		/* @__PURE__ */ jsxs("subtitle", { children: [data.description || data.title, " - Powered by RSSHub"] }),
		/* @__PURE__ */ jsx("generator", { children: "RSSHub" }),
		/* @__PURE__ */ jsx("webMaster", { children: "contact@rsshub.app (RSSHub)" }),
		/* @__PURE__ */ jsx("language", { children: data.language || "en" }),
		/* @__PURE__ */ jsx("updated", { children: data.lastBuildDate }),
		/* @__PURE__ */ jsx("author", { children: /* @__PURE__ */ jsx("name", { children: data.author || "RSSHub" }) }),
		data.icon && /* @__PURE__ */ jsx("icon", { children: data.icon }),
		data.logo && /* @__PURE__ */ jsx("logo", { children: data.logo }),
		data.item?.map((item) => /* @__PURE__ */ jsxs("entry", { children: [
			/* @__PURE__ */ jsx("title", { children: item.title }),
			/* @__PURE__ */ jsx("content", {
				type: "html",
				src: item.link,
				children: item.description
			}),
			/* @__PURE__ */ jsx("link", { href: item.link }),
			/* @__PURE__ */ jsx("id", { children: item.guid || item.link || item.title }),
			item.pubDate && /* @__PURE__ */ jsx("published", { children: item.pubDate }),
			item.updated && /* @__PURE__ */ jsx("updated", { children: item.updated || item.pubDate }),
			item.author && /* @__PURE__ */ jsx("author", { children: /* @__PURE__ */ jsx("name", { children: item.author }) }),
			typeof item.category === "string" ? /* @__PURE__ */ jsx("category", { term: item.category }) : item.category?.map((c) => /* @__PURE__ */ jsx("category", { term: c })),
			item.media && Object.entries(item.media).map(([key, value]) => {
				return /* @__PURE__ */ jsx(`media:${key}`, { ...value });
			}),
			item.upvotes ? /* @__PURE__ */ jsx("rsshub:upvotes", { children: item.upvotes }) : "",
			item.downvotes ? /* @__PURE__ */ jsx("rsshub:downvotes", { children: item.downvotes }) : "",
			item.comments ? /* @__PURE__ */ jsx("rsshub:comments", { children: item.comments }) : ""
		] }))
	]
});
//#endregion
//#region lib/views/json.ts
/**
* This function should be used by RSSHub middleware only.
* @param {object} data ctx.state.data
* @returns `JSON.stringify`-ed [JSON Feed](https://www.jsonfeed.org/)
*/
const json = (data) => {
	const jsonFeed = {
		version: "https://jsonfeed.org/version/1.1",
		title: data.title || "RSSHub",
		home_page_url: data.link || "https://docs.rsshub.app",
		feed_url: data.feedLink,
		description: `${data.description || data.title} - Powered by RSSHub`,
		icon: data.image,
		authors: typeof data.author === "string" ? [{ name: data.author }] : data.author,
		language: data.language || "zh-cn",
		items: data.item?.map((item) => ({
			id: item.guid || item.id || item.link,
			url: item.link,
			title: item.title,
			content_html: item.content && item.content.html || item.description || item.title,
			content_text: item.content && item.content.text,
			summary: item.description,
			image: item.image || item.itunes_item_image,
			banner_image: item.banner,
			date_published: item.pubDate,
			date_modified: item.updated,
			authors: typeof item.author === "string" ? [{ name: item.author }] : item.author,
			tags: typeof item.category === "string" ? [item.category] : item.category,
			language: item.language,
			attachments: item.attachments || (item.enclosure_url ? [{
				url: item.enclosure_url,
				mime_type: item.enclosure_type,
				title: item.enclosure_title,
				size_in_bytes: item.enclosure_length,
				duration_in_seconds: item.itunes_duration
			}] : void 0),
			_extra: item._extra || void 0
		}))
	};
	return JSON.stringify(jsonFeed);
};
//#endregion
//#region lib/views/rss.tsx
const RSS = ({ data }) => {
	const hasItunes = data.itunes_author || data.itunes_category || data.item && data.item.some((i) => i.itunes_item_image || i.itunes_duration);
	const hasMedia = data.item?.some((i) => i.media);
	const isTelegramLink = data.link?.startsWith("https://t.me/s/");
	return /* @__PURE__ */ jsx("rss", {
		"xmlns:atom": "http://www.w3.org/2005/Atom",
		"xmlns:itunes": hasItunes ? "http://www.itunes.com/dtds/podcast-1.0.dtd" : void 0,
		"xmlns:media": hasMedia ? "http://search.yahoo.com/mrss/" : void 0,
		version: "2.0",
		children: /* @__PURE__ */ jsxs("channel", { children: [
			/* @__PURE__ */ jsx("title", { children: data.title || "RSSHub" }),
			/* @__PURE__ */ jsx("link", { children: data.link || "https://docs.rsshub.app" }),
			/* @__PURE__ */ jsx("atom:link", {
				href: data.atomlink,
				rel: "self",
				type: "application/rss+xml"
			}),
			/* @__PURE__ */ jsxs("description", { children: [data.description || data.title, " - Powered by RSSHub"] }),
			/* @__PURE__ */ jsx("generator", { children: "RSSHub" }),
			/* @__PURE__ */ jsx("webMaster", { children: "contact@rsshub.app (RSSHub)" }),
			data.itunes_author && /* @__PURE__ */ jsx("itunes:author", { children: data.itunes_author }),
			data.itunes_category && /* @__PURE__ */ jsx("itunes:category", { text: data.itunes_category }),
			data.itunes_author && /* @__PURE__ */ jsx("itunes:explicit", { children: data.itunes_explicit || "false" }),
			/* @__PURE__ */ jsx("language", { children: data.language || "en" }),
			data.image && /* @__PURE__ */ jsxs("image", { children: [
				/* @__PURE__ */ jsx("url", { children: data.image }),
				/* @__PURE__ */ jsx("title", { children: data.title || "RSSHub" }),
				/* @__PURE__ */ jsx("link", { children: data.link }),
				isTelegramLink && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("height", { children: "31" }), /* @__PURE__ */ jsx("width", { children: "88" })] })
			] }),
			/* @__PURE__ */ jsx("lastBuildDate", { children: data.lastBuildDate }),
			/* @__PURE__ */ jsx("ttl", { children: data.ttl }),
			data.item?.map((item) => /* @__PURE__ */ jsxs("item", { children: [
				/* @__PURE__ */ jsx("title", { children: item.title }),
				/* @__PURE__ */ jsx("description", { children: item.description }),
				/* @__PURE__ */ jsx("link", { children: item.link }),
				/* @__PURE__ */ jsx("guid", {
					isPermaLink: "false",
					children: item.guid || item.link || item.title
				}),
				item.pubDate && /* @__PURE__ */ jsx("pubDate", { children: item.pubDate }),
				item.author && /* @__PURE__ */ jsx("author", { children: item.author }),
				item.image && /* @__PURE__ */ jsx("enclosure", {
					url: item.image,
					type: "image/jpeg"
				}),
				item.itunes_item_image && /* @__PURE__ */ jsx("itunes:image", { href: item.itunes_item_image }),
				item.enclosure_url && /* @__PURE__ */ jsx("enclosure", {
					url: item.enclosure_url,
					length: item.enclosure_length,
					type: item.enclosure_type
				}),
				item.itunes_duration && /* @__PURE__ */ jsx("itunes:duration", { children: item.itunes_duration }),
				typeof item.category === "string" ? /* @__PURE__ */ jsx("category", { children: item.category }) : item.category?.map((c) => /* @__PURE__ */ jsx("category", { children: c })),
				item.media && Object.entries(item.media).map(([key, value]) => {
					return /* @__PURE__ */ jsx(`media:${key}`, { ...value });
				})
			] }))
		] })
	});
};
//#endregion
//#region lib/views/rss3.ts
/**
* This function should be used by RSSHub middleware only.
* @param {object} data ctx.state.data
* @returns `JSON.stringify`-ed [UMS Result](https://docs.rss3.io/docs/unified-metadata-schemas)
*/
const NETWORK = "rsshub";
const TAG = "RSS";
const TYPE = "feed";
const PLATFORM = "RSSHub";
const rss3 = (data) => {
	const currentUnixTsp = dayjs().unix();
	return { data: data.item.map((item) => {
		const owner = getOwnershipFieldFromURL(item);
		return {
			owner,
			id: item.link,
			network: NETWORK,
			from: owner,
			to: owner,
			tag: TAG,
			type: TYPE,
			direction: "out",
			feeValue: "0",
			actions: [{
				tag: TAG,
				type: TYPE,
				platform: PLATFORM,
				from: owner,
				to: owner,
				metadata: {
					authors: typeof item.author === "string" ? [{ name: item.author }] : item.author,
					description: item.description,
					pub_date: item.pubDate,
					tags: typeof item.category === "string" ? [item.category] : item.category,
					title: item.title
				},
				related_urls: [item.link]
			}],
			timestamp: dayjs(item.updated).unix() || currentUnixTsp
		};
	}) };
};
function getOwnershipFieldFromURL(item) {
	try {
		return new URL(item.link).hostname;
	} catch {
		return item.link;
	}
}
//#endregion
//#region lib/middleware/template.tsx
const middleware$1 = async (ctx, next) => {
	const ttl = cache_default.status.available && Math.trunc(config.cache.routeExpire / 60) || 1;
	await next();
	const apiData = ctx.get("apiData");
	if (apiData) return ctx.json(apiData);
	const data = ctx.get("data");
	const outputType = ctx.req.query("format") || "rss";
	if (config.debugInfo) {
		if (outputType === "debug.json") return ctx.json(ctx.get("json") || { message: "plugin does not set debug json" });
		if (/\d+\.debug\.html$/.test(outputType)) {
			const index = Number.parseInt(outputType.match(/(\d+)\.debug\.html$/)?.[1] || "0");
			return ctx.html(data?.item?.[index]?.description || `data.item[${index}].description not found`);
		}
	}
	if (data) {
		data.title = collapseWhitespace(data.title) || "";
		data.description &&= collapseWhitespace(data.description) || "";
		data.author &&= collapseWhitespace(data.author) || "";
		if (data.item) for (const item of data.item) {
			if (item.title) {
				item.title = collapseWhitespace(item.title) || "";
				for (let length = 0, i = 0; i < item.title.length; i++) {
					length += Buffer.from(item.title[i]).length === 1 ? 1 : 2;
					if (length > config.titleLengthLimit) {
						item.title = `${item.title.slice(0, i)}...`;
						break;
					}
				}
			}
			if (item.description) item.description = item.description.replaceAll(/[\u{0000}-\u{0009}\v\f\u{000E}-\u{001F}\u{007F}\u{200B}\u{FFFF}]/gu, "");
			if (typeof item.author === "string") item.author = collapseWhitespace(item.author) || "";
			else if (typeof item.author === "object" && item.author !== null) {
				for (const a of item.author) a.name = collapseWhitespace(a.name) || "";
				if (outputType !== "json") item.author = item.author.map((a) => a.name).join(", ");
			}
			if (item.itunes_duration && (typeof item.itunes_duration === "string" && !item.itunes_duration.includes(":") || typeof item.itunes_duration === "number" && !Number.isNaN(item.itunes_duration))) {
				item.itunes_duration = +item.itunes_duration;
				item.itunes_duration = Math.floor(item.itunes_duration / 3600) + ":" + (Math.floor(item.itunes_duration % 3600 / 60) / 100).toFixed(2).slice(-2) + ":" + (item.itunes_duration % 3600 % 60 / 100).toFixed(2).slice(-2);
			}
			if (outputType !== "rss") {
				try {
					item.pubDate &&= convertDateToISO8601(item.pubDate) || "";
				} catch {
					item.pubDate = "";
				}
				try {
					item.updated &&= convertDateToISO8601(item.updated) || "";
				} catch {
					item.updated = "";
				}
			}
		}
	}
	const currentDate = /* @__PURE__ */ new Date();
	const result = {
		lastBuildDate: currentDate.toUTCString(),
		updated: currentDate.toISOString(),
		ttl,
		atomlink: ctx.req.url,
		...data
	};
	if (config.isPackage) return ctx.json(result);
	if (ctx.get("redirect")) return ctx.redirect(ctx.get("redirect"), 301);
	if (ctx.get("no-content")) return ctx.body(null);
	switch (outputType) {
		case "ums":
		case "rss3": return ctx.json(rss3(result));
		case "json":
			ctx.header("Content-Type", "application/feed+json; charset=UTF-8");
			return ctx.body(json(result));
		case "atom": return ctx.render(/* @__PURE__ */ jsx(RSS$1, { data: result }));
		default: return ctx.render(/* @__PURE__ */ jsx(RSS, { data: result }));
	}
};
//#endregion
//#region lib/middleware/trace.ts
const middleware = async (ctx, next) => {
	if (config.debugInfo) {
		const { method, raw } = ctx.req;
		const path = getPath(raw);
		const span = tracer.startSpan(`${method} ${path}`, {
			kind: 1,
			attributes: {}
		});
		span.addEvent("invoking handleRequest");
		await next();
		span.end();
	} else await next();
};
//#endregion
//#region lib/app-bootstrap.tsx
process.on("uncaughtException", (e) => {
	logger.error("uncaughtException: " + e);
});
const app = new Hono();
app.use(trimTrailingSlash());
app.use(compress());
app.use(jsxRenderer(({ children }) => /* @__PURE__ */ jsx(Fragment, { children }), {
	docType: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
	stream: {}
}));
app.use(middleware$4);
app.use(middleware);
app.use(middleware$5);
app.use(middleware$2);
app.use(middleware$10);
app.use(middleware$7);
app.use(middleware$1);
app.use(middleware$6);
app.use(middleware$9);
app.use(middleware$3);
app.use(middleware$8);
app.route("/", app$2);
app.route("/api", app$1);
app.notFound(notFoundHandler);
app.onError(errorHandler);
//#endregion
export { app as default };
