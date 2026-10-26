import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nowcoder/experience.ts
const host = "https://www.nowcoder.com";
const route = {
	path: "/experience/:tagId",
	categories: ["bbs"],
	example: "/nowcoder/experience/639?order=3&companyId=665&phaseId=0",
	parameters: { tagId: "职位id [🔗查询链接](https://www.nowcoder.com/profile/all-jobs)复制打开" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nowcoder.com/"],
		target: "/experience"
	}],
	name: "面经",
	maintainers: ["huyyi"],
	handler,
	url: "nowcoder.com/",
	description: `可选参数：

- companyId：公司 id，[🔗查询链接](https://www.nowcoder.com/discuss/tag/exp), 复制打开
- order：3 - 最新；1 - 最热
- phaseId：0 - 所有；1 - 校招；2 - 实习；3 - 社招`
};
async function handler(ctx) {
	const params = new URLSearchParams(ctx.req.query());
	params.append("tagId", ctx.req.param("tagId"));
	const link = new URL("/discuss/experience/json", host);
	link.search = params;
	const list = (await got_default.get(link.href)).data.data.discussPosts.map((x) => {
		return {
			title: x.postTitle,
			link: new URL("discuss/" + x.postId, host).href,
			author: x.author,
			pubDate: timezone(parseDate(x.createTime), 8),
			category: x.postTypeName
		};
	});
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		info.description = load((await got_default.get(info.link)).data)(".nc-post-content").html();
		return info;
	})));
	return {
		title: `牛客面经Tag${ctx.req.param("tagId")}`,
		link: link.href,
		item: out
	};
}
//#endregion
export { route };
