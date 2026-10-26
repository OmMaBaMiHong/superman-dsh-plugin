import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { t as ProcessItem } from "./utils-Dt_2r2mm.mjs";
import { load } from "cheerio";
//#region lib/routes/cnki/journals.ts
const rootUrl = "https://navi.cnki.net";
const route = {
	path: "/journals/:name",
	categories: ["journal"],
	example: "/cnki/journals/LKGP",
	parameters: { name: "期刊缩写，可以在网址中得到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["navi.cnki.net/knavi/journals/:name/detail"] }],
	name: "期刊",
	maintainers: [
		"Fatpandac",
		"Derekmini",
		"pseudoyu"
	],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const rssUrl = `https://rss.cnki.net/kns/rss.aspx?Journal=${name}&Virtual=knavi`;
	const rssResponse = await got_default.get(rssUrl);
	try {
		const feed = await parser.parseString(rssResponse.data);
		if (feed.items && feed.items.length !== 0) {
			const items = feed.items.map((item) => ({
				title: item.title,
				description: item.content,
				pubDate: parseDate(item.pubDate),
				link: item.link,
				author: item.author
			}));
			return {
				title: feed.title,
				link: feed.link,
				description: feed.description,
				item: items
			};
		}
	} catch (error) {
		logger.error(error);
	}
	const journalUrl = `${rootUrl}/knavi/journals/${name}/detail`;
	const title = load((await got_default.get(journalUrl)).data)("head > title").text();
	const yearListUrl = `${rootUrl}/knavi/journals/${name}/yearList?pIdx=0`;
	const $yearList = load((await got_default.get(yearListUrl)).data);
	const code = $yearList(".yearissuepage").find("dl").first().find("dd").find("a").first().attr("value");
	const date = parseDate($yearList(".yearissuepage").find("dl").first().find("dd").find("a").first().attr("id").replace("yq", ""), "YYYYMM");
	const yearIssueUrl = `${rootUrl}/knavi/journals/${name}/papers?yearIssue=${code}&pageIdx=0&pcode=CJFD,CCJD`;
	const $ = load((await got_default.post(yearIssueUrl)).data);
	const list = $("dd").toArray().map((publication) => {
		return {
			title: $(publication).find("a").first().text(),
			link: `https://cnki.net/kcms/detail/detail.aspx?filename=${$(publication).find("b").attr("id")}&dbcode=CJFD`,
			pubDate: date
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => ProcessItem(item))));
	return {
		title: String(title),
		link: journalUrl,
		item: items
	};
}
//#endregion
export { route };
