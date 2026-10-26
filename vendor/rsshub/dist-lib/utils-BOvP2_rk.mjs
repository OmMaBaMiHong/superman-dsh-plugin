import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cna/utils.ts
async function getFullText(item) {
	if (item.link.startsWith("https://www.youtube.com/")) return item;
	const content = load((await got_default({
		method: "get",
		url: item.link
	})).data);
	content("div.SubscriptionInner").remove();
	content(".gmailNews").remove();
	content(".dictionary-box").remove();
	content(".moreArticle").remove();
	const topImage = content(".fullPic").html();
	item.description = (topImage === null ? "" : topImage) + content(".paragraph").eq(0).html();
	item.category = [...content("meta[property='article:tag']").toArray().map((e) => e.attribs.content), content(".active > a").text()];
	return item;
}
//#endregion
export { getFullText as t };
