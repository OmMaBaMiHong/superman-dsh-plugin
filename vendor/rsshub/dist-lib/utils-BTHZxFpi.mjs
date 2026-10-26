import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/capitalmind/utils.ts
const baseUrl = "https://www.capitalmind.in";
async function fetchArticles(path) {
	const $ = load(await rofetch(`${baseUrl}/${path}/page/1`));
	const articlePromises = $(".article-wrapper a.article-card-wrapper").toArray().map(async (element) => {
		const $element = $(element);
		const link = baseUrl + $element.attr("href");
		return await cache_default.tryGet(link, async () => {
			const title = $element.find("h3").text().trim();
			const author = $element.find(String.raw`div.text-[16px]`).text().trim();
			const image = $element.find("img").attr("src");
			const imageUrl = image?.startsWith("/_next/image") ? image.split("url=", 2)[1].split("&", 1)[0] : image;
			const decodedImageUrl = imageUrl ? decodeURIComponent(imageUrl) : "";
			const $articlePage = load(await rofetch(link));
			const $article = $articlePage("article").clone();
			const tags = $article.find("footer div").toArray().map((el) => {
				const $el = $articlePage(el);
				$el.find(".sr-only").remove();
				return $el.text().trim();
			}).filter(Boolean);
			let pubDate = "";
			const $time = $article.find("header").find("time");
			if ($time.length) pubDate = $time.attr("datetime") || $time.text().trim();
			const $content = $article.find("section[aria-label=\"Post content\"]").clone();
			$content.find("footer").remove();
			let podcastData = {};
			const $iframe = $content.find("iframe[src*=\"libsyn.com/embed/episode/id/\"]");
			if ($iframe.length) {
				const src = $iframe.attr("src");
				if (src) {
					const idMatch = src.match(/\/id\/(\d+)\//);
					if (idMatch && idMatch[1]) {
						const episodeId = idMatch[1];
						try {
							const episodeData = await rofetch(`https://html5-player.libsyn.com/api/episode/id/${episodeId}`);
							if (episodeData && episodeData._item && episodeData._item._primary_content) podcastData = {
								mediaUrl: episodeData._item._primary_content._download_url,
								image: `https://assets.libsyn.com/item/${episodeId}`,
								itunes_duration: episodeData._item._primary_content.duration
							};
						} catch {
							logger.info(`Failed to fetch podcast data for episode ID ${episodeId}`);
						}
					}
				}
			}
			$content.find("figure img").each((_, img) => {
				const $img = $articlePage(img);
				const src = $img.attr("src");
				$img.removeAttr("srcset");
				if (src && src.startsWith("/_next/image")) {
					const urlMatch = src.match(/url=([^&]+)/);
					if (urlMatch && urlMatch[1]) {
						const originalUrl = decodeURIComponent(urlMatch[1]);
						$img.attr("src", originalUrl);
					} else if (src.startsWith("/")) $img.attr("src", baseUrl + src);
				}
			});
			return {
				title,
				link,
				author,
				description: $content.html() || `<p><img src="${decodedImageUrl}" alt="${title}"></p><p>Author: ${author}</p>`,
				guid: link,
				itunes_item_image: podcastData?.image || decodedImageUrl,
				category: tags,
				pubDate,
				enclosure_url: podcastData?.mediaUrl || null,
				itunes_duration: podcastData?.itunes_duration || null,
				enclosure_type: podcastData?.mediaUrl ? "audio/mpeg" : null
			};
		});
	});
	return Promise.all(articlePromises);
}
//#endregion
export { fetchArticles as n, baseUrl as t };
