import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import pMap from "p-map";
//#region lib/routes/copymanga/comic.tsx
const route = {
	path: "/comic/:id/:chapterCnt?",
	categories: ["anime"],
	example: "/copymanga/comic/dianjuren/5",
	parameters: {
		id: "漫画ID",
		chapterCnt: "返回章节的数量，默认为 `10`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "漫画更新",
	maintainers: ["btdwv", "marvolo666"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const chapterCnt = Number(ctx.req.param("chapterCnt") || 10);
	const host = "www.mangacopy.com";
	const baseUrl = `https://${host}`;
	const apiBaseUrl = `https://${host}`;
	const strBaseUrl = `${apiBaseUrl}/api/v3/comic/${id}/group/default/chapters`;
	const iReqLimit = 500;
	const chapterArray = await cache_default.tryGet(strBaseUrl, async () => {
		let bHasNextPage;
		let chapters = [];
		let iReqOffSet = 0;
		do {
			bHasNextPage = false;
			const { code, results } = await rofetch(strBaseUrl, {
				headers: { platform: "" },
				query: {
					limit: iReqLimit,
					offset: iReqOffSet
				}
			});
			if (code !== 200) break;
			if (results.limit + results.offset < results.total) bHasNextPage = true;
			iReqOffSet += iReqLimit;
			chapters = [...chapters, ...results.list];
		} while (bHasNextPage);
		chapters = chapters.map(({ comic_path_word, uuid, name, size, datetime_created, ordered }) => ({
			link: `${baseUrl}/comic/${comic_path_word}/chapter/${uuid}`,
			guid: `https://copymanga.site/comic/${comic_path_word}/chapter/${uuid}`,
			uuid,
			title: name,
			size,
			pubDate: parseDate(datetime_created, "YYYY-MM-DD"),
			ordered
		})).toSorted((a, b) => b.ordered - a.ordered);
		return chapters;
	}, config.cache.routeExpire, false);
	const { bookTitle, bookIntro } = await cache_default.tryGet(`${baseUrl}/comic/${id}`, async () => {
		const $ = load(await rofetch(`${baseUrl}/comic/${id}`));
		return {
			bookTitle: $(".comicParticulars-title-right > ul > li > h6").text(),
			bookIntro: $(".intro").text()
		};
	});
	const genResult = async (chapter) => {
		const { code, results } = await rofetch(`${apiBaseUrl}/api/v3/comic/${id}/chapter/${chapter.uuid}`, { headers: { webp: "1" } });
		const contents = code === 210 ? [] : results.chapter.contents.map((content) => ({ url: content.url.replace(".c800x.", ".c1500x.") }));
		return {
			link: chapter.link,
			guid: chapter.guid,
			title: chapter.title,
			description: renderDescription(chapter.size, contents),
			pubDate: chapter.pubDate
		};
	};
	const items = [...await pMap(chapterArray.slice(0, chapterCnt), (chapter) => cache_default.tryGet(chapter.link, () => genResult(chapter)), { concurrency: 3 }), ...chapterArray.slice(chapterCnt)];
	return {
		title: `拷贝漫画 - ${bookTitle}`,
		link: `${baseUrl}/comic/${id}`,
		description: bookIntro,
		item: items
	};
}
const renderDescription = (size, contents) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("h1", { children: [size, "p"] }),
	/* @__PURE__ */ jsx("br", {}),
	contents.map((image, index) => /* @__PURE__ */ jsx("img", { src: image.url }, `${image.url}-${index}`))
] }));
//#endregion
export { route };
