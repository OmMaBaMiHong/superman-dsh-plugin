import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/cfr/utils.ts
function getDataItem(href) {
	const link = `https://www.cfr.org${href}`;
	return cache_default.tryGet(link, async () => {
		const prefix = href?.split("/", 2)[1];
		const $ = load(await rofetch(link));
		let dataItem;
		switch (prefix) {
			case "article":
				dataItem = parseArticle($);
				break;
			case "blog":
				dataItem = parseBlog($);
				break;
			case "book":
				dataItem = parseBook($);
				break;
			case "conference-calls":
				dataItem = parseConferenceCalls($);
				break;
			case "event":
				dataItem = parseEvent($);
				break;
			case "backgrounder":
				dataItem = parseBackgrounder($);
				break;
			case "podcasts":
				dataItem = parsePodcasts($);
				break;
			case "task-force-report":
				dataItem = parseTaskForceReport($);
				break;
			case "timeline":
				dataItem = parseTimeline($);
				break;
			case "video":
				dataItem = parseVideo($);
				break;
			default: dataItem = parseDefault($);
		}
		return {
			...dataItem,
			link
		};
	});
}
function parseArticle($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".body-content"), $);
	const $articleHeader = $(".article-header__image");
	if ($articleHeader.length) description = `<figure>${$articleHeader.html()}</figure><br>${description}`;
	return {
		title: linkData?.title ?? $(".article-header__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseBlog($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".body-content"), $);
	const figure = $(".article-header-blog__figure");
	if (figure.length) description = `<figure>${figure.html()}</figure><br>${description}`;
	return {
		title: linkData?.title ?? $(".article-header-blog__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseBook($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".body-content"), $);
	description = `${$(".article-header__section-top").html()}<br>${description}`;
	return {
		title: linkData?.title ?? $(".article-header__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseConferenceCalls($) {
	const linkData = parseLinkData($);
	const description = parseDescription($(".podcast-body").last(), $);
	return {
		title: linkData?.title ?? $("head title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseEvent($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".body-content"), $);
	const videoIfame = getVideoIframe($(".msp-event-video"));
	if (videoIfame) description = `${videoIfame}<br>${description}`;
	return {
		title: linkData?.title ?? $(".msp-event-header-past__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseBackgrounder($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".main-wrapper__article-body .body-content"), $);
	const summary = $(".main-wrapper__article-body .summary").html();
	if (summary) description = `${summary}<br>${description}`;
	const figure = $(".article-header-backgrounder__figure");
	if (figure.length) description = `<figure>${figure.html()}</figure><br>${description}`;
	return {
		title: linkData?.title ?? $(".article-header-backgrounder__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parsePodcasts($) {
	const linkData = parseLinkData($);
	let description = $(".body-content").first().html() ?? "";
	const audioSrc = $("#player-default").attr("src");
	if (audioSrc) description = `<audio controls src="${audioSrc}"></audio><br>${description}`;
	return {
		title: linkData?.title ?? $("head title").text(),
		pubDate: linkData?.pubDate,
		description,
		enclosure_url: audioSrc,
		enclosure_type: "audio/mpeg"
	};
}
function parseTaskForceReport($) {
	const linkData = parseLinkData($);
	let description = "";
	$(".main-content").each((_, ele) => {
		const content = $(ele).find(".content_area").html() ?? "";
		description += `${content}<br>`;
	});
	return {
		title: linkData?.title ?? $(".hero__title").remove(".subtitle").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseTimeline($) {
	const linkData = parseLinkData($);
	const $description = $(".timeline-slides");
	$description.find(".timeline-slide__shadow").remove();
	$description.find(".field--image").each((_, ele) => {
		$(ele).replaceWith($(ele).find("img"));
	});
	let description = $description.find(".timeline-intro__description").html() ?? "";
	for (const item of $description.find(".timeline-slide__content").toArray()) {
		const $item = $(item);
		$item.find(".timeline-slide__dates-header").replaceWith("<h1>" + $item.find(".timeline-slide__dates-header").text() + "</h1>");
		$item.find(".timeline-slide__dates").replaceWith("<h2>" + $item.find(".timeline-slide__dates").text() + "</h2>");
		description += `<br>${$item.html()}`;
	}
	return {
		title: linkData?.title ?? $(".timeline-header__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseVideo($) {
	const linkData = parseLinkData($);
	let description = parseDescription($(".body-content"), $);
	const videoIfame = getVideoIframe($(".article-header__image"));
	if (videoIfame) description = `${videoIfame}<br>${description}`;
	return {
		title: linkData?.title ?? $(".article-header__title").text(),
		pubDate: linkData?.pubDate,
		description
	};
}
function parseDefault($) {
	if ($(".body-content").length) return parseArticle($);
	const linkData = parseLinkData($);
	return {
		title: linkData?.title ?? $("head title").text(),
		pubDate: linkData?.pubDate
	};
}
function parseLinkData($) {
	try {
		const data = JSON.parse($("script[type=\"application/ld+json\"]").text())["@graph"][0];
		return {
			title: data.name,
			pubDate: parseDate(data.dateModified)
		};
	} catch {}
}
function getVideoIframe($ele) {
	const setup = $ele.find("video").data("setup");
	if (setup) {
		const youtubeSource = setup.sources.find((i) => i.type === "video/youtube");
		if (youtubeSource) {
			const videoId = youtubeSource.src.match(/\?v=([^&]+)/)?.[1];
			if (videoId) return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" width="640" height="360" frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
		}
	}
}
function parseDescription($description, $) {
	$description.find(".desktop-only").remove();
	$description.find(".mobile-only").remove();
	$description.find(".newsletter-tout").remove();
	$description.find(".carousel-gallery").remove();
	$description.find("svg").remove();
	$description.find(".field--image").each((_, ele) => {
		$(ele).replaceWith($(ele).find("img"));
	});
	$description.find(".video-embed").each((_, ele) => {
		const $ele = $(ele);
		const videoIframe = getVideoIframe($ele);
		if (videoIframe) $ele.replaceWith(videoIframe);
	});
	return $description.html() ?? "";
}
//#endregion
//#region lib/routes/cfr/index.ts
const route = {
	path: "/:category/:subCategory?",
	categories: ["traditional-media"],
	parameters: {
		category: "category, find it in the URL",
		subCategory: "sub-category, find it in the URL"
	},
	example: "/cfr/asia",
	name: "News",
	maintainers: ["KarasuShin"],
	handler,
	radar: [{
		source: ["www.cfr.org/:category", "www.cfr.org/:category/:subCategory"],
		target: "/:category/:subCategory?"
	}],
	features: { antiCrawler: true }
};
async function handler(ctx) {
	const { category, subCategory } = ctx.req.param();
	let link = `https://www.cfr.org/${category}`;
	if (subCategory) link += `/${subCategory}`;
	const $ = load(await rofetch(link));
	const items = await pMap($({
		podcasts: ".episode-content__title a",
		blog: ".card-series__content-link",
		"books-reports": ".card-article__link"
	}[category] ?? ".card-article-large__link").toArray(), (item) => getDataItem($(item).attr("href")), { concurrency: 5 });
	return {
		title: $("head title").text().replace(" | Council on Foreign Relations", ""),
		link,
		item: items
	};
}
//#endregion
export { route };
