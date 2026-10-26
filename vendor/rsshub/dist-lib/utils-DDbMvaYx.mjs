import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/thewirehindi/utils.tsx
const renderDescription = (excerpt, image, altText, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	excerpt ? /* @__PURE__ */ jsx(Fragment, { children: raw(excerpt) }) : null,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	image ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("img", {
			src: image,
			alt: altText,
			style: "max-width: 100%; height: auto;"
		}),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	content ? /* @__PURE__ */ jsx(Fragment, { children: raw(content) }) : null
] }));
function mapPostToItem(post) {
	const featuredMedia = post._embedded?.["wp:featuredmedia"]?.find((v) => v.id === post.featured_media);
	const image = featuredMedia?.source_url;
	const altText = featuredMedia?.alt_text || featuredMedia?.title?.rendered || "Featured Image";
	return {
		title: post.title.rendered,
		description: renderDescription(post.excerpt.rendered, image, altText, post.content.rendered),
		link: post.link,
		pubDate: parseDate(post.date_gmt),
		updated: parseDate(post.modified_gmt),
		itunes_item_image: image,
		image,
		author: post._embedded?.author?.map((v) => ({
			name: v.name,
			url: v.link,
			avatar: v.avatar_urls?.["96"] || v.avatar_urls?.["48"] || v.avatar_urls?.["24"]
		})).join(", ") || "The Wire Hindi",
		category: post._embedded?.["wp:term"]?.flat().map((v) => v.name)
	};
}
//#endregion
export { mapPostToItem as t };
