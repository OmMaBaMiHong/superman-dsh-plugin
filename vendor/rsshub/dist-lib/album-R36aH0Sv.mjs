import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as getRootUrl, i as getApiUrl, o as processApiItems, r as defaultDomain, s as renderDescription } from "./utils-BkMEv8_N.mjs";
//#region lib/routes/18comic/album.ts
const route = {
	path: "/album/:id",
	categories: ["anime"],
	example: "/18comic/album/292282",
	parameters: { id: "专辑 id，可在专辑页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["jmcomic.group/"] }],
	name: "专辑",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	url: "jmcomic.group/",
	description: `::: tip
专辑 id 不包括 URL 中标题的部分。
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { domain = defaultDomain } = ctx.req.query();
	const rootUrl = getRootUrl(domain);
	const currentUrl = `${rootUrl}/album/${id}`;
	const apiResult = await processApiItems(`${getApiUrl()}/album?id=${id}`);
	const category = apiResult.tags;
	const author = apiResult.author.join(", ");
	const description = apiResult.description;
	const addTime = apiResult.addtime;
	let results = [];
	if (apiResult.series.length === 0) results.push({
		title: apiResult.name,
		link: `${rootUrl}/photo/${id}`,
		guid: `${rootUrl}/photo/${id}`,
		updated: /* @__PURE__ */ new Date(addTime * 1e3),
		pubDate: /* @__PURE__ */ new Date(addTime * 1e3),
		category,
		author,
		description: renderDescription({
			introduction: description,
			images: [`https://cdn-msp3.${domain}/media/albums/${id}_3x4.jpg`],
			cover: `https://cdn-msp3.${domain}/media/albums/${id}_3x4.jpg`,
			category
		})
	});
	else {
		results = await Promise.all(apiResult.series.map((item, index) => cache_default.tryGet(`18comic:album:${item.id}`, async () => {
			const chapterResult = await processApiItems(`${getApiUrl()}/chapter?id=${item.id}`);
			const result = {};
			const chapterNum = index + 1;
			result.title = `第${chapterNum}話 ${item.name === "" ? chapterNum : item.name}`;
			result.link = `${rootUrl}/photo/${item.id}`;
			result.guid = `${rootUrl}/photo/${item.id}`;
			result.updated = /* @__PURE__ */ new Date(chapterResult.addtime * 1e3);
			result.pubDate = addTime;
			result.category = category;
			result.author = author;
			result.description = renderDescription({
				introduction: description,
				images: [`https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`],
				cover: `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
				category
			});
			return result;
		})));
		results = results.toReversed();
	}
	return {
		title: `${apiResult.name} - 禁漫天堂`,
		link: currentUrl.replace(/\?$/, ""),
		item: results,
		allowEmpty: true,
		description
	};
}
//#endregion
export { route };
