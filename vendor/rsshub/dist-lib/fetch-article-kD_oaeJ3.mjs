import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/twreporter/templates/image.tsx
const ImageBlock = ({ image, description, caption }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
	src: image,
	alt: description
}), /* @__PURE__ */ jsx("figcaption", { children: caption })] });
const renderImage = (props) => renderToString(/* @__PURE__ */ jsx(ImageBlock, { ...props }));
//#endregion
//#region lib/routes/twreporter/templates/youtube.tsx
const YoutubeEmbed = ({ video }) => /* @__PURE__ */ jsx("iframe", {
	id: "ytplayer",
	type: "text/html",
	width: "640",
	height: "360",
	src: `https://www.youtube-nocookie.com/embed/${video}`,
	frameborder: "0",
	allowfullscreen: true,
	referrerpolicy: "strict-origin-when-cross-origin"
});
const renderYouTube = (props) => renderToString(/* @__PURE__ */ jsx(YoutubeEmbed, { ...props }));
//#endregion
//#region lib/routes/twreporter/fetch-article.ts
async function fetch(slug) {
	const post = (await rofetch(`https://go-api.twreporter.org/v2/posts/${slug}?full=true`)).data;
	const time = post.published_date;
	let authors = "";
	if (post.writers) authors = post.writers.map((writer) => writer.job_title ? writer.job_title + " / " + writer.name : "文字 / " + writer.name).join("，");
	if (post.photographers) {
		const photographers = post.photographers.map((photographer) => {
			let title = "攝影 / ";
			if (photographer.job_title) title = photographer.job_title + " / ";
			return title + photographer.name;
		}).join("，");
		authors += "；" + photographers;
	}
	const imageSource = post.hero_image ?? post.og_image;
	const bannerImage = imageSource?.resized_targets.desktop.url;
	const caption = post.leading_image_description;
	const bannerDescription = imageSource?.description ?? "";
	const ogDescription = post.og_description;
	const banner = imageSource ? renderImage({
		image: bannerImage,
		description: bannerDescription,
		caption
	}) : "";
	function format(type, content) {
		let block = "";
		if (content !== "" && type !== "embeddedcode") switch (type) {
			case "image":
			case "slideshow":
				block = content.map((image) => renderImage({
					image: image.desktop.url,
					description: image.description,
					caption: image.description
				})).join("<br>");
				break;
			case "blockquote":
				block = `<blockquote>${content}</blockquote>`;
				break;
			case "header-one":
				block = `<h1>${content}</h1>`;
				break;
			case "header-two":
				block = `<h2>${content}</h2>`;
				break;
			case "infobox": {
				const box = content[0];
				block = `<h2>${box.title}</h2>${box.body}`;
				break;
			}
			case "youtube": {
				const id = content[0].youtubeId.split("?", 1)[0];
				block = renderYouTube({ video: id });
				break;
			}
			case "quoteby": {
				const quote = content[0];
				block = `<blockquote>${quote.quote}</blockquote><p>${quote.quoteBy}</p>`;
				break;
			}
			default: block = `${content}<br>`;
		}
		return block;
	}
	const contents = [
		banner,
		ogDescription,
		post.content.api_data.map((item) => {
			const content = item.content;
			const type = item.type;
			return format(type, content);
		}).filter(Boolean).join("<br>")
	].filter(Boolean).join("<br><br>");
	return {
		author: authors,
		description: contents,
		link: `https://www.twreporter.org/a/${slug}`,
		guid: `https://www.twreporter.org/a/${slug}`,
		pubDate: parseDate(time, "YYYY-MM-DDTHH:mm:ssZ")
	};
}
//#endregion
export { fetch as t };
