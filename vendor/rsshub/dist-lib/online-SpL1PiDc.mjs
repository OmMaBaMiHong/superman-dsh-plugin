import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bangumi.online/online.tsx
const renderImage = (src, alt) => renderToString(/* @__PURE__ */ jsx("img", {
	src,
	alt
}));
const route = {
	path: "/",
	categories: ["anime"],
	example: "/bangumi.online",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bangumi.online/"] }],
	name: "當季新番",
	maintainers: ["devinmugen"],
	handler,
	url: "bangumi.online/"
};
async function handler() {
	return {
		title: "アニメ新番組",
		link: "https://bangumi.online",
		item: (await got_default.post("https://api.bangumi.online/serve/home")).data.data.list.map((item) => ({
			title: `${item.title.zh ?? item.title.ja} - 第 ${item.volume} 集`,
			description: renderImage(`https:${item.cover}`, `${item.title_zh} - 第 ${item.volume} 集`),
			link: `https://bangumi.online/watch/${item.vid}`,
			pubDate: parseDate(item.create_time)
		}))
	};
}
//#endregion
export { route };
