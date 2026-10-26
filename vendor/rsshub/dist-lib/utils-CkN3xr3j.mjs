import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderArticle } from "./article-BC41RHHx.mjs";
import { load } from "cheerio";
//#region lib/routes/caixin/utils.ts
const parseArticle = async (item) => {
	if (new URL(item.link).hostname.endsWith(".blog.caixin.com")) return parseBlogArticle(item);
	const { data: response } = await got_default(item.link);
	item.description = renderArticle({
		item,
		$: load(response)
	});
	if (item.audio) {
		item.itunes_item_image = item.audio_image_url;
		item.enclosure_url = item.audio;
		item.enclosure_type = "audio/mpeg";
	}
	return item;
};
const parseBlogArticle = async (item) => {
	const article = load((await got_default(item.link)).data)("#the_content").removeAttr("style");
	article.find("img").removeAttr("style");
	article.find("p").filter((_, element) => element.children[0].data === String.fromCodePoint(160)).remove();
	item.description = article.html();
	return item;
};
//#endregion
export { parseBlogArticle as n, parseArticle as t };
