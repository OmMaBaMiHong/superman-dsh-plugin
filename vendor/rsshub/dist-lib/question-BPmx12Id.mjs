import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as processImage } from "./utils-BpoeGnFo.mjs";
import { t as auth_default } from "./auth-B7uiPlNs.mjs";
//#region lib/routes/zhihu/xhu/question.ts
const route = {
	path: "/xhu/question/:questionId/:sortBy?",
	categories: ["social-media"],
	example: "/zhihu/xhu/question/264051433",
	parameters: {
		questionId: "问题 id",
		sortBy: "排序方式：`default`, `created`, `updated`。默认为 `default`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.zhihu.com/question/:questionId"],
		target: "/xhu/question/:questionId"
	}],
	name: "xhu - 问题",
	maintainers: ["JimenezLi"],
	handler
};
async function handler(ctx) {
	const xhuCookie = await auth_default.getCookie();
	const { questionId, sortBy = "default" } = ctx.req.param();
	const link = `https://www.zhihu.com/question/${questionId}`;
	const listRes = (await got_default({
		method: "get",
		url: `https://api.zhihuvvv.workers.dev/questions/${questionId}/answers?limit=20&offest=0&order_by=${sortBy}`,
		headers: {
			Referer: "https://api.zhihuvvv.workers.dev",
			Cookie: xhuCookie
		}
	})).data.data;
	return {
		title: `知乎-${listRes[0].question.title}`,
		link,
		item: listRes.map((item) => {
			const link = `https://www.zhihu.com/question/${questionId}/answer/${item.id}`;
			const author = item.author.name;
			return {
				title: `${author}的回答：${item.excerpt}`,
				description: `${author}的回答<br/><br/>${processImage(item.excerpt)}`,
				author,
				pubDate: parseDate(item.updated_time * 1e3),
				guid: link,
				link
			};
		})
	};
}
//#endregion
export { route };
