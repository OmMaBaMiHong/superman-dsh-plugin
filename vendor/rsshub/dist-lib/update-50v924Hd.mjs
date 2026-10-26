import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/winstall/update.tsx
const renderDesc = (installers) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: installers?.map((installer) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
	href: installer,
	children: installer
}), /* @__PURE__ */ jsx("br", {})] })) }));
const route = {
	path: "/:appId",
	categories: ["program-update"],
	example: "/winstall/Mozilla.Firefox",
	parameters: { appId: "Application ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["winstall.app/apps/:appId"] }],
	name: "Apps Update",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://winstall.app";
	const appId = ctx.req.param("appId");
	const { data: response } = await got_default(`${baseUrl}/_next/data/${await cache_default.tryGet("winget:buildId", async () => {
		const { data } = await got_default(baseUrl);
		const $ = load(data);
		return JSON.parse($("#__NEXT_DATA__").text()).buildId;
	}, config.cache.routeExpire, false)}/apps/${appId}.json`);
	const { app } = response.pageProps;
	const items = app.versions.map((item) => ({
		title: `${app.name} ${item.version}`,
		description: renderDesc(item.installers),
		author: app.publisher,
		category: app.tags,
		guid: `winstall:${appId}:${item.version}`
	}));
	return {
		title: `${app.name} - winstall`,
		description: app.desc,
		link: `${baseUrl}/apps/${appId}`,
		image: `https://api.winstall.app/icons/next/${appId}.webp`,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
