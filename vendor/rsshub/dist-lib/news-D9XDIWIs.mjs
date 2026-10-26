import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { decode } from "entities";
//#region lib/routes/isct/news.ts
const route = {
	path: "/news/:lang",
	categories: ["university"],
	example: "/isct/news/ja",
	parameters: { lang: "language, could be ja or en" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.isct.ac.jp/:lang/news"],
		target: "/news/:lang"
	}],
	name: "News",
	maintainers: ["catyyy"],
	handler: async (ctx) => {
		const { lang = "ja" } = ctx.req.param();
		const mediaResponse = await rofetch(`https://www.isct.ac.jp/expansion/get_media_list_json.php?lang_cd=${lang}`);
		const tagResponse = await rofetch(`https://www.isct.ac.jp/expansion/get_tag_list_json.php?lang_cd=${lang}`);
		const mediaData = JSON.parse(decode(mediaResponse));
		const tagData = JSON.parse(decode(tagResponse));
		const itemsArray = Object.values(mediaData);
		const tagArray = Object.values(tagData);
		const tagIdNameMapping = {};
		for (const item of Object.values(tagArray)) tagIdNameMapping[item.TAG_ID] = item.TAG_NAME;
		const items = itemsArray.map((item) => ({
			title: item.TITLE,
			link: "news/" + item.MEDIA_CD,
			description: item.META_DESCRIPTION,
			pubDate: parseDate(item.PUBLISH_DATE),
			category: item.MEDIA_TYPES ? [tagIdNameMapping[Number(item.MEDIA_TYPES.replaceAll("\"", ""))]] : []
		}));
		return {
			title: `ISCT News - ${lang}`,
			link: `https://www.isct.ac.jp/${lang}/news`,
			item: items
		};
	}
};
//#endregion
export { route };
