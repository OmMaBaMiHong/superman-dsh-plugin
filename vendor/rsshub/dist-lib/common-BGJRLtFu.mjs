import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import CryptoJS from "crypto-js";
//#region lib/routes/sis001/common.ts
function getCookie(url) {
	return cache_default.tryGet("sis001:cookie", async () => {
		const rsp = (await got_default(url)).data;
		const regex = /toNumbers\("([a-fA-F0-9]+)"\)/g;
		const matches = [];
		let match;
		while ((match = regex.exec(rsp)) !== null) matches.push(match[1]);
		if (matches.length !== 3) return "";
		const key = CryptoJS.enc.Hex.parse(matches[0]);
		const iv = CryptoJS.enc.Hex.parse(matches[1]);
		const encrypted = CryptoJS.enc.Hex.parse(matches[2]);
		return "CeRaHigh1=" + CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
			iv,
			padding: CryptoJS.pad.NoPadding
		}).toString(CryptoJS.enc.Hex);
	}, config.cache.routeExpire, false);
}
async function getThread(cookie, item) {
	const $ = load((await got_default(item.link, { headers: { cookie } })).data);
	item.guid = item.link?.replace(/^https?:\/\/.+?\//, "https://www.sis001.com/");
	item.category = $(".posttags a").toArray().map((a) => $(a).text());
	item.pubDate = timezone(parseDate($(".postinfo").eq(0).text().match(/发表于 (.*)(?:[\n\r\u{2028}\u{2029}]\s*)?只看该作者/u)[1], "YYYY-M-D HH:mm"), 8);
	$("div[id^=postmessage_] table, fieldset, .posttags, strong font, span:empty").remove();
	item.description = $("div[id^=postmessage_]").eq(0).html()?.replaceAll("\n", "").replaceAll(/\u{3000}{2}.+?(((?:<br>){2})|(&nbsp;))/gu, (str) => `<p>${str.replaceAll("<br>", "")}</p>`).replaceAll(/<p>\u{3000}{6,}([^\u{3000}\n\r\u{2028}\u{2029}].*?|\u{3000})<\/p>/gu, "<center><p style=\"text-align:center;\">$1</p></center>").replaceAll("&nbsp;", "").replace(/<br><br> +<br><br>/, "") + ($(".defaultpost .postattachlist").html() ?? "");
	return item;
}
//#endregion
export { getThread as n, getCookie as t };
