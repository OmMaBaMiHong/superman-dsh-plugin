import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseJSONP } from "./jsonp-helper-DJzfv2ES.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/yoasobi-music/media.tsx
const route = {
	path: "/media",
	categories: ["live"],
	example: "/yoasobi-music/media",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.yoasobi-music.jp/", "www.yoasobi-music.jp/media"] }],
	name: "Media",
	maintainers: ["Kiotlin"],
	handler,
	url: "www.yoasobi-music.jp/"
};
async function handler() {
	const api = `https://www.sonymusic.co.jp/json/v2/artist/YOASOBI/media/start/0/count/-1`;
	const officialUrl = "https://www.yoasobi-music.jp/media";
	const title = "LATEST MEDIA";
	const response = await rofetch(api);
	return {
		title,
		link: officialUrl,
		description: "YOASOBI's Latest Media",
		item: Object.values(parseJSONP(response.data).items).flat().toSorted((a, b) => new Date(b.date) - new Date(a.date)).map((item) => ({
			date: item.date,
			weekDay: item.youbi,
			startTime: item.startTime || null,
			endTime: item.endTime || null,
			tvStation: item.media || null,
			title: item.program || item.media,
			description: item.note
		})).map((i) => ({
			title: i.title,
			description: renderDescription(i.date, i.weekDay, i.startTime && i.endTime && i.tvStation ? `${i.startTime} ~ ${i.endTime} ${i.tvStation}` : null, i.description),
			pubDate: i.date,
			guid: i.title + i.date,
			link: officialUrl
		}))
	};
}
const renderDescription = (date, weekDay, postFix, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: [
	date,
	" [",
	weekDay,
	"] ",
	postFix || null
] }), raw(description)] }));
//#endregion
export { route };
