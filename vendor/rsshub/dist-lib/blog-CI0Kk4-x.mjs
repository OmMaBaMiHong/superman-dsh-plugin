import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/sketis/isabelle-dev/blog/index.ts
const source = [
	"isabelle-dev.sketis.net/phame/",
	"isabelle-dev.sketis.net/phame/blog/",
	"isabelle-dev.sketis.net/phame/blog/view/:blog/",
	"isabelle-dev.sketis.net/phame/post/",
	"isabelle-dev.sketis.net/phame/post/view/:post_id/:post_title/"
];
const route = {
	path: "/isabelle-dev/blog/:blog",
	categories: ["programming"],
	example: "/sketis/isabelle-dev/blog/1",
	parameters: { blog: "name of blog (1 for NEWS; 2 for Release)" },
	description: `- Isabelle News: \`https://isabelle-dev.sketis.net/phame/blog/view/1/\`
- Isabelle Release: \`https://isabelle-dev.sketis.net/phame/blog/view/2/\``,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source,
		target: "/isabelle-dev/blog/1"
	}, {
		source,
		target: "/isabelle-dev/blog/2"
	}],
	name: "Isabelle Development Blogs",
	url: "isabelle-dev.sketis.net",
	maintainers: ["Ritsuka314"],
	handler: async (ctx) => {
		const baseUrl = "https://isabelle-dev.sketis.net";
		const { blog } = ctx.req.param();
		const blogName = blog === "1" ? "News" : blog === "2" ? "Release" : "UNKNOWN";
		const url = `${baseUrl}/phame/blog/view/${blog}/`;
		const $ = load(await rofetch(url));
		const items = $(".phui-document-summary-view").toArray().map((item_) => {
			const item = $(item_);
			const title = item.find(".remarkup-header").first();
			const subtitle = item.find(".phui-document-summary-subtitle").first();
			const date = subtitle.find("strong").first()[0].nextSibling.data.slice(4);
			return {
				title: title.text(),
				link: `${baseUrl}${title.find("a").attr("href")}`,
				description: item.find(".phui-document-summary-body").html(),
				pubDate: parseDate(date),
				author: subtitle.find("strong").text()
			};
		});
		return {
			title: `Isabelle ${blogName}`,
			link: url,
			item: items
		};
	}
};
//#endregion
export { route };
