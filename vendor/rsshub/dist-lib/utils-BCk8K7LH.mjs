import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/css-tricks/utils.ts
const rootUrl = "https://css-tricks.com";
async function extractMiniCards(cardselector, titleSelector = "", descSelector = "") {
	const $ = load(await rofetch(rootUrl));
	const cards = $(cardselector).toArray();
	return {
		title: titleSelector ? $(titleSelector).text().trim() : "",
		description: descSelector ? $(descSelector).text().trim() : "",
		cards
	};
}
function extractCardsInfo(cards) {
	return cards.map((card) => {
		const $ = load(card);
		const id = $(card).attr("id");
		const thumbnail = $(card).find("div.article-thumbnail-wrap > a >img").attr("src");
		const article = $("div.article-article");
		return {
			id,
			title: article.find("h2 > a").text(),
			link: article.find("h2 > a").attr("href"),
			thumbnail
		};
	});
}
function extractMiniCardsInfo(cards) {
	return cards.map((card) => {
		const $ = load(card);
		return {
			id: $(card).attr("id")?.replace("mini-", ""),
			title: $("h3.mini-card-title").find("a:not(.aal_anchor)").text(),
			link: $("h3.mini-card-title").find("a:not(.aal_anchor)").attr("href"),
			thumbnail: ""
		};
	});
}
async function processWithWp(cards, mini = false, type = "posts") {
	const ids = (mini ? extractMiniCardsInfo(cards) : extractCardsInfo(cards)).map((card) => card.id.replace("post-", ""));
	const allPosts = await rofetch(`${rootUrl}/wp-json/wp/v2/${type}?include=${ids.join(",")}&_embed&per_page=${ids.length}`);
	const idMappedPost = Object.fromEntries(allPosts.map((post) => [post.id, post]));
	return ids.map((id) => extractPostDetails(idMappedPost[id]));
}
function extractPostDetails(data) {
	const title = data.title.rendered;
	const link = data.link;
	const content = data.content.rendered;
	const summary = data.excerpt.rendered;
	const date = data.date_gmt;
	const updateDate = data.modified_gmt;
	const author = data._embedded?.author;
	const authorName = author?.[0]?.name;
	const authorUrl = author?.[0]?.link;
	const authorAvatar = author?.[0]?.avatar_urls["48"];
	const thumbnail = data._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
	const tags = data._embedded?.["wp:term"]?.[1]?.map((tag) => tag.name);
	return {
		title,
		link,
		description: content,
		banner: thumbnail,
		image: thumbnail,
		pubDate: parseDate(date),
		updated: parseDate(updateDate),
		author: [{
			name: authorName || "",
			url: authorUrl || "",
			avatar: authorAvatar || ""
		}],
		content: {
			html: content,
			text: summary
		},
		category: tags
	};
}
//#endregion
export { processWithWp as n, rootUrl as r, extractMiniCards as t };
