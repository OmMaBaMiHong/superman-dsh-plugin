import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/transformer-circuits/index.tsx
const route = {
	path: "/",
	categories: ["programming"],
	example: "/transformer-circuits",
	parameters: {},
	radar: [{
		source: ["transformer-circuits.pub/"],
		target: "/"
	}],
	name: "Articles",
	maintainers: ["shinmohuang"],
	handler
};
async function handler() {
	const rootUrl = "https://transformer-circuits.pub";
	const $ = load(await rofetch(rootUrl));
	const articlePromises = $(".toc a").toArray().map((item) => {
		const $item = $(item);
		const currentElement = $item;
		const currentDate = $item.prevAll(".date").first().text().trim();
		if (currentElement.hasClass("paper") || currentElement.hasClass("note")) {
			const articleType = currentElement.hasClass("paper") ? "Paper" : "Note";
			const title = currentElement.find("h3").text().trim();
			let author = "";
			const byline = currentElement.find(".byline");
			if (byline.length) author = byline.text().trim();
			const description = currentElement.find(".description").text().trim();
			const href = currentElement.attr("href");
			const articleUrl = href ? href.startsWith("http") ? href : `${rootUrl}/${href}` : rootUrl;
			return cache_default.tryGet(articleUrl, async () => {
				const fullContent = await fetchArticleContent(articleUrl);
				return {
					title,
					link: articleUrl,
					pubDate: parseDate(currentDate, "MMMM YYYY"),
					author,
					description: fullContent || `${articleType}: ${description}`,
					category: [
						"AI",
						"Machine Learning",
						"Anthropic",
						"Transformer Circuits"
					]
				};
			});
		}
		return null;
	});
	return {
		title: "Transformer Circuits Thread",
		link: rootUrl,
		item: (await Promise.all(articlePromises)).filter(Boolean),
		description: "Research on reverse engineering transformer language models into human-understandable programs"
	};
}
async function fetchArticleContent(url) {
	try {
		const $ = load(await rofetch(url));
		$(".article-header, .tooltip, modal, script, style, d-front-matter, .visual-toc").remove();
		let content = $("d-article").html();
		if (!content) {
			content = $("main article, .article-content, .post-content, .content-area").html() || $(".content, .article, .post").html() || $("main").html();
			if (!content) {
				logger.warn(`No suitable content container found for ${url}`);
				content = `<p>Could not extract content. Please visit <a href="${url}">the original page</a>.</p>`;
			}
		}
		return renderToString(/* @__PURE__ */ jsx(TransformerCircuitsArticle, {
			content,
			link: url
		}));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`Error fetching article content from ${url}: ${errorMessage}`);
		return null;
	}
}
const articleStyles = `
    .content-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
    }
    img {
        max-width: 100%;
        height: auto;
    }
    pre, code {
        background-color: #f5f5f5;
        border-radius: 3px;
        padding: 0.2em 0.4em;
        overflow-x: auto;
    }
    a {
        color: #0366d6;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }
    p, ul, ol {
        margin-bottom: 16px;
    }
    .read-original {
        margin-top: 30px;
        margin-bottom: 30px;
        text-align: center;
        padding: 10px;
        background-color: #f7f7f7;
        border-radius: 4px;
    }
    /* Support for custom elements used on transformer-circuits website */
    d-figure, figure {
        margin: 20px 0;
        text-align: center;
    }
    d-byline {
        font-size: 0.9em;
        color: #666;
        margin: 15px 0;
    }
    .gdoc-image img {
        max-width: 100%;
        display: block;
        margin: 0 auto;
    }
`;
const TransformerCircuitsArticle = ({ content, link }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("style", { children: articleStyles }),
	/* @__PURE__ */ jsx("div", {
		class: "content-wrapper",
		children: raw(content)
	}),
	/* @__PURE__ */ jsx("div", {
		class: "read-original",
		children: /* @__PURE__ */ jsx("a", {
			href: link,
			target: "_blank",
			children: "Read Original"
		})
	})
] });
//#endregion
export { route };
