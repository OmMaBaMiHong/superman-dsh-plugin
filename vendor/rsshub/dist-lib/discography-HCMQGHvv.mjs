import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseJSONP } from "./jsonp-helper-BR3153N8.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/lxixsxa/discography.tsx
const route = {
	path: "/disco",
	categories: ["live"],
	example: "/lxixsxa/disco",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.lxixsxa.com/", "www.lxixsxa.com/discography"] }],
	name: "Latest Discography",
	maintainers: ["Kiotlin"],
	handler,
	url: "www.lxixsxa.com/"
};
async function handler() {
	const api = "https://www.sonymusic.co.jp/json/v2/artist/lisa/discography/start/0/count/-1";
	const url = "https://www.sonymusic.co.jp/artist/lisa/discography";
	return {
		title: "LATEST DISCOGRAPHY",
		link: url,
		description: "LiSA's Latest Albums",
		item: parseJSONP((await got_default({
			method: "get",
			url: api
		})).data).items.map((item) => ({
			title: item.title,
			referID: item.representative_goods_number,
			imageLink: item.image === "" ? item.image_original : item.image,
			type: item.type,
			releaseDate: item.release_date,
			price: item.price === "" ? "Unknown Yet" : item.price + " (Tax Inclusive)",
			description: item.comment,
			comment: item.catch_copy === "" ? "今日もいい日だ！" : item.catch_copy
		})).map((item) => ({
			title: item.title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("span", { children: [
					item.comment,
					" Type: ",
					item.type,
					" Price: ",
					item.price
				] }),
				item.imageLink ? /* @__PURE__ */ jsx("img", { src: item.imageLink }) : null,
				item.description ? raw(item.description) : null
			] })),
			pubDate: parseDate(item.releaseDate),
			link: `${url}/${item.referID}`
		}))
	};
}
//#endregion
export { route };
