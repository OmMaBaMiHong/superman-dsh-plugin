import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as getBuildId, c as parseList, i as getBParam, n as baseUrl, o as getGToken, s as parseItem, t as apiUrl } from "./utils-D-FXrRgE.mjs";
//#region lib/routes/followin/tag.ts
const route = {
	path: "/tag/:tagId/:lang?",
	categories: ["finance"],
	example: "/followin/tag/177008",
	parameters: {
		tagId: "Tag ID, can be found in URL",
		lang: "Language, see table above, `en` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["followin.io/:lang/tag/:tagId", "followin.io/tag/:tagId"] }],
	name: "Tag",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { tagId, lang = "en" } = ctx.req.param();
	const { limit = 20 } = ctx.req.query();
	const buildId = await getBuildId();
	const tagInfo = await cache_default.tryGet(`followin:tag:${tagId}:${lang}`, async () => {
		const { data: response } = await got_default(`${baseUrl}/_next/data/${buildId}/${lang}/tag/${tagId}.json`);
		const { queries } = response.pageProps.dehydratedState;
		const { base_info: tagInfo } = queries.find((q) => q.queryKey[0] === "/tag/info/v2").state.data;
		return tagInfo;
	});
	const gToken = await getGToken();
	const bParam = getBParam(lang);
	const { data: tagResponse } = await got_default.post(`${apiUrl}/feed/list/tag`, {
		headers: {
			"x-bparam": JSON.stringify(bParam),
			"x-gtoken": gToken
		},
		json: {
			count: limit,
			id: Number.parseInt(tagId),
			type: "tag_discussion_feed"
		}
	});
	if (tagResponse.code !== 2e3) throw new Error(tagResponse.msg);
	const list = parseList(tagResponse.data.list.slice(0, limit), lang, buildId);
	const items = await Promise.all(list.map((item) => parseItem(item)));
	return {
		title: `${tagInfo.name} - Followin`,
		description: tagInfo.description,
		link: `${baseUrl}/${lang}/tag/${tagId}`,
		image: tagInfo.logo,
		language: lang,
		item: items
	};
}
//#endregion
export { route };
