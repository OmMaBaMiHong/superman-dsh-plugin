import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/resetera/thread.ts
const BASE = "https://www.resetera.com";
const absolutize = (u, root = BASE) => {
	if (!u) return u;
	if (u.startsWith("#")) return root + u;
	if (u.startsWith("//")) return "https:" + u;
	if (u.startsWith("/")) return BASE + u;
	return u;
};
const getPostId = (link) => Number(link?.match(/post-(\d+)/)?.[1] || 0);
const pickFromSrcset = (v) => v ? v.split(",").map((s) => s.trim().split(" ", 1)[0]).find(Boolean) : void 0;
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const threadRoot = `${BASE}/threads/${id}/`;
	const firstHtml = await rofetch(threadRoot);
	const $ = load(firstHtml);
	let lastPage = 1;
	$("a[href*=\"page-\"]").each((_, a) => {
		const m = ($(a).attr("href") || "").match(/page-(\d+)/);
		if (m) lastPage = Math.max(lastPage, Number(m[1]));
	});
	const targetUrl = lastPage === 1 ? threadRoot : `${threadRoot}page-${lastPage}`;
	const pages = lastPage > 1 ? [lastPage - 1, lastPage] : [1];
	const htmlMap = /* @__PURE__ */ new Map([[1, firstHtml]]);
	const htmlList = await Promise.all(pages.map(async (p) => {
		if (htmlMap.has(p)) return htmlMap.get(p);
		const html = await rofetch(p === 1 ? threadRoot : `${threadRoot}page-${p}`);
		htmlMap.set(p, html);
		return html;
	}));
	const seen = /* @__PURE__ */ new Set();
	const items = htmlList.flatMap((html) => {
		const $$ = load(html);
		return $$("article.message").toArray().map((el) => {
			const $el = $$(el);
			const author = $el.find(".message-author, .username, .message-name a, [itemprop=\"name\"]").first().text().trim() || "";
			const perma = $el.find(".message-attribution-opposite a[href*=\"/post-\"]").last().attr("href") || $el.find("a[href*=\"#post\"]").last().attr("href") || "";
			const link = perma ? absolutize(perma, threadRoot) : targetUrl;
			if (!link || seen.has(link)) return null;
			seen.add(link);
			const timeEl = $el.find("time").first();
			const dataTime = Number(timeEl.attr("data-time") || 0);
			const pubDate = timeEl.attr("datetime") || (dataTime ? (/* @__PURE__ */ new Date(dataTime * 1e3)).toUTCString() : void 0);
			const $body = $el.find(".message-body .bbWrapper, .message-content .bbWrapper, .bbWrapper").first().clone();
			$body.find(".bbCodeBlock--quote, blockquote.bbCodeBlock").remove();
			$body.find(".bbCodeBlock--spoiler .bbCodeBlock-title").remove();
			const imgs = $body.find("img, picture source").toArray().map((node) => {
				const $n = $$(node);
				const src = $n.attr("src") || $n.attr("data-src") || $n.attr("data-original") || $n.attr("data-url") || pickFromSrcset($n.attr("srcset")) || pickFromSrcset($n.attr("data-srcset"));
				return absolutize(src || "", threadRoot);
			}).filter((u) => !!u);
			const hasImage = imgs.length > 0;
			const $textOnly = $body.clone();
			$textOnly.find("img, picture").remove();
			const textHtml = ($textOnly.html() || "").trim();
			const floor = $el.find(".message-attribution-opposite a").last().text().trim();
			return {
				title: author ? `${author}${floor ? " - " + floor : ""}` : floor || "New post",
				link,
				guid: link,
				description: `
                    <p><a href="${link}">🔗 Source post</a></p>
                    ${textHtml}${hasImage ? imgs.map((u) => `<p><img src="${u}" referrerpolicy="no-referrer" /></p>`).join("") : ""}
                `,
				author,
				pubDate,
				category: hasImage ? ["image"] : void 0
			};
		}).filter(Boolean);
	});
	items.sort((a, b) => {
		const ida = getPostId(a.link);
		const idb = getPostId(b.link);
		if (idb !== ida) return idb - ida;
		const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
		return (b.pubDate ? new Date(b.pubDate).getTime() : 0) - ta;
	});
	return {
		title: load(htmlList.at(-1) ?? "")("h1").first().text().trim() || `ResetEra Thread ${id}`,
		link: targetUrl,
		item: items
	};
};
const route = {
	path: "/thread/:id",
	name: "Thread latest posts (text & images)",
	url: "resetera.com",
	example: "/resetera/thread/1076160",
	parameters: { id: "Numeric thread ID at the end of the URL" },
	maintainers: ["ZEN-GUO"],
	categories: ["bbs"],
	radar: [{
		source: ["resetera.com/threads/:slug.:id/"],
		target: "/thread/:id"
	}],
	handler
};
//#endregion
export { route };
