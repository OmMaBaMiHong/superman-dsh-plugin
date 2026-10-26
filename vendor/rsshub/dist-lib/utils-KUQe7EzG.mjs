import { load } from "cheerio";
//#region lib/routes/f95zone/utils.ts
const ALLOWED_TAGS = /* @__PURE__ */ new Set([
	"div",
	"span",
	"p",
	"br",
	"b",
	"strong",
	"i",
	"em",
	"u",
	"s",
	"a",
	"img",
	"ul",
	"ol",
	"li",
	"blockquote",
	"hr",
	"pre",
	"code"
]);
const ALLOWED_ATTRS = {
	a: [
		"href",
		"target",
		"rel"
	],
	img: [
		"src",
		"alt",
		"title",
		"style"
	],
	div: ["style"],
	span: ["style"]
};
const processContent = (html) => {
	const $ = load(html);
	const seenImages = /* @__PURE__ */ new Set();
	$("img").each((_, el) => {
		const $img = $(el);
		const $parent = $img.parent("a");
		let src = $parent.attr("href") || $img.attr("data-src") || $img.attr("src") || "";
		src = src.replace("/thumb/", "/");
		if (!src || src.startsWith("data:") || seenImages.has(src)) $img.remove();
		else {
			seenImages.add(src);
			$img.attr("src", src).removeAttr("data-src");
			if ($parent.length) $parent.replaceWith($img);
		}
	});
	$("button, script, style, noscript").remove();
	let changed = true;
	while (changed) {
		changed = false;
		$("*").each((_, el) => {
			if (el.type !== "tag" || ALLOWED_TAGS.has(el.name)) return;
			$(el).replaceWith($(el).html() || "");
			changed = true;
			return false;
		});
	}
	$("*").each((_, el) => {
		if (el.type !== "tag") return;
		const allowed = new Set(ALLOWED_ATTRS[el.name] || []);
		const attrKeys = Object.keys(el.attribs || {});
		for (const attr of attrKeys) if (!allowed.has(attr)) $(el).removeAttr(attr);
	});
	$("div").filter((_, el) => !$(el).html()?.trim()).remove();
	return $.html() || "";
};
//#endregion
export { processContent as t };
