import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bangumi.tv/calendar/_base.ts
const getData = () => {
	return Promise.all(["https://api.bgm.tv/calendar", "https://cdn.jsdelivr.net/npm/bangumi-data/dist/data.json"].map((item, i) => cache_default.tryGet(item, async () => {
		const { data } = await got_default(item);
		if (i === 1) data.items = data.items.map((item) => {
			const bgmSite = item.sites.find((s) => s.site === "bangumi");
			return bgmSite ? {
				...item,
				bgmId: bgmSite.id
			} : null;
		}).filter(Boolean);
		return data;
	}, config.cache.contentExpire, false)));
};
//#endregion
//#region lib/routes/bangumi.tv/calendar/today.tsx
const route = {
	path: "/calendar/today",
	categories: ["anime"],
	example: "/bangumi.tv/calendar/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bgm.tv/calendar"] }],
	name: "放送列表",
	maintainers: ["magic-akari"],
	handler,
	url: "bgm.tv/calendar"
};
const renderTodayDescription = (bgm, siteMeta) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: bgm.image }), /* @__PURE__ */ jsx("ul", { children: bgm.sites.map((site) => {
	const url = site.url ?? siteMeta[site.site].urlTemplate.replace("{{id}}", () => site.id);
	const title = siteMeta[site.site].title;
	return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
		href: url,
		children: title
	}) });
}) })] }));
async function handler() {
	const [list, data] = await getData();
	const siteMeta = data.siteMeta;
	const today = new Date(Date.now());
	today.setUTCHours(today.getUTCHours() + 9);
	const day = today.getUTCDay();
	const todayList = list.find((l) => l.weekday.id % 7 === day);
	const todayBgmId = new Set(todayList.items.map((t) => t.id.toString()));
	const images = {};
	for (const item of todayList.items) images[item.id] = (item.images || {}).large;
	const todayBgm = data.items.filter((d) => todayBgmId.has(d.bgmId));
	for (const bgm of todayBgm) bgm.image = images[bgm.bgmId];
	return {
		title: "bangumi 每日放送",
		link: "https://bgm.tv/calendar",
		item: todayBgm.map((bgm) => {
			const updated = new Date(Date.now());
			updated.setSeconds(0);
			const begin = new Date(bgm.begin || updated);
			updated.setHours(begin.getHours());
			updated.setMinutes(begin.getMinutes());
			updated.setSeconds(begin.getSeconds());
			const link = `https://bangumi.tv/subject/${bgm.bgmId}`;
			const id = `${link}#${new Intl.DateTimeFormat("zh-CN").format(updated)}`;
			const html = renderTodayDescription(bgm, siteMeta);
			return {
				id,
				guid: id,
				title: [bgm.title, Object.values(bgm.titleTranslate).map((t) => t.join("｜")).join("｜")].filter(Boolean).join("｜"),
				updated: updated.toISOString(),
				pubDate: updated.toUTCString(),
				link,
				description: html,
				content: { html }
			};
		})
	};
}
//#endregion
export { route };
