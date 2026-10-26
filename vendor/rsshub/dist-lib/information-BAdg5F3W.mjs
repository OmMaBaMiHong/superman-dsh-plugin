import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseJSONP } from "./jsonp-helper-BR3153N8.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/lxixsxa/information.tsx
const route = {
	path: "/info",
	categories: ["live"],
	example: "/lxixsxa/info",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.lxixsxa.com/", "www.lxixsxa.com/info"] }],
	name: "News",
	maintainers: ["Kiotlin"],
	handler,
	url: "www.lxixsxa.com/"
};
async function handler() {
	const api = "https://www.sonymusic.co.jp/json/v2/artist/lisa/information/start/0/count/-1";
	const url = "https://www.sonymusic.co.jp/artist/lisa/info";
	return {
		title: "NEWS",
		link: url,
		description: "Let's see what is new about LiSA.",
		item: parseJSONP((await got_default({
			method: "get",
			url: api
		})).data).items.map((item) => ({
			id: item.id,
			title: item.title,
			category: item.category,
			date: item.date,
			description: item.article
		})).map((item) => ({
			title: item.title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.category ? /* @__PURE__ */ jsxs("span", { children: ["Category: ", item.category] }) : null, raw(item.description.replaceAll("\n", "<br>"))] })),
			pubDate: parseDate(item.date),
			link: `${url}/${item.id}`
		}))
	};
}
//#endregion
export { route };
