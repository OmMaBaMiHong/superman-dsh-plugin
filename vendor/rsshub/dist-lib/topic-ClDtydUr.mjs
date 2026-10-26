import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as getData } from "./utils-B__hj61-.mjs";
import { load } from "cheerio";
//#region lib/routes/psyche/topic.ts
const route = {
	path: "/topic/:topic",
	categories: ["new-media"],
	example: "/psyche/topic/therapeia",
	parameters: { topic: "Topic" },
	radar: [{ source: ["psyche.co/:topic"] }],
	name: "Topics",
	maintainers: ["emdoe"],
	handler,
	description: "Supported categories: Therapeia, Eudaimonia, and Poiesis."
};
async function handler(ctx) {
	const url = `https://psyche.co/${ctx.req.param("topic")}`;
	const $ = load(await rofetch(url));
	const data = JSON.parse($("script#__NEXT_DATA__").text());
	const articles = data.props.pageProps.articles;
	const prefix = `https://psyche.co/_next/data/${data.buildId}`;
	const items = await getData(Object.keys(articles).flatMap((type) => articles[type].edges.map((item) => ({
		title: item.node.title,
		link: `https://psyche.co/${type}/${item.node.slug}`,
		json: `${prefix}/${type}/${item.node.slug}.json`
	}))));
	return {
		title: `Psyche | ${data.props.pageProps.section.title}`,
		link: url,
		description: data.props.pageProps.section.metaDescription,
		item: items
	};
}
//#endregion
export { route };
