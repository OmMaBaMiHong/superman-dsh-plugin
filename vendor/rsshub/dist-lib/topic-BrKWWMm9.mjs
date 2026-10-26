import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as getBuildId, c as parseList, n as baseUrl, s as parseItem } from "./utils-D-FXrRgE.mjs";
//#region lib/routes/followin/topic.ts
const route = {
	path: "/topic/:topicId/:lang?",
	categories: ["finance"],
	example: "/followin/topic/40",
	parameters: {
		topicId: "Topic ID, can be found in URL",
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
	radar: [{ source: ["followin.io/:lang/topic/:topicId", "followin.io/topic/:topicId"] }],
	name: "Topic",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { topicId, lang = "en" } = ctx.req.param();
	const { limit = 20 } = ctx.req.query();
	const buildId = await getBuildId();
	const { data: response } = await got_default(`${baseUrl}/_next/data/${buildId}/${lang}/topic/${topicId}.json`);
	const { queries } = response.pageProps.dehydratedState;
	const { data: topicInfo } = queries.find((q) => q.queryKey[0] === "/topic/info").state;
	const list = parseList(queries.find((q) => q.queryKey[0] === "/feed/list/topic").state.data.pages[0].list.slice(0, limit), lang, buildId);
	const items = await Promise.all(list.map((item) => parseItem(item)));
	return {
		title: `${topicInfo.title} - Followin`,
		description: topicInfo.desc,
		link: `${baseUrl}/${lang}/topic/${topicId}`,
		image: topicInfo.logo,
		language: lang,
		item: items
	};
}
//#endregion
export { route };
