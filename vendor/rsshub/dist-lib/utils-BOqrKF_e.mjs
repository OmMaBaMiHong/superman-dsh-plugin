import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import { Cookie, CookieJar } from "tough-cookie";
//#region lib/routes/playno1/utils.ts
const cookieJar = new CookieJar();
const cookie = Cookie.fromJSON({
	key: "playno1",
	value: "playno1Cookie",
	domain: "playno1.com",
	path: "/"
});
(async () => {
	await cookieJar.setCookie(cookie, "http://www.playno1.com/");
})();
const processArticle = (items, cache) => Promise.all(items.map((item) => cache.tryGet(item.link, async () => {
	item.description = load((await got_default(item.link, { cookieJar })).data)("#article_content").html();
	return item;
})));
//#endregion
export { processArticle as n, cookieJar as t };
