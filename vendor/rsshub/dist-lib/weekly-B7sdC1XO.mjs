import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cngal/weekly.tsx
const route = {
	path: "/weekly",
	categories: ["anime"],
	view: 0,
	example: "/cngal/weekly",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.cngal.org/", "www.cngal.org/weeklynews"] }],
	name: "每周速报",
	maintainers: ["kmod-midori"],
	handler,
	url: "www.cngal.org/"
};
async function handler() {
	return {
		title: "CnGal - 每周速报",
		link: "https://www.cngal.org/weeklynews",
		item: (await got_default("https://api.cngal.org/api/news/GetWeeklyNewsOverview")).data.map((item) => ({
			title: item.name,
			description: renderDescription(item),
			pubDate: parseDate(item.lastEditTime),
			link: `https://www.cngal.org/articles/index/${item.id}`
		}))
	};
}
const renderDescription = (item) => {
	const intro = item.briefIntroduction ? item.briefIntroduction.trim().replaceAll("\n", "<br>") : "";
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: intro ? raw(intro) : null }), item.mainImage ? /* @__PURE__ */ jsx("img", { src: item.mainImage }) : null] }));
};
//#endregion
export { route };
