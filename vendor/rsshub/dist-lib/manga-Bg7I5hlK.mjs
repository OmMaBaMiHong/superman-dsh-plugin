import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/comic-walker/manga.ts
const getEpisodes = (obj) => obj?.result || obj?.items || (Array.isArray(obj) ? obj : []);
const route = {
	path: "/manga/:id",
	categories: ["anime"],
	example: "/comic-walker/manga/KC_006778_S",
	parameters: { id: "カドコミ(Kadocomi)中对应的作品workCode，例如 KC_006778_S" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["comic-walker.com/detail/:id"],
		target: "/manga/:id"
	}],
	name: "漫画详情",
	maintainers: ["xiaobailoves"],
	handler: async (ctx) => {
		const { id } = ctx.req.param();
		const baseUrl = "https://comic-walker.com";
		const fetchUrl = `${baseUrl}/detail/${id}?episodeType=first`;
		const openUrl = `${baseUrl}/detail/${id}`;
		const $ = load(await rofetch(fetchUrl, { headers: {
			Referer: baseUrl,
			"Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
		} }));
		const nextDataText = $("#__NEXT_DATA__").text();
		if (!nextDataText) throw new Error("无法解析页面 HTML 数据，可能触发了反爬策略或页面结构巨变");
		const workQuery = (JSON.parse(nextDataText).props?.pageProps?.dehydratedState?.queries || []).find((q) => q.queryKey?.includes("/api/contents/details/work") || Array.isArray(q.queryKey) && q.queryKey.some((k) => typeof k === "string" && k.includes("work")));
		if (!workQuery || !workQuery.state?.data) throw new Error("无法在 HTML 缓存中提取核心数据对象");
		const data = workQuery.state.data;
		const work = data.work;
		if (!work) throw new Error("成功获取数据对象，但未找到作品基本信息");
		const mangaTitle = work.title || $("title").text().trim();
		const mangaAuthor = work.authors?.map((author) => author.name).join(", ") || "";
		const mangaDescription = work.summary || "";
		const coverImage = work.bookCover || work.thumbnail;
		const firstEpisodes = getEpisodes(data.firstEpisodes);
		const latestEpisodes = getEpisodes(data.latestEpisodes);
		const extraEpisodes = getEpisodes(data.episodes);
		const seenCodes = /* @__PURE__ */ new Set();
		const allChapters = [
			...firstEpisodes,
			...latestEpisodes,
			...extraEpisodes
		].filter((ep) => {
			if (ep?.code && !seenCodes.has(ep.code)) {
				seenCodes.add(ep.code);
				return true;
			}
			return false;
		}).toSorted((a, b) => (b.internal?.episodeNo || 0) - (a.internal?.episodeNo || 0));
		if (allChapters.length === 0) throw new Error("HTML 缓存中无章节!");
		const items = allChapters.map((chapter) => {
			const epType = chapter.type === "normal" ? "正篇" : "特别篇/PR";
			const isReadStatus = chapter.isActive ? "" : " (未解锁/仍需等待)";
			const fullTitle = `${chapter.title}${chapter.subTitle ? ` - ${chapter.subTitle}` : ""}${isReadStatus}`;
			const thumb = chapter.originalThumbnail || chapter.thumbnail;
			const currentPubDate = chapter.updateDate ? parseDate(chapter.updateDate) : void 0;
			return {
				title: fullTitle,
				link: `${baseUrl}/detail/${id}/episodes/${chapter.code}`,
				description: `
                    ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ""}
                `,
				guid: `Kadocomi-manga-${chapter.code}`,
				category: epType,
				author: mangaAuthor,
				pubDate: currentPubDate
			};
		});
		return {
			title: `Kadocomi - ${mangaTitle}`,
			link: openUrl,
			description: mangaDescription,
			image: coverImage,
			item: items,
			language: "ja"
		};
	}
};
//#endregion
export { route };
