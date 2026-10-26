import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/pbc/utils.ts
const processItems = (list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	item.description = load((await got_default.post(item.link)).data)("div.xxy_text").html();
	return item;
})));
//#endregion
export { processItems as t };
