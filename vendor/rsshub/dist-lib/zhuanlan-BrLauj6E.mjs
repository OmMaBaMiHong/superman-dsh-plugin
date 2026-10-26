import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as auth_default } from "./auth-B7uiPlNs.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/xhu/zhuanlan.ts
const route = {
	path: "/xhu/zhuanlan/:id",
	categories: ["social-media"],
	example: "/zhihu/xhu/zhuanlan/githubdaily",
	parameters: { id: "专栏 id, 可在专栏主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["zhuanlan.zhihu.com/:id"],
		target: "/zhuanlan/:id"
	}],
	name: "xhu- 专栏",
	maintainers: ["JimenezLi"],
	handler
};
async function handler(ctx) {
	const xhuCookie = await auth_default.getCookie(ctx);
	const id = ctx.req.param("id");
	const link = `https://www.zhihu.com/column/${id}`;
	const titleResponse = await got_default({
		method: "get",
		url: `https://api.zhihuvvv.workers.dev/columns/${id}`,
		headers: {
			Referer: "https://api.zhihuvvv.workers.dev",
			Cookie: xhuCookie
		}
	});
	const listRes = (await got_default({
		method: "get",
		url: `https://api.zhihuvvv.workers.dev/columns/${id}/articles?limit=20&offest=0`,
		headers: {
			Referer: "https://api.zhihuvvv.workers.dev",
			Cookie: xhuCookie
		}
	})).data.data;
	return {
		title: `知乎专栏-${titleResponse.data.title}`,
		description: titleResponse.data.description,
		link,
		item: listRes.map((item) => {
			let description = "";
			if (item.content) {
				const $ = load(item.content);
				$("img").css("max-width", "100%");
				description = $.html();
			}
			let title;
			let link;
			let author;
			let pubDate;
			switch (item.type) {
				case "article":
					title = item.title;
					link = item.url;
					author = item.author.name;
					pubDate = parseDate(item.created * 1e3);
					break;
				case "answer":
					title = item.question.title;
					author = item.question.author ? item.question.author.name : "";
					link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
					pubDate = parseDate(item.created_time * 1e3);
					break;
				case "zvideo":
					title = item.title;
					link = `https://www.zhihu.com/zvideo/${item.id}`;
					author = item.author.name;
					pubDate = parseDate(item.created_at * 1e3);
					description = item.description ? `${item.description} <br> <br> <a href="${link}">视频内容请跳转至原页面观看</a>` : `<a href="${link}">视频内容请跳转至原页面观看</a>`;
					break;
				default: throw new Error(`Unknown type: ${item.type}`);
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
