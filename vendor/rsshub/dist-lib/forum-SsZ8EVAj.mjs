import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xsijishe/forum.ts
const baseUrl = "https://xsijishe.com";
const route = {
	path: "/forum/:fid",
	categories: ["bbs"],
	example: "/xsijishe/forum/51",
	parameters: { fid: "子论坛 id" },
	features: {
		requireConfig: [{
			name: "XSIJISHE_COOKIE",
			description: ""
		}, {
			name: "XSIJISHE_USER_AGENT",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "论坛",
	maintainers: ["akynazh"],
	handler,
	description: `::: tip 关于子论坛 id 的获取方法
\`/xsijishe/forum/51\` 对应于论坛 \`https://xsijishe.com/forum-51-1.html\`，这个论坛的 fid 为 51，也就是 \`forum-{fid}-1\` 中的 fid。
:::`
};
async function handler(ctx) {
	const fid = ctx.req.param("fid");
	const url = `${baseUrl}/forum-${fid}-1.html`;
	const headers = {
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
		Cookie: config.xsijishe.cookie,
		"User-Agent": config.xsijishe.userAgent
	};
	const $ = load((await got_default(url, { headers })).data);
	const forumCategory = $(".nex_bkinterls_top .nex_bkinterls_ls a").text();
	let items = $("[id^=\"normalthread\"]").toArray().map((item) => {
		item = $(item);
		const nexAuthorBtms = item.find(".nex_author_btms");
		const nexForumtitTopA = item.find(".nex_forumtit_top a").first();
		const nexFtdate = nexAuthorBtms.find(".nex_ftdate");
		const pubDate = nexFtdate.find("span").length > 0 ? nexFtdate.find("span").attr("title") : nexFtdate.text().replace("发表于", "");
		return {
			title: nexForumtitTopA.text().trim(),
			pubDate: parseDate(pubDate.trim()),
			category: nexAuthorBtms.find("em a").text().trim(),
			link: "https://xsijishe.com/" + nexForumtitTopA.attr("href"),
			author: item.find(".nex_threads_author").find("a").text().trim()
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, { headers })).data);
		const firstViewBox = $(".t_f").first();
		firstViewBox.find("img").each((_, img) => {
			img = $(img);
			if (img.attr("zoomfile")) {
				img.attr("src", img.attr("zoomfile"));
				img.removeAttr("zoomfile");
				img.removeAttr("file");
			}
			img.removeAttr("onmouseover");
		});
		item.description = firstViewBox.html();
		return item;
	})));
	return {
		title: `司机社${forumCategory}论坛`,
		link: url,
		description: `司机社${forumCategory}论坛`,
		item: items
	};
}
//#endregion
export { route };
