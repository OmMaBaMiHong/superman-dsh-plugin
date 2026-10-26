import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/cn-healthcare/index.ts
const baseUrl = "https://www.cn-healthcare.com";
const route = {
	path: "/index",
	categories: ["new-media"],
	example: "/cn-healthcare/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cn-healthcare.com/"] }],
	name: "首页",
	maintainers: ["qnloft"],
	handler,
	url: "cn-healthcare.com/"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: `${baseUrl}/api/article/articlelist?data={%22start%22:%221%22,%22size%22:%2250%22,%22arctype%22:%220%22,%22wmstart%22:%220%22,%22flag%22:%222%22}`
	})).data.data;
	const name = "健康界 [cn-healthcare] ";
	return {
		title: name,
		link: "https://www.cn-healthcare.com",
		description: `${name} - RSS`,
		item: data.datalist.map((item) => ({
			title: item.title,
			description: item.content,
			pubDate: parseDate(item.createdate),
			link: `${baseUrl}${item.url}`
		}))
	};
}
//#endregion
export { route };
