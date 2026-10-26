import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
import { NarouNovelFetch, NovelType, SearchBuilder, SearchBuilderR18 } from "narou";
//#region lib/routes/syosetu/utils.ts
async function fetchNovelInfo(ncode) {
	const api = new NarouNovelFetch();
	const [generalRes, r18Res] = await Promise.all([new SearchBuilder({
		gzip: 5,
		of: "t-s-k-ga-nt-nu"
	}, api).ncode(ncode).execute(), new SearchBuilderR18({
		gzip: 5,
		of: "t-s-k-ga-nt-nu"
	}, api).ncode(ncode).execute()]);
	const isGeneral = generalRes.allcount !== 0;
	const novelData = isGeneral ? generalRes : r18Res;
	const baseUrl = isGeneral ? "https://ncode.syosetu.com" : "https://novel18.syosetu.com";
	if (novelData.allcount === 0) throw new InvalidParameterError("Novel not found in both APIs");
	return {
		baseUrl,
		novel: novelData.values[0]
	};
}
async function fetchChapterContent(chapterUrl, chapter) {
	return await cache_default.tryGet(chapterUrl, async () => {
		const $ = load(await rofetch(chapterUrl, { headers: {
			Cookie: "over18=yes",
			"User-Agent": config.ua
		} }));
		return {
			title: `${chapter ? `#${chapter} ` : ""}${$(".p-novel__title").html() || ""}`,
			description: $(".p-novel__body").html() || "",
			link: chapterUrl,
			pubDate: $("meta[name=WWWC]").attr("content"),
			language: "ja"
		};
	});
}
//#endregion
//#region lib/routes/syosetu/index.ts
const route = {
	path: "/:ncode",
	categories: ["reading"],
	example: "/syosetu/n9292ii",
	parameters: { ncode: "Novel code, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Novel Updates",
	maintainers: ["eternasuno", "SnowAgar25"],
	handler,
	radar: [{
		title: "Novel Updates",
		source: ["ncode.syosetu.com/:ncode", "ncode.syosetu.com/:ncode/:chapter"],
		target: "/:ncode"
	}, {
		title: "Novel Updates",
		source: ["novel18.syosetu.com/:ncode", "novel18.syosetu.com/:ncode/:chapter"],
		target: "/:ncode"
	}]
};
async function handler(ctx) {
	const { ncode } = ctx.req.param();
	const limit = Math.min(Number(ctx.req.query("limit") ?? 5), 20);
	const { baseUrl, novel } = await fetchNovelInfo(ncode);
	novel.story = novel.story.replaceAll("\n", "<br>") || "";
	if (novel.noveltype === NovelType.Tanpen) {
		const chapterUrl = `${baseUrl}/${ncode}`;
		const item = await fetchChapterContent(chapterUrl);
		item.pubDate = novel.novelupdated_at;
		return {
			title: novel.title,
			description: novel.story,
			link: chapterUrl,
			item: [item],
			language: "ja"
		};
	}
	const totalChapters = novel.general_all_no ?? 1;
	const startChapter = Math.max(totalChapters - limit + 1, 1);
	const items = await Promise.all(Array.from({ length: Math.min(limit, totalChapters) }, async (_, index) => {
		const chapterNumber = startChapter + index;
		return await fetchChapterContent(`${baseUrl}/${ncode}/${chapterNumber}`, chapterNumber);
	}).toReversed());
	return {
		title: novel.title,
		description: novel.story,
		link: `${baseUrl}/${ncode}`,
		item: items,
		language: "ja"
	};
}
//#endregion
export { route };
