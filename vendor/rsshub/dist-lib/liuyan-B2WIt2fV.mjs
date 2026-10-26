import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/people/liuyan.ts
const route = {
	path: "/liuyan/:id/:state?",
	categories: ["traditional-media"],
	example: "/people/liuyan/539",
	parameters: {
		id: "编号，可在对应人物页 URL 中找到",
		state: "状态，见下表，默认为全部"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["liuyan.people.com.cn/"] }],
	name: "领导留言板",
	maintainers: ["nczitzk"],
	handler,
	url: "liuyan.people.com.cn/",
	description: `| 全部 | 待回复 | 办理中 | 已办理 |
| ---- | ------ | ------ | ------ |
| 1    | 2      | 3      | 4      |`
};
async function handler(ctx) {
	const fid = ctx.req.param("id");
	const state = ctx.req.param("state") ?? "1";
	const rootUrl = "http://liuyan.people.com.cn";
	const currentUrl = `${rootUrl}/threads/list?fid=${fid}#state=${state}`;
	let currentForum;
	const list = (await got_default({
		method: "post",
		url: `${rootUrl}/threads/queryThreadsList`,
		form: {
			fid,
			state,
			lastItem: 0
		}
	})).data.responseData.map((item) => ({
		title: item.subject,
		author: item.nickName,
		link: `${rootUrl}/threads/content?tid=${item.tid}`,
		pubDate: parseDate(item.threadsCheckTime * 1e3)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".content").html();
		currentForum ??= content("#currentForum").text();
		return item;
	})));
	return {
		title: `${currentForum} - 领导留言板 - 人民网`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
