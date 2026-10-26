import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/matrix.ts
const route = {
	path: "/matrix",
	categories: ["new-media"],
	example: "/sspai/matrix",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/matrix"] }],
	name: "Matrix",
	maintainers: ["feigaoxyz"],
	handler,
	url: "sspai.com/matrix"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://sspai.com/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false"
	})).data.list;
	return {
		title: "少数派 -- Matrix",
		link: "https://sspai.com/matrix",
		description: "少数派 -- Matrix",
		item: await Promise.all(data.map((item) => {
			const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
			let description = "";
			const key = `sspai: ${item.id}`;
			return cache_default.tryGet(key, async () => {
				const articleData = (await got_default(link)).data.data;
				const banner = articleData.promote_image;
				if (banner) description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
				description += articleData.body;
				return {
					title: item.title.trim(),
					description,
					link: `https://sspai.com/post/${item.id}`,
					pubDate: parseDate(item.released_at * 1e3),
					author: item.author.nickname
				};
			});
		}))
	};
}
//#endregion
export { route };
