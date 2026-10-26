import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/aeon/utils.tsx
const ENDPOINT = "https://api.aeonmedia.co/graphql";
const ESSAY = `
    query getAeonEssay($slug: String!) {
        essay(slug: $slug) {
            publishedAt
            updatedAt
            authors {
                name
                authorBio
            }
            audioUrl
            image {
                url
                alt
                caption
            }
            body
        }
    }
`;
const VIDEO = `
    query getAeonVideo($slug: String!, $site: SiteEnum!) {
        video(slug: $slug, site: $site) {
            publishedAt
            updatedAt
            authors {
                name
                authorBio
            }
            hoster
            hosterId
            credits
            description
        }
    }
`;
const renderVideoDescription = (article) => {
	let video = article.hosterId;
	if (article.hoster === "vimeo") video = `https://player.vimeo.com/video/${video}?dnt=1`;
	else if (article.hoster === "youtube") video = `https://www.youtube-nocookie.com/embed/${video}`;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("iframe", {
			width: "672",
			height: "377",
			src: video,
			frameborder: "0",
			allowfullscreen: true,
			referrerpolicy: "strict-origin-when-cross-origin"
		}),
		article.credits ? raw(article.credits) : null,
		article.description ? raw(article.description) : null
	] }));
};
const renderEssayDescription = ({ banner, authorsBio, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	banner?.url ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: banner.url,
		alt: banner.alt
	}), banner.caption ? /* @__PURE__ */ jsx("figcaption", { children: raw(banner.caption) }) : null] }) : null,
	authorsBio ? raw(authorsBio) : null,
	content ? raw(content) : null
] }));
const getJSON = (slug, site) => {
	return rofetch(ENDPOINT, {
		method: "POST",
		body: {
			operationName: site ? "getAeonVideo" : "getAeonEssay",
			query: site ? VIDEO : ESSAY,
			variables: site ? {
				slug,
				site
			} : { slug }
		}
	});
};
const getData = async (list) => {
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await getJSON(item.slug, item.type === "video" ? "aeon" : null)).data[item.type];
		item.pubDate = parseDate(data.publishedAt);
		if (item.type === "video") item.description = renderVideoDescription(data);
		else {
			if (data.audioUrl) {
				delete item.image;
				item.enclosure_url = data.audioUrl;
				item.enclosure_type = "audio/mpeg";
			} else if (data.image?.url) {
				const imageUrl = data.image.url;
				const cleanImageUrl = imageUrl.split("?", 1)[0].toLowerCase();
				item.enclosure_url = imageUrl;
				if (cleanImageUrl.endsWith(".jpg") || cleanImageUrl.endsWith(".jpeg")) item.enclosure_type = "image/jpeg";
				item.image = imageUrl;
			}
			const capture = load(data.body, null, false);
			const banner = data.image;
			capture("p.pullquote").remove();
			const authorsBio = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("hr", {}),
				data.authors.map((author) => /* @__PURE__ */ jsxs("p", { children: [author.name, raw(author.authorBio.replaceAll(/^<p>/g, " "))] })),
				/* @__PURE__ */ jsx("hr", {}),
				/* @__PURE__ */ jsx("br", {})
			] }));
			item.description = renderEssayDescription({
				banner,
				authorsBio,
				content: capture.html()
			});
		}
		return item;
	})));
};
//#endregion
export { getData as t };
