import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/hypergryph/endfield/news.ts
const parseList = (list) => list.map((item) => ({
	title: item.title,
	author: item.author,
	description: item.brief.trim().replaceAll("\n", "<br>"),
	link: `https://endfield.hypergryph.com/news/${item.cid}`,
	pubDate: parseDate(item.displayTime, "X")
}));
const route = {
	path: "/endfield/news/:group?",
	categories: ["game"],
	example: "/hypergryph/endfield/news",
	parameters: { group: "分组，默认为 `ALL`" },
	radar: [{ source: ["endfield.hypergryph.com/news"] }],
	name: "明日方舟：终末地 - 游戏公告与新闻",
	maintainers: ["E-larex"],
	handler,
	url: "endfield.hypergryph.com/news",
	description: `| 全部 | 公告    | 活动   | 新闻 |
| ---- | ------- | ------ | ---- |
| ALL  | notices | events | news |`
};
async function handler(ctx) {
	const { group = "ALL" } = ctx.req.param();
	const normalizedGroup = group.toLowerCase();
	if (normalizedGroup !== "all" && !(/* @__PURE__ */ new Set([
		"notices",
		"events",
		"news"
	])).has(normalizedGroup)) throw new Error(`Invalid group: "${group}". Valid values: ALL, notices, events, news`);
	const apiUrl = "https://web-news.hypergryph.com/api/bulletin?lang=zh-cn&code=endfield_web&page=1&pageSize=10" + (normalizedGroup === "all" ? "" : `&tabs[]=${normalizedGroup}`);
	const bulletinList = await cache_default.tryGet(`hypergryph:endfield:news:${normalizedGroup}`, async () => {
		return (await rofetch(apiUrl)).data.list;
	}, config.cache.routeExpire, false);
	const list = parseList(bulletinList);
	return {
		title: "《明日方舟：终末地》游戏公告与新闻",
		link: "https://endfield.hypergryph.com/news",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const response = await rofetch(item.link);
			const $ = cheerio.load(response);
			let tTypeHtml;
			let rscPayload = "";
			for (const el of $("script").toArray()) {
				const pushMatch = $(el).text().match(/self\.__next_f\.push\((.+)\)/s);
				if (!pushMatch) continue;
				let parsed;
				try {
					parsed = JSON.parse(pushMatch[1]);
				} catch {
					continue;
				}
				if (!Array.isArray(parsed) || parsed[0] !== 1 || typeof parsed[1] !== "string") continue;
				const chunk = parsed[1];
				if (!tTypeHtml && chunk.trimStart().startsWith("<")) tTypeHtml = chunk;
				rscPayload += chunk;
			}
			if (tTypeHtml) item.description = tTypeHtml;
			else {
				const bulletinIdx = rscPayload.indexOf("\"bulletin\":{");
				if (bulletinIdx !== -1) {
					const lineStart = rscPayload.lastIndexOf("\n", bulletinIdx) + 1;
					const nextNewline = rscPayload.indexOf("\n", bulletinIdx);
					const line = rscPayload.slice(lineStart, nextNewline === -1 ? void 0 : nextNewline);
					const colonIdx = line.indexOf(":");
					if (colonIdx !== -1) try {
						const data = JSON.parse(line.slice(colonIdx + 1))?.[3]?.value?.bulletin?.data;
						if (typeof data === "string") item.description = data;
					} catch {}
				}
			}
			return item;
		}))),
		language: "zh-cn"
	};
}
//#endregion
export { route };
