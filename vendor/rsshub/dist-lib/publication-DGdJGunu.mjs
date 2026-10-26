import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as processList, n as apiUrl, r as baseUrl, t as ProcessFeed } from "./utils--9i5MPyI.mjs";
//#region lib/routes/vocus/publication.ts
const route = {
	path: "/publication/:id",
	categories: ["social-media"],
	example: "/vocus/publication/bass",
	parameters: { id: "出版專題 id，可在出版專題主页的 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["vocus.cc/:id/home", "vocus.cc/:id/introduce"] }],
	name: "出版專題",
	maintainers: ["Maecenas"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `${baseUrl}/${id}/home`;
	const publicationData = await cache_default.tryGet(`vocus:publication:${id}`, async () => {
		const { data: publicationData } = await got_default(`${apiUrl}/api/publication/${id}`, { headers: { referer: link } });
		return {
			_id: publicationData._id,
			title: publicationData.title,
			abstract: publicationData.abstract
		};
	});
	const { data: { articles } } = await got_default(`${apiUrl}/api/articles`, {
		headers: { referer: link },
		searchParams: { publicationId: publicationData._id }
	});
	const items = await ProcessFeed(processList(articles));
	return {
		title: `${publicationData.title} - 文章列表｜方格子 vocus`,
		link,
		description: publicationData.abstract,
		item: items
	};
}
//#endregion
export { route };
