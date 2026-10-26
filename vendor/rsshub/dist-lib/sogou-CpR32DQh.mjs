import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/sogou.ts
const host = "https://weixin.sogou.com";
const hardcodedCookie = "SNUID=78725B470A0EF2C3F97AA5EB0BBF95C1; ABTEST=0|1680917938|v1; SUID=8F7B1C682B83A20A000000006430C5B2; PHPSESSID=le2lak0vghad5c98ijd3t51ls4; IPLOC=USUS5";
async function fetchAndParsePage(wechatId) {
	const searchUrl = `${host}/weixin`;
	let response;
	try {
		response = { data: await rofetch(searchUrl, {
			query: {
				ie: "utf8",
				s_from: "input",
				_sug_: "n",
				_sug_type_: "1",
				type: "2",
				query: wechatId,
				page: "1"
			},
			headers: {
				Referer: host,
				Cookie: hardcodedCookie
			}
		}) };
	} catch (error) {
		logger.error(`Failed to fetch Sogou search for ${wechatId}: ${error instanceof Error ? error.message : String(error)}`);
		return [];
	}
	const $ = load(response.data);
	const pageItemsPromises = $("ul.news-list > li").toArray().map(async (li) => {
		const $li = $(li);
		const title = $li.find("h3 > a").text().trim();
		const sogouLinkHref = $li.find("h3 > a").attr("href");
		if (!sogouLinkHref) {
			logger.warn(`Skipping item with missing link for wechatId: ${wechatId}`);
			return null;
		}
		const sogouLink = host + sogouLinkHref;
		const description = $li.find("p.txt-info").text().trim();
		const timeMatch = $li.find("span.s2 script").html()?.match(/timeConvert\('(\d+)'\)/);
		const pubDate = timeMatch ? parseDate(Number.parseInt(timeMatch[1]) * 1e3) : void 0;
		let realLink = sogouLink;
		try {
			let location = (await rofetch.raw(sogouLink, {
				headers: {
					Referer: searchUrl,
					Cookie: hardcodedCookie
				},
				redirect: "manual",
				ignoreResponseError: true
			})).headers?.get("location");
			if (location) {
				if (!location.startsWith("http")) try {
					location = new URL(location, sogouLink).href;
				} catch (error) {
					logger.warn(`Invalid redirect location "${location}" for title "${title}" (wechatId: ${wechatId}): ${error instanceof Error ? error.message : String(error)}`);
					location = null;
				}
				if (typeof location === "string" && location) if (location.startsWith("http://mp.weixin.qq.com") || location.startsWith("https://mp.weixin.qq.com")) realLink = location;
				else try {
					const intermediateLocation = (await rofetch.raw(location, {
						headers: {
							Referer: sogouLink,
							Cookie: hardcodedCookie
						},
						redirect: "manual",
						ignoreResponseError: true
					})).headers?.get("location");
					if (intermediateLocation && (intermediateLocation.startsWith("http://mp.weixin.qq.com") || intermediateLocation.startsWith("https://mp.weixin.qq.com"))) realLink = intermediateLocation;
				} catch (error) {
					logger.warn(`Failed to resolve intermediate redirect for title "${title}" (wechatId: ${wechatId}): ${error instanceof Error ? error.message : String(error)}`);
				}
			} else logger.debug(`No redirect location found for title "${title}" (wechatId: ${wechatId})`);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error);
			if (typeof error === "object" && error !== null && "response" in error && typeof error.response === "object" && error.response !== null && "status" in error.response) logger.debug(`Redirect request failed for "${title}" (wechatId: ${wechatId}) with status ${error.response.status}: ${errorMsg}`);
			else logger.debug(`Redirect request failed for "${title}" (wechatId: ${wechatId}): ${errorMsg}`);
		}
		const isWeChatLink = realLink.startsWith("http://mp.weixin.qq.com") || realLink.startsWith("https://mp.weixin.qq.com");
		const author = $li.find("span.all-time-y2").text().trim();
		return {
			title,
			link: realLink,
			description,
			author,
			pubDate,
			guid: realLink,
			_internal: { isWeChatLink }
		};
	});
	return (await Promise.all(pageItemsPromises)).filter((item) => item !== null);
}
const route = {
	path: "/sogou/:id",
	categories: ["new-media"],
	example: "/wechat/sogou/qimao0908",
	parameters: { id: "公众号 id, 打开 weixin.sogou.com 并搜索相应公众号， 在 URL 中找到 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号（搜狗来源）",
	maintainers: ["EthanWng97", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const wechatId = ctx.req.param("id");
	const allItems = await fetchAndParsePage(wechatId);
	const accountTitle = allItems[0]?.author || wechatId;
	const finalItemsPromises = allItems.map(async (item) => {
		let resultItem = item;
		if (item._internal.isWeChatLink) try {
			resultItem = await finishArticleItem(item);
		} catch (error) {
			logger.debug(`finishArticleItem failed for ${item.link}: ${error instanceof Error ? error.message : String(error)}`);
		}
		if (resultItem && typeof resultItem === "object") return {
			title: resultItem.title,
			link: resultItem.link,
			description: resultItem.description,
			author: resultItem.author,
			pubDate: resultItem.pubDate,
			guid: resultItem.guid,
			...resultItem.content && { content: resultItem.content }
		};
		logger.debug(`Unexpected null or non-object item during final processing for link: ${item?.link}`);
		return null;
	});
	const finalItems = (await Promise.all(finalItemsPromises)).filter((item) => item !== null);
	return {
		title: `${accountTitle} 的微信公众号`,
		link: `${host}/weixin?query=${wechatId}`,
		description: `${accountTitle} 的微信公众号`,
		item: finalItems
	};
}
//#endregion
export { route };
