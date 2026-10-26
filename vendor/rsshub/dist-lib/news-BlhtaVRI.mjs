import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ssm/news.tsx
const rootUrl = "https://www.ssm.gov.mo";
const newsUrl = `${rootUrl}/apps1/content/ch/973/itemlist.aspx?defaultcss=false&dlimit=20&showdate=true&dorder=cridate%20desc,displaydate%20desc&withattach=true`;
const route = {
	path: "/news",
	categories: ["government"],
	example: "/ssm/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ssm.gov.mo/", "www.ssm.gov.mo/portal"] }],
	name: "最新消息",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.ssm.gov.mo/"
};
async function handler() {
	const $ = load((await got_default.get(newsUrl)).data);
	const item = $("body > div > div > ul > li").toArray().map((item) => {
		const title = $(item).find("a").text();
		const link = $(item).find("a").attr("href");
		const pubDate = parseDate($(item).find("small").text().split(":", 2)[1].trim(), "DD/MM/YYYY");
		return {
			title,
			link,
			description: renderToString(/* @__PURE__ */ jsx(SsmNewsDescription, { link })),
			pubDate
		};
	});
	return {
		title: "澳门卫生局-最新消息",
		link: rootUrl,
		item
	};
}
const SsmNewsDescription = ({ link }) => /* @__PURE__ */ jsx("iframe", {
	width: "900",
	height: "1000",
	src: link
});
//#endregion
export { route };
