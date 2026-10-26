import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import path from "node:path";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/youku/channel.tsx
const route = {
	path: "/channel/:channelId/:embed?",
	categories: ["multimedia"],
	example: "/youku/channel/UNTg3MTM3OTcy",
	parameters: {
		channelId: "频道 id",
		embed: "默认为开启内嵌视频, 任意值为关闭"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["i.youku.com/i/:id"],
		target: "/channel/:id"
	}],
	name: "频道",
	maintainers: ["xyqfer", "Fatpandac"],
	handler
};
async function handler(ctx) {
	const channelId = ctx.req.param("channelId");
	const embed = !ctx.req.param("embed");
	const data = (await got_default({
		method: "get",
		url: `https://i.youku.com/i/${channelId}/videos`,
		headers: {
			Host: "i.youku.com",
			Referer: `https://i.youku.com/i/${channelId}`
		}
	})).data;
	const $ = load(data);
	const list = $("div.videoitem_pack");
	return {
		title: $(".username").text(),
		link: `https://i.youku.com/i/${channelId}`,
		description: $(".desc").text(),
		item: list.toArray().map((item) => {
			item = $(item);
			const title = item.find("a.videoitem_videolink").attr("title");
			const cover = item.find("a.videoitem_videolink > img").attr("src");
			const $link = item.find("a.videoitem_videolink");
			const link = $link.length > 0 ? `https:${$link.attr("href")}` : null;
			const pubDate = parseDate(item.find("p.videoitem_subtitle").text().split("-").length === 2 ? `${(/* @__PURE__ */ new Date()).getFullYear()}-${item.find("p.videoitem_subtitle").text()}` : item.find("p.videoitem_subtitle").text());
			if (!link) return null;
			return {
				title,
				description: embed ? renderToString(/* @__PURE__ */ jsx("iframe", {
					height: 498,
					width: 510,
					src: `https://player.youku.com/embed/${path.parse(link).name.replaceAll(/^id_/g, "")}`,
					frameBorder: "0",
					allowFullScreen: true
				})) : cover ? renderToString(/* @__PURE__ */ jsx("img", { src: cover })) : void 0,
				link,
				pubDate
			};
		}).filter(Boolean)
	};
}
//#endregion
export { route };
