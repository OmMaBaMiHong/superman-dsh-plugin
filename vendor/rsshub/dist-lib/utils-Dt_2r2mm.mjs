import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./desc-DnMTmsJu.mjs";
import { load } from "cheerio";
//#region lib/routes/cnki/utils.ts
const ProcessItem = async (item) => {
	const $ = load((await got_default(item.link)).data);
	item.description = renderDescription({
		author: $("h3.author > span").toArray().map((item) => $(item).text()).join(" "),
		company: $("a.author").toArray().map((item) => $(item).text()).join(" "),
		content: $("div.row > span.abstract-text").parent().text()
	});
	return item;
};
//#endregion
export { ProcessItem as t };
