import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/lanqiao/questions.ts
const route = {
	path: "/questions/:id",
	categories: ["programming"],
	example: "/lanqiao/questions/2",
	parameters: { id: "topic_id 主题 `id` 可在社区板块 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lanqiao.cn/questions/", "lanqiao.cn/questions/topics/:id"] }],
	name: "技术社区",
	maintainers: ["huhuhang"],
	handler,
	url: "lanqiao.cn/questions/"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const data = (await got_default({
		method: "get",
		url: `https://www.lanqiao.cn/api/v2/questions/?sort=created_time&topic_id=${id}`,
		headers: { Referer: `https://www.lanqiao.cn/questions/topic_id=${id}` }
	})).data.results;
	const topic_name = data[0].topic.name;
	function filterToped(arr) {
		return arr.is_toped === false;
	}
	const md = new markdownit();
	const items = await Promise.all(data.filter((element) => filterToped(element)).map((item) => cache_default.tryGet(`https://www.lanqiao.cn/api/v2/questions/${item.id}/`, async () => {
		const question = (await got_default({
			method: "get",
			url: `https://www.lanqiao.cn/api/v2/questions/${item.id}/`
		})).data;
		item.title = question.title;
		item.description = md.render(question.content);
		item.author = question.author.name;
		item.pubDate = parseDate(question.created_at);
		item.link = `https://www.lanqiao.cn/questions/${question.id}/`;
		return item;
	})));
	return {
		title: `蓝桥云课技术社区【${topic_name}】`,
		link: `https://www.lanqiao.cn/questions/topics/${id}/`,
		description: `蓝桥云课技术社区【${topic_name}】`,
		item: items
	};
}
//#endregion
export { route };
