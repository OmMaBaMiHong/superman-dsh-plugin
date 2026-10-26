import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseJSONP } from "./jsonp-helper-DJzfv2ES.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/yoasobi-music/info.tsx
const route = {
	path: "/info/:category?",
	categories: ["live"],
	example: "/yoasobi-music/info/news",
	parameters: { category: "`news`, `biography`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.yoasobi-music.jp/", "www.yoasobi-music.jp/:category"],
		target: "/info/:category"
	}],
	name: "News & Biography",
	maintainers: [],
	handler,
	url: "www.yoasobi-music.jp/"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const ARTIST = "YOASOBI", SONYJPURL = "https://www.sonymusic.co.jp", BASEURL = "https://www.sonymusic.co.jp/json/v2/artist", POSTFIX = category === "news" ? "start/0/count/-1" : "start/0/count/-1/callback/hotCallback";
	const officialUrl = `https://www.yoasobi-music.jp/${category}`;
	const api = `${BASEURL}/${ARTIST}/${category === "news" ? "information" : "hottopic"}/${POSTFIX}`;
	const title = `LATEST ${category.toUpperCase()}`;
	const data = parseJSONP((await got_default({
		method: "get",
		url: api
	})).data).items.map((item) => {
		const isBio = category === "biography";
		const randomEmoji = (() => {
			const emojis = [
				"㊗️",
				"🎉",
				"🎊",
				"🎈",
				"🎁",
				"🎂",
				"🎀",
				"🎗",
				"🎆",
				"🎇",
				"🎐",
				"🎑",
				"🎃"
			];
			return emojis[Math.floor(Math.random() * emojis.length)];
		})();
		return {
			id: isBio ? null : item.id,
			guid: isBio ? `bio:${item.url}` : `news:${item.title}${item.date}`,
			title: isBio ? `${randomEmoji} ${item.url}` : item.title,
			category: item.category ?? "Achievement",
			date: isBio ? item.url : item.date,
			description: isBio ? item.kiji : item.article,
			image: isBio ? item.image_url === "" ? null : `${SONYJPURL}${item.image_url}` : null
		};
	});
	return {
		title,
		link: officialUrl,
		description: `Yoasobi's latest ${category}`,
		item: data.map((i) => ({
			title: i.title,
			description: renderDescription(i.image, i.category, i.description.replaceAll("\n", "<br>")),
			pubDate: parseDate(i.date),
			guid: i.guid,
			link: i.id ? `${officialUrl}/${i.id}` : officialUrl,
			category: i.category
		}))
	};
}
const renderDescription = (image, category, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	category ? /* @__PURE__ */ jsxs("p", { children: ["Category: ", category] }) : null,
	raw(description)
] }));
//#endregion
export { route };
