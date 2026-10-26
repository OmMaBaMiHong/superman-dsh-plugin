import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/cn/news/index.ts
const route = {
	path: "/news/:uid",
	categories: ["government"],
	example: "/gov/cn/news/bm",
	parameters: { uid: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "政府新闻",
	maintainers: ["EsuRt", "howfool"],
	handler,
	description: `| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 国务院工作会议 | 政策文件 |
| :------: | :------: | :------: | :--------: | :------------: | :------: |
|    bm    |    gd    |    yw    |     gwy    |     gwyzzjg    |  zhengce |`
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const originDomain = "https://www.gov.cn";
	let url = "";
	let title = "";
	let list;
	switch (uid) {
		case "bm":
			url = `${originDomain}/lianbo/bumen/index.htm`;
			title = "中国政府网 - 部门政务";
			break;
		case "yw":
			url = `${originDomain}/yaowen/index.htm`;
			title = "中国政府网 - 新闻要闻";
			break;
		case "gd":
			url = `${originDomain}/yaowen/index.htm`;
			title = "中国政府网 - 滚动新闻";
			break;
		case "gwy":
			url = `${originDomain}/pushinfo/v150203/`;
			title = "中国政府网 - 国务院信息";
			break;
		case "zhengce":
			url = "http://sousuo.gov.cn/s.htm?t=zhengcelibrary";
			title = "中国政府网 - 政策文件";
			break;
		case "gwyzzjg":
			url = `${originDomain}/gwyzzjg/huiyi/`;
			title = "中国政府网 - 国务院工作会议";
			break;
		default: logger.error("pattern not matched");
	}
	const $ = load((await got_default.get(url)).data);
	if (url.includes("zhengcelibrary")) list = $(".dys_middle_result_content_item");
	else if (url.includes("bumen")) list = $(".infolist li");
	else list = $(".news_box .list li:not(.line)");
	return {
		title,
		link: url,
		item: await Promise.all(list.toArray().map((item) => {
			item = $(item);
			let contentUrl = item.find("a").attr("href");
			contentUrl = contentUrl.startsWith("http") ? contentUrl : new URL(contentUrl, url).href;
			return cache_default.tryGet(contentUrl, async () => {
				let description;
				let fullTextData;
				let fullTextGet;
				let pubDate;
				let author;
				let category;
				if (/dysMiddleResultConItemTitle/.test(item.html())) if (contentUrl.includes("content")) {
					fullTextGet = await got_default.get(contentUrl);
					fullTextData = load(fullTextGet.data);
					fullTextData(".shuzi").remove();
					fullTextData("#myFlash").remove();
					description = /pages_content/.test(fullTextData.html()) ? fullTextData(".pages_content").html() : fullTextData("#UCAP-CONTENT").html();
				} else description = item.find("a").text();
				else if (contentUrl.includes("content")) {
					fullTextGet = await got_default.get(contentUrl);
					fullTextData = load(fullTextGet.data);
					const $1 = fullTextData.html();
					pubDate = timezone(parseDate(fullTextData("meta[name=\"firstpublishedtime\"]").attr("content"), "YYYY-MM-DD HH:mm:ss"), 8);
					author = fullTextData("meta[name=\"author\"]").attr("content");
					category = fullTextData("meta[name=\"keywords\"]").attr("content").split(/[,;]/);
					if (/zhengceku/.test(contentUrl)) description = fullTextData(".pages_content").html();
					else {
						fullTextData(".shuzi").remove();
						fullTextData("#myFlash").remove();
						description = /UCAP-CONTENT/.test($1) ? fullTextData("#UCAP-CONTENT").html() : fullTextData("body").html();
					}
				} else description = item.find("a").text();
				return {
					title: item.find("a").text(),
					description,
					link: contentUrl,
					pubDate,
					author,
					category: category.filter(Boolean)
				};
			});
		}))
	};
}
//#endregion
export { route };
