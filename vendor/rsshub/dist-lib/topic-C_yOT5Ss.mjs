import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as processImage } from "./utils-BpoeGnFo.mjs";
import { t as auth_default } from "./auth-B7uiPlNs.mjs";
//#region lib/routes/zhihu/xhu/topic.ts
const route = {
	path: "/xhu/topic/:topicId",
	categories: ["social-media"],
	example: "/zhihu/xhu/topic/19566035",
	parameters: { topicId: "话题ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zhihu.com/topic/:topicId/:type"] }],
	name: "xhu - 话题",
	maintainers: ["JimenezLi"],
	handler
};
async function handler(ctx) {
	const xhuCookie = await auth_default.getCookie();
	const topicId = ctx.req.param("topicId");
	const link = `https://www.zhihu.com/topic/${topicId}/newest`;
	const listRes = (await got_default({
		method: "get",
		url: `https://api.zhihuvvv.workers.dev/topics/${topicId}/feeds/timeline_activity?before_id=0&limit=20`,
		headers: {
			Referer: "https://api.zhihuvvv.workers.dev",
			Cookie: xhuCookie
		}
	})).data.data;
	return {
		title: `知乎话题-${topicId}`,
		link,
		item: listRes.map(({ target: item }) => {
			const type = item.type;
			let title;
			let description;
			let link;
			let pubDate;
			let author;
			switch (type) {
				case "answer":
					title = `${item.question.title}-${item.author.name}的回答：${item.excerpt}`;
					description = `<strong>${item.question.title}</strong><br>${item.author.name}的回答<br/>${processImage(item.content)}`;
					link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
					pubDate = parseDate(item.updated_time * 1e3);
					author = item.author.name;
					break;
				case "question":
					title = item.title;
					description = item.title;
					link = `https://www.zhihu.com/question/${item.id}`;
					pubDate = parseDate(item.created * 1e3);
					break;
				case "article":
					title = item.title;
					description = item.excerpt;
					link = item.url;
					pubDate = parseDate(item.created * 1e3);
					break;
				default: description = `未知类型 ${topicId}.${type}，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
			}
			return {
				title,
				description,
				author,
				pubDate,
				guid: link,
				link
			};
		})
	};
}
//#endregion
export { route };
