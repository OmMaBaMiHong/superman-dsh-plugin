import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/psyche/templates/essay.tsx
const renderEssay = ({ banner, authorsBio, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", {
		src: banner,
		alt: ""
	}),
	authorsBio ? raw(authorsBio) : null,
	content ? raw(content) : null
] }));
//#endregion
//#region lib/routes/psyche/templates/video.tsx
const renderVideo = (article) => {
	let videoUrl = article.hosterId;
	if (article.hoster === "vimeo") videoUrl = `https://player.vimeo.com/video/${videoUrl}?dnt=1`;
	else if (article.hoster === "youtube") videoUrl = `https://www.youtube-nocookie.com/embed/${videoUrl}`;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("iframe", {
			width: "672",
			height: "377",
			src: videoUrl,
			frameborder: "0",
			allowfullscreen: true,
			referrerpolicy: "strict-origin-when-cross-origin"
		}),
		article.credits ? raw(article.credits) : null,
		article.description ? raw(article.description) : null
	] }));
};
//#endregion
//#region lib/routes/psyche/utils.ts
const getImageById = async (id) => {
	return (await rofetch("https://api.aeonmedia.co/graphql", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: "query getImageById($id: ID!) { image(id: $id) { id url alt caption width height } }",
			variables: {
				id,
				site: "Aeon"
			},
			operationName: "getImageById"
		})
	})).data.image.url;
};
function format(article) {
	const type = article.type.toLowerCase();
	let block = "";
	let banner;
	let authorsBio;
	switch (type) {
		case "film":
			block = renderVideo(article);
			break;
		case "guide": {
			banner = article.imageSquare?.url;
			authorsBio = article.authors.map((author) => author.bio).join(" ");
			const sectionNames = [
				"Need To Know",
				"What To Do",
				"Key Points",
				"Learn More",
				"Links & Books"
			];
			const content = Object.keys(article).filter((key) => key.startsWith("section") && key !== "section").map((section) => {
				const capture = load(article[section]);
				capture("p.pullquote").remove();
				return `<h2>${sectionNames.shift()}</h2>` + capture.html();
			}).join("");
			block = renderEssay({
				banner,
				authorsBio,
				content
			});
			break;
		}
		case "idea": {
			banner = article.imageLandscape?.url;
			authorsBio = article.authors.map((author) => author.bio).join(" ");
			const capture = load(article.body);
			capture("p.pullquote").remove();
			block = renderEssay({
				banner,
				authorsBio,
				content: capture.html()
			});
			break;
		}
		default: break;
	}
	return block;
}
const getData = async (list) => {
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const article = (await rofetch(item.json)).pageProps.article;
		item.pubDate = new Date(article.publishedAt).toUTCString();
		const capture = load(format(article));
		await Promise.all(capture("dl > dt").toArray().map(async (item) => {
			const id = capture(item).text();
			const image = await getImageById(id);
			capture(item).replaceWith(`<img src="${image}" alt="${id}">`);
		}));
		const authors = article.type === "film" ? article.creditsShort : article.authors.map((author) => author.name).join(", ");
		item.description = capture.html();
		item.author = authors;
		return item;
	})));
};
//#endregion
export { getData as t };
