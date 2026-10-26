import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as header, r as processImage, t as getSignedHeader } from "./utils-BpoeGnFo.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/zhuanlan.ts
const route = {
	path: "/zhuanlan/:id",
	categories: ["social-media"],
	example: "/zhihu/zhuanlan/googledevelopers",
	parameters: { id: "专栏 id，可在专栏主页 URL 中找到" },
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zhuanlan.zhihu.com/:id"] }],
	name: "专栏",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	let url = `https://zhuanlan.zhihu.com/${id}`;
	if (id.search("c_") === 0) url = `https://www.zhihu.com/column/${id}`;
	const signedHeader = await getSignedHeader(url, `/api/v4/columns/${id}/items`);
	const listRes = await got_default({
		method: "get",
		url: `https://www.zhihu.com/api/v4/columns/${id}/items`,
		headers: {
			...signedHeader,
			Referer: `https://zhuanlan.zhihu.com/${id}`
		}
	});
	const pinnedRes = await got_default({
		method: "get",
		url: `https://www.zhihu.com/api/v4/columns/${id}/pinned-items/v2`,
		headers: {
			...header,
			...signedHeader,
			Referer: `https://zhuanlan.zhihu.com/${id}`
		}
	});
	listRes.data.data = [...listRes.data.data, ...pinnedRes.data.data];
	const $ = load((await got_default(url, { headers: {
		...signedHeader,
		Referer: url
	} })).data);
	const title = $(".css-zyehvu").text();
	return {
		description: $(".css-1bnklpv").text(),
		item: listRes.data.data.map((item) => {
			let description = "";
			if (item.content) description = processImage(item.content);
			let title;
			let link;
			let author;
			let pubDate;
			switch (item.type) {
				case "answer":
					title = item.question.title;
					author = item.question.author ? item.question.author.name : "";
					link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
					pubDate = parseDate(item.created_time * 1e3);
					break;
				case "article":
					title = item.title;
					link = item.url;
					author = item.author.name;
					pubDate = parseDate(item.created * 1e3);
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
				link,
				description,
				pubDate,
				author
			};
		}),
		title: `知乎专栏-${title}`,
		link: url
	};
}
//#endregion
export { route };
