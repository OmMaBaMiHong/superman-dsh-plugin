import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pixivision/utils.ts
const multiImagePrompt = {
	en: (count) => `${count} images in total`,
	zh: (count) => `共${count}张图`,
	"zh-tw": (count) => `共${count}張圖`,
	ko: (count) => `총 ${count}개의 이미지`,
	ja: (count) => `計${count}枚の画像`
};
function processContent($, lang) {
	$(".am__work__user-icon-container").remove();
	$(".am__work__title").attr("style", "display: inline;");
	$(".am__work__user-name").attr("style", "display: inline; margin-left: 10px;");
	$(".mic__label").each((_, elem) => {
		const $label = $(elem);
		const count = $label.text();
		$label.parentsUntil(".am__work").last().parent().find(".am__work__title-container").append(`<p style="float: right; margin: 0;">${multiImagePrompt[lang](count)}</p>`);
		$label.remove();
	});
	$(".article-item, ._feature-article-body__pixiv_illust").after("<br>");
	$(".arc__thumbnail-label").remove();
	$(".arc__footer-container").remove();
	$("article._article-card").each((_, article) => {
		const $article = $(article);
		const $thumbnail = $article.find("._thumbnail");
		const bgImageMatch = $thumbnail.attr("style")?.match(/url\((.*?)\)/);
		const imageUrl = bgImageMatch ? bgImageMatch[1] : "";
		$thumbnail.remove();
		if (imageUrl) $article.prepend(`<img src="${imageUrl}" alt="Article thumbnail">`);
	});
	$(".fab__script").each((_, elem) => {
		const $elem = $(elem);
		const href = $elem.find("blockquote > a").attr("href");
		if (href) {
			const match = href.match(/\/status\/(\d+)/);
			if (match) {
				const tweetId = match[1];
				$elem.html(`
                <iframe
                    scrolling="no"
                    frameborder="0"
                    allowtransparency="true"
                    allowfullscreen="true"
                    class=""
                    style="position: static; visibility: visible; display: block; width: 550px; height: 1000px; flex-grow: 1;"
                    title="X Post"
                    src="https://platform.twitter.com/embed/Tweet.html?id=${tweetId}"
                ></iframe>
            `);
				$elem.find("blockquote").remove();
			}
		}
	});
	return $(".am__body").html()?.replaceAll("https://i.pximg.net", () => config.pixiv.imgProxy || "") || "";
}
//#endregion
//#region lib/routes/pixivision/index.ts
const route = {
	path: "/:lang/:category?",
	categories: ["anime"],
	view: 0,
	example: "/pixivision/zh-tw",
	parameters: {
		lang: "Language",
		category: "Category"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["SnowAgar25"],
	description: `::: tip
\`https://www.pixivision.net/zh-tw/c/interview\` → \`/pixivision/zh-tw/interview\`
:::`,
	radar: [{
		source: ["www.pixivision.net/:lang"],
		target: "/:lang"
	}, {
		source: ["www.pixivision.net/:lang/c/:category"],
		target: "/:lang/:category"
	}],
	handler
};
async function handler(ctx) {
	const { lang, category } = ctx.req.param();
	const baseUrl = "https://www.pixivision.net";
	const url = category ? `${baseUrl}/${lang}/c/${category}` : `${baseUrl}/${lang}`;
	const headers = { headers: { Cookie: `user_lang=${lang.replace("-", "_")}` } };
	const { data: response } = await got_default(url, headers);
	const $ = load(response);
	const list = $("li.article-card-container a[data-gtm-action=\"ClickTitle\"]").toArray().map((elem) => ({
		title: $(elem).text(),
		link: new URL($(elem).attr("href") ?? "", baseUrl).href
	}));
	const items = await Promise.all(list.map(async (item) => {
		return await cache_default.tryGet(item.link, async () => {
			const { data: articleData } = await got_default(item.link, headers);
			const $article = load(articleData);
			const processedDescription = processContent($article, lang);
			return {
				title: item.title,
				description: processedDescription,
				link: item.link,
				pubDate: parseDate($article("time").attr("datetime") ?? "")
			};
		});
	}));
	return {
		title: `${$(".ssc__header").length ? $(".ssc__header").text() : "New"} - pixivision`,
		link: url,
		item: items.filter((item) => !!item)
	};
}
//#endregion
export { route };
