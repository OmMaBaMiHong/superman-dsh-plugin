import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/docschina/weekly.ts
const md = markdownit({
	html: true,
	breaks: true
});
const route = {
	path: "/weekly/:category?",
	categories: ["programming"],
	example: "/docschina/weekly",
	parameters: { category: "周刊分类，见下表，默认为js" },
	name: "周刊 - JavaScript",
	maintainers: ["daijinru", "hestudy"],
	handler,
	description: `| javascript | node | react |
| ---------- | ---- | ----- |
| js         | node | react |`,
	radar: [{
		source: [
			"docschina.org/news/weekly/js/*",
			"docschina.org/news/weekly/js",
			"docschina.org/"
		],
		target: "/jsweekly"
	}]
};
async function handler(ctx) {
	const { category = "js" } = ctx.req.param();
	const baseURL = "https://docschina.org";
	const url = `${baseURL}${`/news/weekly/${category}`}`;
	const { data: res } = await got_default(url);
	const $ = load(res);
	const title = $("head title").text();
	const dataText = $("#__NEXT_DATA__").text();
	const data = JSON.parse(dataText);
	return {
		title,
		link: url,
		item: await Promise.all(data?.props?.pageProps?.data?.slice(0, 10).map((item) => {
			const link = `${url}/${item.issue}`;
			return cache_default.tryGet(link, async () => {
				const { data: response } = await got_default(`${baseURL}/_next/data/${data.buildId}/news/weekly/js/${item.issue}.json`);
				return {
					title: item.title,
					description: md.render(response.pageProps.content),
					link,
					author: item.editors?.join(","),
					itunes_item_image: item.imageUrl
				};
			});
		}) || {})
	};
}
//#endregion
export { route };
