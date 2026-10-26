import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/comic-fuz/manga.ts
const route = {
	path: "/manga/:id",
	categories: ["anime"],
	example: "/comic-fuz/manga/218",
	parameters: { id: "ComicFuz中对应的漫画id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["comic-fuz.com/manga/:id"],
		target: "/manga/:id"
	}],
	name: "漫画详情",
	maintainers: ["xiaobailoves"],
	handler: async (ctx) => {
		const { id } = ctx.req.param();
		const baseUrl = "https://comic-fuz.com";
		const openUrl = `${baseUrl}/manga/${id}`;
		const imgUrl = "https://img.comic-fuz.com";
		const $ = load(await rofetch(openUrl, { headers: {
			Referer: "https://comic-fuz.com/",
			"Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
		} }));
		const nextDataText = $("#__NEXT_DATA__").text();
		if (!nextDataText) throw new Error("无法解析页面数据，请检查漫画 ID 是否正确或页面结构是否变动");
		const pageProps = JSON.parse(nextDataText).props?.pageProps;
		if (!pageProps) throw new Error("无法解析页面 Props 数据");
		const mangaTitle = $("title").text().trim();
		const mangaAuthor = pageProps.authorships?.map((item) => item.author?.authorName).join(", ") || "";
		const mangaDescription = pageProps.manga?.longDescription || "";
		const items = (pageProps.chapters || []).flatMap((group) => group.chapters || []).map((chapter) => {
			const pointInfo = chapter.pointConsumption;
			const amount = pointInfo?.amount || 0;
			let statusText = "";
			if (pointInfo && Object.keys(pointInfo).length === 0) statusText = "无料";
			else if (amount > 0) statusText = "付费";
			let thumb = chapter.thumbnailUrl;
			if (thumb && thumb.startsWith("/")) thumb = `${imgUrl}${thumb}`;
			return {
				title: `${chapter.chapterMainName}${chapter.chapterSubName ? ` - ${chapter.chapterSubName}` : ""}`,
				link: `${baseUrl}/manga/viewer/${chapter.chapterId}`,
				description: `
                    ${thumb ? `<img src="${thumb}" style="max-width: 100%;"><br>` : ""}
                    ${amount > 0 ? `<p>价格: ${amount} 金币/铜币</p>` : ""}
                `,
				guid: `comicfuz-comic-id-${chapter.chapterId}`,
				category: statusText,
				author: mangaAuthor,
				pubDate: chapter.updatedDate ? parseDate(chapter.updatedDate, "YYYY/MM/DD") : void 0,
				upvotes: chapter.numberOfLikes || 0,
				comments: chapter.numberOfComments || 0
			};
		});
		return {
			title: `COMIC FUZ - ${mangaTitle}`,
			link: openUrl,
			description: mangaDescription,
			item: items,
			language: "ja"
		};
	}
};
//#endregion
export { route };
