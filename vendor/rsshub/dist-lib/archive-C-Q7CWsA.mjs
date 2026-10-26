import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/luxiangdong/archive.ts
const route = {
	path: "/archive",
	categories: ["blog"],
	example: "/luxiangdong/archive",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["luxiangdong.com/"] }],
	name: "文章",
	maintainers: ["Levix"],
	handler,
	url: "luxiangdong.com/"
};
async function handler() {
	const { data } = await got_default(`https://www.luxiangdong.com/content.json?t=${Date.now()}`);
	return {
		title: "土猛的员外",
		link: "https://www.luxiangdong.com/",
		item: data.posts.map((item) => ({
			title: item.title,
			link: item.permalink,
			pubDate: parseDate(item.date),
			author: data.meta.author,
			category: item.tags.map((tag) => tag.name)
		}))
	};
}
//#endregion
export { route };
