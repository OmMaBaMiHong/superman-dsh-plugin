import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/azurlane/news.ts
const JP = {
	"0": "すべて",
	"1": "お知らせ",
	"2": "イベント",
	"3": "メインテナンス",
	"4": "重要"
};
const mkTable = (mapping) => {
	const heading = [];
	const separator = [];
	const body = [];
	for (const key in mapping) {
		heading.push(mapping[key]);
		separator.push(":--:");
		body.push(key);
	}
	return [
		heading.join(" | "),
		separator.join(" | "),
		body.join(" | ")
	].map((s) => `| ${s} |`).join("\n");
};
const handler = async (ctx) => {
	const { server } = ctx.req.param();
	switch (server.toUpperCase()) {
		case "JP": return await ja(ctx);
		default: throw new Error("Unsupported server");
	}
};
const ja = async (ctx) => {
	const { type = "0" } = ctx.req.param();
	const items = ((await rofetch("https://www.azurlane.jp/api/news/list", { query: {
		type,
		index: 1,
		size: 15
	} })).data?.rows || []).map((item) => ({
		title: item.title,
		description: item.content,
		link: `https://www.azurlane.jp/news/${item.id}`,
		pubDate: parseDate(item.publishTime)
	}));
	return {
		title: `アズールレーン - ${JP[type]}`,
		link: "https://www.azurlane.jp/news",
		language: "ja-JP",
		image: "https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw",
		icon: "https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw",
		logo: "https://play-lh.googleusercontent.com/9QTLYD2_Jd6OIKHwRHkEBnFAgPmVKJwf2xmHjzPk-5w0SRLZumsCoQZGlO8d_kB3Gdld=w480-h960-rw",
		item: items
	};
};
const route = {
	path: "/news/:server/:type?",
	name: "News",
	categories: ["game"],
	maintainers: ["AnitsuriW"],
	example: "/azurlane/news/jp/0",
	parameters: {
		server: "game server (ISO 3166 two-letter country code, case-insensitive), only `JP` is supported for now",
		type: "news type, see the table below, `0` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler,
	description: mkTable(JP)
};
//#endregion
export { route };
