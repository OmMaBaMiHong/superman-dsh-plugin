import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/msn/index.ts
const apiKey = "0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM";
const fetchedArticleContentHtmlImgRegex = /<img data-reference="image" data-document-id="cms\/api\/amp\/image\/([A-Za-z0-9]+)">/;
const route = {
	path: "/:market/:name/:id",
	parameters: {
		market: "Market code. Find it in MSN url, e.g. zh-tw",
		name: "Name of the channel. Find it in MSN url, e.g. Bloomberg",
		id: "ID of the channel (always starts with sr-vid). Find it in MSN url, e.g. sr-vid-08gw7ky4u229xjsjvnf4n6n7v67gxm0pjmv9fr4y2x9jjmwcri4s"
	},
	categories: ["traditional-media"],
	example: "/msn/zh-tw/Bloomberg/sr-vid-08gw7ky4u229xjsjvnf4n6n7v67gxm0pjmv9fr4y2x9jjmwcri4s",
	description: "MSN News",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true
	},
	radar: [{
		source: ["www.msn.com/:market/channel/source/:name/:id"],
		target: "/:market/:name/:id"
	}],
	name: "News",
	maintainers: ["KTachibanaM"],
	handler: async (ctx) => {
		const { market, name, id } = ctx.req.param();
		let truncatedId = id;
		if (truncatedId.startsWith("sr-")) truncatedId = truncatedId.slice(3);
		const dataClientSettings = load(await rofetch(`https://www.msn.com/${market}/channel/source/${name}/${id}`))("head").attr("data-client-settings") ?? "{}";
		const requestMuid = JSON.parse(dataClientSettings).fd_muid;
		const jsonData = await rofetch(`https://assets.msn.com/service/news/feed/pages/providerfullpage?market=${market}&query=newest&CommunityProfileId=${truncatedId}&apikey=${apiKey}&user=m-${requestMuid}`);
		const items = await Promise.all(jsonData.sections[0].cards.map(async (card) => {
			let articleContentHtml = "";
			const articleUrl = card.url;
			let articleId = URL.parse(articleUrl)?.pathname.split("/").pop();
			if (articleId?.startsWith("ar-")) {
				articleId = articleId.slice(3);
				articleContentHtml = (await cache_default.tryGet(articleId, async () => {
					return (await rofetch(`https://assets.msn.com/content/view/v2/Detail/${market}/${articleId}`)).body;
				})).replace(fetchedArticleContentHtmlImgRegex, "<img src=\"https://img-s-msn-com.akamaized.net/tenant/amp/entityid/$1.img\">");
			}
			return {
				title: card.title,
				link: articleUrl,
				description: card.abstract,
				content: { html: articleContentHtml },
				pubDate: parseDate(card.publishedDateTime),
				category: [card.category]
			};
		}));
		return {
			title: name,
			image: "https://www.msn.com/favicon.ico",
			link: `https://www.msn.com/${market}/channel/source/${name}/${id}`,
			item: items
		};
	}
};
//#endregion
export { route };
