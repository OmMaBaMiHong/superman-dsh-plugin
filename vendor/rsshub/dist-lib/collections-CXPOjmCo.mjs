import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/bigquant/collections.ts
const md = markdownit({ html: true });
const route = {
	path: "/collections",
	categories: ["finance"],
	view: 0,
	example: "/bigquant/collections",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bigquant.com/"] }],
	name: "专题报告",
	maintainers: ["nczitzk"],
	handler,
	url: "bigquant.com/"
};
async function handler() {
	const rootUrl = "https://bigquant.com";
	const items = (await got_default({
		method: "post",
		url: `${rootUrl}/wiki/api/documents.list`,
		json: {
			collectionId: "c6874e5d-7f45-4e90-8cd9-5e43df3b44ef",
			direction: "DESC",
			limit: 25,
			offset: 0,
			sort: "publishedAt"
		}
	})).data.data.map((item) => ({
		title: item.title,
		link: `${rootUrl}/wiki${item.url}`,
		description: md.render(item.text),
		pubDate: parseDate(item.publishedAt)
	}));
	return {
		title: "专题报告 - AI量化知识库 - BigQuant",
		link: `${rootUrl}/wiki/collections/c6874e5d-7f45-4e90-8cd9-5e43df3b44ef`,
		item: items
	};
}
//#endregion
export { route };
