import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseJSONP } from "./jsonp-helper-DJzfv2ES.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/yoasobi-music/live.tsx
const route = {
	path: "/live",
	categories: ["live"],
	example: "/yoasobi-music/live",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.yoasobi-music.jp/", "www.yoasobi-music.jp/live"] }],
	name: "Live",
	maintainers: ["Kiotlin"],
	handler,
	url: "www.yoasobi-music.jp/"
};
async function handler() {
	const ARTIST = "YOASOBI", SONYJPURL = "https://www.sonymusic.co.jp";
	const api = `https://www.sonymusic.co.jp/json/v2/artist/${ARTIST}/live/start/0/count/-1`;
	const officialUrl = "https://www.yoasobi-music.jp/live";
	return {
		title: "LATEST LIVE",
		link: officialUrl,
		description: "YOASOBI's Latest Live",
		item: parseJSONP((await got_default({
			method: "get",
			url: api
		})).data).items.map((item) => ({
			title: item.tourName,
			imageLink: item.tourImage === "" ? null : `${SONYJPURL}${item.tourImage}`,
			link: `${officialUrl}/${item.link.split("/").pop()}`,
			description: item.tourInfo,
			sessions: item.liveItem
		})).map((item) => ({
			title: item.title,
			description: renderDescription(item.imageLink, item.description, item.sessions),
			link: item.link
		}))
	};
}
const renderDescription = (image, description, sessions) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	raw(description),
	sessions.map((session, index) => /* @__PURE__ */ jsxs("div", {
		style: "margin: 0.5em 0; padding: 0.5em 1em; border: 0.1em solid palevioletred;",
		children: [
			/* @__PURE__ */ jsxs("p", { children: [
				session.date,
				" [",
				session.youbi,
				"]"
			] }),
			/* @__PURE__ */ jsx("p", {
				style: "color: palevioletred;",
				children: session.tourName
			}),
			/* @__PURE__ */ jsxs("p", { children: [
				"会場: ",
				session.area,
				" ",
				/* @__PURE__ */ jsx("a", {
					href: session.mapURL,
					target: "_blank",
					children: session.place
				})
			] }),
			/* @__PURE__ */ jsxs("p", { children: [
				"開場/開演: ",
				session.open,
				"/",
				session.start
			] })
		]
	}, `${session.date}-${index}`))
] }));
//#endregion
export { route };
