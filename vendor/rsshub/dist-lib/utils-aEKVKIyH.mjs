import * as cheerio from "cheerio";
//#region lib/routes/t66y/utils.ts
const baseUrl = "https://www.t66y.com";
const killRedircdn = (originUrl) => {
	return originUrl.replaceAll(/.*\?http/g, "http").replaceAll(/______/g, ".").replace("&z", "");
};
const parseContent = (htmlString) => {
	const $ = cheerio.load(htmlString);
	const content = $("div.tpc_content").eq(0);
	content.find(".t_like").remove();
	content.find("img").each((_, ele) => {
		const $ele = $(ele);
		const essData = $ele.attr("ess-data");
		if (essData) $ele.attr("src", essData);
		$ele.removeAttr("ess-data");
		$ele.removeAttr("iyl-data");
	});
	content.find("a").each((_, ele) => {
		const $ele = $(ele);
		const href = $ele.attr("href");
		if (href?.includes("redircdn")) $ele.attr("href", killRedircdn(href));
	});
	return content.html();
};
//#endregion
export { parseContent as n, baseUrl as t };
