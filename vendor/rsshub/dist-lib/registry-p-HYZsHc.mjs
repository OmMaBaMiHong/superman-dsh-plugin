import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as isWorker } from "./is-worker-B5Qd1sOL.mjs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { routePath } from "hono/route";
import { execSync } from "node:child_process";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { PrometheusExporter, PrometheusSerializer } from "@opentelemetry/exporter-prometheus";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BasicTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import fs from "node:fs";
//#region lib/routes/healthz.ts
const handler$3 = (ctx) => {
	ctx.header("Cache-Control", "no-cache");
	return ctx.text("ok");
};
//#endregion
//#region lib/utils/debug-info.ts
const debug = {
	hitCache: 0,
	request: 0,
	etag: 0,
	error: 0,
	routes: {},
	paths: {},
	errorRoutes: {},
	errorPaths: {}
};
const getDebugInfo = () => debug;
const setDebugInfo = (info) => Object.assign(debug, info);
//#endregion
//#region lib/utils/git-hash.ts
let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate;
if (!gitHash) try {
	gitHash = execSync("git rev-parse HEAD").toString().trim().slice(0, 8);
	gitDate = new Date(execSync("git log -1 --format=%cd").toString().trim());
} catch {
	gitHash = "unknown";
}
//#endregion
//#region lib/views/layout.tsx
const Layout = (props) => /* @__PURE__ */ jsxs("html", { children: [/* @__PURE__ */ jsxs("head", { children: [
	/* @__PURE__ */ jsx("title", { children: "Welcome to RSSHub!" }),
	/* @__PURE__ */ jsx("script", { src: "https://cdn.tailwindcss.com" }),
	/* @__PURE__ */ jsx("style", { children: `
                details::-webkit-scrollbar {
                    width: 0.25rem;
                }
                details::-webkit-scrollbar-thumb {
                    border-radius: 0.125rem;
                    background-color: #e4e4e7;
                }
                details::-webkit-scrollbar-thumb:hover {
                    background-color: #a1a1aa;
                }

                @font-face {
                    font-family: SN Pro;
                    font-style: normal;
                    font-display: swap;
                    font-weight: 400;
                    src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-400-normal.woff2) format(woff2);
                }
                @font-face {
                    font-family: SN Pro;
                    font-style: normal;
                    font-display: swap;
                    font-weight: 500;
                    src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-500-normal.woff2) format(woff2);
                }
                @font-face {
                    font-family: SN Pro;
                    font-style: normal;
                    font-display: swap;
                    font-weight: 700;
                    src: url(https://cdn.jsdelivr.net/fontsource/fonts/sn-pro@latest/latin-700-normal.woff2) format(woff2);
                }
                body {
                    font-family: SN Pro, sans-serif;
                }
                ` })
] }), /* @__PURE__ */ jsx("body", {
	className: "antialiased min-h-screen text-zinc-700 flex flex-col",
	children: props.children
})] });
//#endregion
//#region lib/views/index.tsx
const startTime = Date.now();
const Index = ({ debugQuery }) => {
	const debug = getDebugInfo();
	const showDebug = !config.debugInfo || config.debugInfo === "false" ? false : config.debugInfo === "true" || config.debugInfo === debugQuery;
	const { disallowRobot, nodeName, cache } = config;
	const duration = Date.now() - startTime;
	const info = {
		showDebug,
		disallowRobot,
		debug: [
			...nodeName ? [{
				name: "Node Name",
				value: nodeName
			}] : [],
			...gitHash ? [{
				name: "Git Hash",
				value: /* @__PURE__ */ jsx("a", {
					className: "underline",
					href: `https://github.com/DIYgod/RSSHub/commit/${gitHash}`,
					children: gitHash
				})
			}] : [],
			...gitDate ? [{
				name: "Git Date",
				value: gitDate.toUTCString()
			}] : [],
			{
				name: "Cache Duration",
				value: cache.routeExpire + "s"
			},
			{
				name: "Request Amount",
				value: debug.request
			},
			{
				name: "Request Frequency",
				value: (debug.request / (duration / 1e3) * 60).toFixed(3) + " times/minute"
			},
			{
				name: "Cache Hit Ratio",
				value: debug.request ? (debug.hitCache / debug.request * 100).toFixed(2) + "%" : 0
			},
			{
				name: "ETag Matched Ratio",
				value: debug.request ? (debug.etag / debug.request * 100).toFixed(2) + "%" : 0
			},
			{
				name: "Health",
				value: debug.request ? ((1 - debug.error / debug.request) * 100).toFixed(2) + "%" : 0
			},
			{
				name: "Uptime",
				value: (duration / 36e5).toFixed(2) + " hour(s)"
			},
			{
				name: "Hot Routes",
				value: Object.keys(debug.routes).toSorted((a, b) => debug.routes[b] - debug.routes[a]).slice(0, 30).map((route) => /* @__PURE__ */ jsxs(Fragment, { children: [
					debug.routes[route],
					" ",
					route,
					/* @__PURE__ */ jsx("br", {})
				] }))
			},
			{
				name: "Hot Paths",
				value: Object.keys(debug.paths).toSorted((a, b) => debug.paths[b] - debug.paths[a]).slice(0, 30).map((path) => /* @__PURE__ */ jsxs(Fragment, { children: [
					debug.paths[path],
					" ",
					path,
					/* @__PURE__ */ jsx("br", {})
				] }))
			},
			{
				name: "Hot Error Routes",
				value: Object.keys(debug.errorRoutes).toSorted((a, b) => debug.errorRoutes[b] - debug.errorRoutes[a]).slice(0, 30).map((route) => /* @__PURE__ */ jsxs(Fragment, { children: [
					debug.errorRoutes[route],
					" ",
					route,
					/* @__PURE__ */ jsx("br", {})
				] }))
			},
			{
				name: "Hot Error Paths",
				value: Object.keys(debug.errorPaths).toSorted((a, b) => debug.errorPaths[b] - debug.errorPaths[a]).slice(0, 30).map((path) => /* @__PURE__ */ jsxs(Fragment, { children: [
					debug.errorPaths[path],
					" ",
					path,
					/* @__PURE__ */ jsx("br", {})
				] }))
			}
		]
	};
	return /* @__PURE__ */ jsxs(Layout, { children: [
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
					src: "./logo.png",
					alt: "RSSHub",
					width: "100",
					loading: "lazy"
				}),
				/* @__PURE__ */ jsxs("h1", {
					className: "text-4xl font-bold",
					children: [
						"Welcome to ",
						/* @__PURE__ */ jsx("span", {
							className: "text-[#F5712C]",
							children: "RSSHub"
						}),
						"!"
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xl font-medium text-zinc-600",
					children: "The world's largest RSS Network."
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-zinc-500",
					children: "If you see this page, the RSSHub is successfully installed and working."
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "max-w-xl text-center text-zinc-500",
					children: [
						"Pair your feeds with",
						" ",
						/* @__PURE__ */ jsx("a", {
							target: "_blank",
							href: "https://folo.is/",
							className: "text-[#F5712C]",
							children: "Folo"
						}),
						", an AI RSS reader built for feed discovery and modern reading workflows. Source code is available on",
						" ",
						/* @__PURE__ */ jsx("a", {
							target: "_blank",
							href: "https://github.com/RSSNext/Folo",
							className: "text-[#F5712C]",
							children: "GitHub"
						}),
						"."
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "font-bold space-x-4 text-sm",
					children: [
						/* @__PURE__ */ jsx("a", {
							target: "_blank",
							href: "https://docs.rsshub.app",
							children: /* @__PURE__ */ jsx("button", {
								className: "text-white bg-[#F5712C] hover:bg-[#DD4A15] py-2 px-4 rounded-full transition-colors",
								children: "Home"
							})
						}),
						/* @__PURE__ */ jsx("a", {
							target: "_blank",
							href: "https://folo.is/",
							children: /* @__PURE__ */ jsx("button", {
								className: "bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full transition-colors",
								children: "Try Folo"
							})
						}),
						/* @__PURE__ */ jsx("a", {
							target: "_blank",
							href: "https://github.com/DIYgod/RSSHub",
							children: /* @__PURE__ */ jsx("button", {
								className: "bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full transition-colors",
								children: "GitHub"
							})
						})
					]
				}),
				info.showDebug ? /* @__PURE__ */ jsxs("details", {
					className: "text-xs w-96 !mt-8 max-h-[400px] overflow-auto",
					children: [/* @__PURE__ */ jsx("summary", {
						className: "text-sm cursor-pointer",
						children: "Debug Info"
					}), info.debug.map((item) => /* @__PURE__ */ jsxs("div", {
						class: "debug-item my-3 pl-8",
						children: [/* @__PURE__ */ jsxs("span", {
							class: "debug-key w-32 text-right inline-block mr-2",
							children: [item.name, ": "]
						}), /* @__PURE__ */ jsx("span", {
							class: "debug-value inline-block break-all align-top",
							children: item.value
						})]
					}))]
				}) : null
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "text-center pt-4 pb-8 w-full text-sm font-medium space-y-2",
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
};
//#endregion
//#region lib/routes/index.tsx
const handler$2 = (ctx) => {
	ctx.header("Cache-Control", "no-cache");
	return ctx.html(/* @__PURE__ */ jsx(Index, { debugQuery: ctx.req.query("debug") }));
};
//#endregion
//#region lib/utils/otel/metric.ts
const METRIC_PREFIX = "rsshub";
const exporter$1 = new PrometheusExporter({});
const provider$1 = new MeterProvider({
	resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: "rsshub" }),
	readers: [exporter$1]
});
const serializer = new PrometheusSerializer();
const meter = provider$1.getMeter("rsshub");
const requestTotal = meter.createCounter(`${METRIC_PREFIX}_request_total`);
const requestErrorTotal = meter.createCounter(`${METRIC_PREFIX}_request_error_total`);
const requestDurationSecondsBucket = meter.createHistogram(`${METRIC_PREFIX}_request_duration_seconds_bucket`, { advice: { explicitBucketBoundaries: config.otel.seconds_bucket?.split(",").map(Number) } });
const request_duration_milliseconds_bucket = meter.createHistogram(`${METRIC_PREFIX}_request_duration_milliseconds_bucket`, { advice: { explicitBucketBoundaries: config.otel.milliseconds_bucket?.split(",").map(Number) } });
const requestMetric = {
	success: (value, attributes) => {
		requestTotal.add(1, attributes);
		request_duration_milliseconds_bucket.record(value, {
			unit: "millisecond",
			...attributes
		});
		requestDurationSecondsBucket.record(value / 1e3, {
			unit: "second",
			...attributes
		});
	},
	error: (attributes) => {
		requestErrorTotal.add(1, attributes);
	}
};
const getContext = async () => {
	try {
		const value = await exporter$1.collect();
		return serializer.serialize(value.resourceMetrics);
	} catch {
		throw "";
	}
};
//#endregion
//#region lib/utils/otel/trace.ts
const exporter = new OTLPTraceExporter({});
const provider = new BasicTracerProvider({
	resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: "rsshub" }),
	spanProcessors: [new BatchSpanProcessor(exporter, {
		maxQueueSize: 4096,
		scheduledDelayMillis: 3e4
	})]
});
trace.setGlobalTracerProvider(provider);
const tracer = provider.getTracer("rsshub");
tracer.startSpan("main");
//#endregion
//#region lib/routes/metrics.ts
const handler$1 = async (ctx) => {
	try {
		const val = await getContext();
		return ctx.text(val);
	} catch (error) {
		ctx.status(500);
		ctx.json({ error });
	}
};
//#endregion
//#region lib/routes/robots.txt.ts
const handler = (ctx) => {
	if (config.disallowRobot) return ctx.text("User-agent: *\nDisallow: /");
	ctx.status(404);
	return ctx.text("");
};
//#endregion
//#region lib/utils/directory-import.ts
const VALID_IMPORT_EXTENSIONS = /* @__PURE__ */ new Set([
	".js",
	".mjs",
	".cjs",
	".ts",
	".tsx",
	".json"
]);
const readDirectory = (targetDirectoryPath, includeSubdirectories) => {
	const entries = fs.readdirSync(targetDirectoryPath, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(targetDirectoryPath, entry.name);
		if (entry.isDirectory()) {
			if (includeSubdirectories) files.push(...readDirectory(fullPath, includeSubdirectories));
			continue;
		}
		if (entry.isFile()) files.push(fullPath);
	}
	return files;
};
const directoryImport = async ({ targetDirectoryPath, importPattern = /.*/, includeSubdirectories = true }) => {
	const modules = {};
	const filesPaths = readDirectory(targetDirectoryPath, includeSubdirectories);
	await Promise.all(filesPaths.map(async (filePath) => {
		const { ext: fileExtension } = path.parse(filePath);
		const isValidModuleExtension = VALID_IMPORT_EXTENSIONS.has(fileExtension);
		const isDeclarationFile = filePath.endsWith(".d.ts") || filePath.endsWith(".d.tsx");
		const isValidFilePath = importPattern.test(filePath);
		if (!isValidModuleExtension || isDeclarationFile || !isValidFilePath) return;
		const relativeModulePath = filePath.slice(targetDirectoryPath.length);
		modules[relativeModulePath] = await import(pathToFileURL(filePath).href);
	}));
	return modules;
};
//#endregion
//#region lib/registry.ts
const __dirname = import.meta.dirname;
const SEPARATOR = /[/\\]/;
/**
* A directory under lib/routes that contains a `namespace.ts` is a "namespace root". Roots are keyed by their path
* relative to lib/routes, joined with `/` (e.g. `gov/cn`).
*/
function collectNamespaceRoots(moduleKeys) {
	const roots = /* @__PURE__ */ new Set();
	for (const key of moduleKeys) {
		const segments = key.split(SEPARATOR).filter(Boolean);
		if (segments.at(-1) === "namespace.ts") roots.add(segments.slice(0, -1).join("/"));
	}
	return roots;
}
/**
* A module belongs to its longest matching namespace root; modules with no matching root fall back to their first
* path segment (flat namespaces). `location` is the module path relative to the resolved namespace root.
*/
function resolveModuleNamespace(moduleKey, roots) {
	const segments = moduleKey.split(SEPARATOR).filter(Boolean);
	for (let i = segments.length - 1; i >= 1; i--) {
		const candidate = segments.slice(0, i).join("/");
		if (roots.has(candidate)) return {
			namespace: candidate,
			location: segments.slice(i).join("/")
		};
	}
	return {
		namespace: segments[0],
		location: segments.slice(1).join("/")
	};
}
function isSafeRoutes(routes) {
	return Object.values(routes).every((route) => !route.features?.nsfw);
}
function safeNamespaces(namespaces) {
	const safe = {};
	for (const [key, value] of Object.entries(namespaces)) if (value.routes === null || value.routes === void 0 || isSafeRoutes(value.routes)) safe[key] = value;
	return safe;
}
let modules = {};
let namespaces = {};
if (config.isPackage || process.env.RSSHUB_EMBEDDED === "1") namespaces = (await import("./routes-Bd4SdcsB.mjs")).default;
else switch (process.env.NODE_ENV || process.env.VERCEL_ENV) {
	case "production":
		namespaces = (await import("./routes-Bd4SdcsB.mjs")).default;
		break;
	case "test":
		namespaces = await import("./routes-swUjrZ6X.mjs");
		if (namespaces.default) namespaces = namespaces.default;
		break;
	default: modules = await directoryImport({
		targetDirectoryPath: path.join(__dirname, "./routes"),
		importPattern: /\.tsx?$/
	});
}
if (config.feature.disable_nsfw) namespaces = safeNamespaces(namespaces);
if (Object.keys(modules).length) {
	const namespaceRoots = collectNamespaceRoots(Object.keys(modules));
	for (const module in modules) {
		const content = modules[module];
		const { namespace, location } = resolveModuleNamespace(module, namespaceRoots);
		if ("namespace" in content) namespaces[namespace] = Object.assign({
			routes: {},
			apiRoutes: {}
		}, namespaces[namespace], content.namespace);
		else if ("route" in content) {
			if (!Object.hasOwn(namespaces, namespace)) namespaces[namespace] = {
				name: namespace,
				routes: {},
				apiRoutes: {}
			};
			if (Array.isArray(content.route.path)) for (const path of content.route.path) namespaces[namespace].routes[path] = {
				...content.route,
				location
			};
			else namespaces[namespace].routes[content.route.path] = {
				...content.route,
				location
			};
		} else if ("apiRoute" in content) {
			if (!Object.hasOwn(namespaces, namespace)) namespaces[namespace] = {
				name: namespace,
				routes: {},
				apiRoutes: {}
			};
			if (Array.isArray(content.apiRoute.path)) for (const path of content.apiRoute.path) namespaces[namespace].apiRoutes[path] = {
				...content.apiRoute,
				location
			};
			else namespaces[namespace].apiRoutes[content.apiRoute.path] = {
				...content.apiRoute,
				location
			};
		}
	}
}
const app = new Hono();
const sortRoutes = (routes) => Object.entries(routes).toSorted(([pathA], [pathB]) => {
	const segmentsA = pathA.split("/");
	const segmentsB = pathB.split("/");
	const lenA = segmentsA.length;
	const lenB = segmentsB.length;
	const minLen = Math.min(lenA, lenB);
	for (let i = 0; i < minLen; i++) {
		const segmentA = segmentsA[i];
		const segmentB = segmentsB[i];
		if (segmentA.startsWith(":") !== segmentB.startsWith(":")) return segmentA.startsWith(":") ? 1 : -1;
		if (segmentA.startsWith(":") && segmentA.includes("{") !== segmentB.includes("{")) return segmentA.includes("{") ? -1 : 1;
	}
	return 0;
});
const namespacesByDepth = Object.keys(namespaces).toSorted((a, b) => b.split("/").length - a.split("/").length);
for (const namespace of namespacesByDepth) {
	const subApp = app.basePath(`/${namespace}`);
	const namespaceData = namespaces[namespace];
	if (!namespaceData || !namespaceData.routes) continue;
	const sortedRoutes = sortRoutes(namespaceData.routes);
	for (const [path, routeData] of sortedRoutes) {
		const wrappedHandler = async (ctx) => {
			logger.debug(`Matched route: ${routePath(ctx)}`);
			if (!ctx.get("data")) {
				if (typeof routeData.handler !== "function") {
					if (process.env.NODE_ENV === "test") {
						const { route } = await import(`./routes/${namespace}/${routeData.location}`);
						routeData.handler = route.handler;
					} else if (routeData.module) {
						const { route } = await routeData.module();
						routeData.handler = route.handler;
					}
				}
				const response = await routeData.handler(ctx);
				if (response instanceof Response) return response;
				ctx.set("data", response);
			}
		};
		subApp.get(path, wrappedHandler);
	}
}
for (const namespace of namespacesByDepth) {
	const subApp = app.basePath(`/api/${namespace}`);
	const namespaceData = namespaces[namespace];
	if (!namespaceData || !namespaceData.apiRoutes) continue;
	const sortedRoutes = Object.entries(namespaceData.apiRoutes);
	for (const [path, routeData] of sortedRoutes) {
		const wrappedHandler = async (ctx) => {
			if (ctx.get("apiData")) return;
			if (typeof routeData.handler !== "function") {
				if (process.env.NODE_ENV === "test") {
					const { apiRoute } = await import(`./routes/${namespace}/${routeData.location}`);
					routeData.handler = apiRoute.handler;
				} else if (routeData.module) {
					const { apiRoute } = await routeData.module();
					routeData.handler = apiRoute.handler;
				}
			}
			const data = await routeData.handler(ctx);
			ctx.set("apiData", data);
		};
		subApp.get(path, wrappedHandler);
	}
}
app.get("/", handler$2);
app.get("/healthz", handler$3);
app.get("/robots.txt", handler);
if (config.debugInfo !== "false") app.get("/metrics", handler$1);
if (!config.isPackage && !process.env.VERCEL_ENV && !isWorker) app.use("/*", serveStatic({
	root: path.join(__dirname, "assets"),
	rewriteRequestPath: (path) => path === "/favicon.ico" ? "/favicon.png" : path
}));
//#endregion
export { sortRoutes as a, Layout as c, getDebugInfo as d, setDebugInfo as f, resolveModuleNamespace as i, gitDate as l, collectNamespaceRoots as n, tracer as o, namespaces as r, requestMetric as s, app as t, gitHash as u };
