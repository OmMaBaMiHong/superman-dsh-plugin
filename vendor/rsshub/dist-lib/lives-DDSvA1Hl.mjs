import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/houxu/lives.ts
const route = {
	path: "/lives/:id",
	categories: ["new-media"],
	example: "/houxu/lives/33899",
	parameters: { id: "编号，可在对应 Live 页面的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["houxu.app/lives/:id", "houxu.app/"] }],
	name: "Live",
	maintainers: ["nczitzk"],
	handler,
	url: "houxu.app/"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://houxu.app";
	const apiUrl = `${rootUrl}/api/1/lives/${id}`;
	const currentUrl = `${rootUrl}/lives/${id}`;
	const pageResponse = await got_default({
		method: "get",
		url: apiUrl
	});
	const items = (await got_default({
		method: "get",
		url: `${apiUrl}/threads?limit=${ctx.req.query("limit") ?? 500}`
	})).data.results.map((item) => ({
		title: item.link.title,
		link: item.link.url,
		author: item.link.source ?? item.link.media.name,
		pubDate: parseDate(item.create_at),
		description: item.link.description
	}));
	return {
		title: `后续 - ${pageResponse.data.title}`,
		link: currentUrl,
		item: items,
		description: pageResponse.data.summary
	};
}
//#endregion
export { route };
