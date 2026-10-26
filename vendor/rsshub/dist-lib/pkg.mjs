import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as setConfig } from "./config-B5Cf_tHS.mjs";
import { t as ViewType } from "./types-DNj6Etbg.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/pkg.ts
let app = null;
function ensureAppInitialized(app) {
	if (!app) throw new Error("RSSHub not initialized. Please call init() first.");
}
async function init(conf) {
	setConfig(Object.assign({ IS_PACKAGE: true }, conf));
	app = (await import("./app.mjs")).default;
}
async function request(path) {
	ensureAppInitialized(app);
	return (await app.request(path)).json();
}
async function registerRoute(namespace, route, namespaceConfig) {
	ensureAppInitialized(app);
	const { namespaces } = await import("./registry-CMlzoZCl.mjs");
	if (!Object.hasOwn(namespaces, namespace)) namespaces[namespace] = {
		...namespaceConfig,
		name: namespaceConfig?.name || namespace,
		routes: {},
		apiRoutes: {}
	};
	const paths = Array.isArray(route.path) ? route.path : [route.path];
	const subApp = app.basePath(`/${namespace}`);
	const wrappedHandler = async (ctx) => {
		if (ctx.get("data")) return;
		const response = await route.handler(ctx);
		if (response instanceof Response) return response;
		ctx.set("data", response);
	};
	for (const path of paths) {
		namespaces[namespace].routes[path] = {
			...route,
			location: `custom/${namespace}`
		};
		subApp.get(path, wrappedHandler);
	}
}
//#endregion
export { ViewType, init, rofetch as ofetch, parseDate, parseRelativeDate, registerRoute, request };
