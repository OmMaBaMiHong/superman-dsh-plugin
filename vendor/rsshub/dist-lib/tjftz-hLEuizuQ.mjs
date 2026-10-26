import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/tianjin/tjftz.ts
const route = {
	path: "/tjftz-notice/:channelId",
	categories: ["government"],
	example: "/gov/tianjin/tjftz-notice/6302",
	parameters: { channelId: "公告分类id、详细信息点击源网站https://www.tjftz.gov.cn/请求中寻找" },
	radar: [{
		source: ["tjftz.gov.cn/channels/:channelId.html"],
		target: "/tjftz-notice/:channelId"
	}],
	name: "天津港保税区-公告",
	url: "tjftz.gov.cn",
	maintainers: ["HaoyuLee"],
	description: `| 公告类别                            | channelId |
| ----------------------------------- | --------- |
| 首页 > 新闻 > 保税区要闻 > 区域聚焦 | 6302      |`,
	async handler(ctx) {
		const { channelId = "6302" } = ctx.req.param();
		const url = `https://www.tjftz.gov.cn/channels/${channelId}.html`;
		const { data: response } = await got_default(url);
		const noticeCate = load(response)(".location").text().trim();
		return {
			title: "天津港保税区-公告",
			link: url,
			item: load(response)("#sec_right>ul li>.layui-row").toArray().map((el) => {
				const $ = load(el);
				return {
					title: `天津保税区:${$("a").attr("title")}`,
					link: `https://www.tjftz.gov.cn${$("a").attr("href")}`,
					pubDate: parseDate($("span").text().trim()),
					author: "天津保税区",
					description: `
                        <h4>${noticeCate}</h4>
                        <a href="https://www.tjftz.gov.cn${$("a").attr("href")}">${$("a").attr("title")}</a>
                    `
				};
			})
		};
	}
};
//#endregion
export { route };
