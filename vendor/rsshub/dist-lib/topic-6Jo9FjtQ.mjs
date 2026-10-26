import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { i as rootUrl, n as parseArticle, r as parseResult, t as apiRootUrl } from "./utils-3sZ65Sbe.mjs";
//#region lib/routes/utgd/topic.ts
const route = {
	path: "/topic/:topic?",
	categories: ["new-media"],
	example: "/utgd/topic/在线阅读专栏",
	parameters: { topic: "专题，默认为在线阅读专栏" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["utgd.net/topic", "utgd.net/"],
		target: "/topic/:topic"
	}],
	name: "专题",
	maintainers: ["nczitzk"],
	handler,
	url: "utgd.net/topic",
	description: `| 在线阅读专栏 | 卡片笔记专题 |
| ------------ | ------------ |

更多专栏请见 [专题广场](https://utgd.net/topic)`
};
async function handler(ctx) {
	const topic = ctx.req.param("topic") ?? "在线阅读专栏";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const currentUrl = `${rootUrl}/topic`;
	let response = await rofetch(`${apiRootUrl}/api/v2/topic/`);
	const topicItem = response.find((i) => i.title === topic);
	if (!topicItem) throw new InvalidParameterError(`No topic named ${topic}`);
	response = await rofetch(`${rootUrl}/api/v2/topic/${topicItem.id}/article/`);
	const list = parseResult(response.results, limit);
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `UNTAG - ${topicItem.title}`,
		link: currentUrl,
		item: items,
		description: topicItem.summary
	};
}
//#endregion
export { route };
