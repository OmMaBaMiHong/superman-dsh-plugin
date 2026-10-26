import { load } from "cheerio";
//#region lib/routes/nwnu/routes/lib/embed-resource.ts
function processEmbedPDF(baseurl, html) {
	const $ = load(html);
	$("div.wp_pdf_player").each((_, el) => {
		const $div = $(el);
		const pdfsrc = $div.attr("pdfsrc") || "";
		const newDiv = `<p><a href=${new URL(pdfsrc, baseurl).href} target="_blank">点击下载 PDF 文件资源</a></p>`;
		$div.replaceWith(newDiv);
	});
	return $.html();
}
//#endregion
export { processEmbedPDF as t };
