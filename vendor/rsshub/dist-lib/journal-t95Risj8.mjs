import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-CoWomRj3.mjs";
import { load } from "cheerio";
//#region lib/routes/ieee/journal.ts
const ieeeHost = "https://ieeexplore.ieee.org";
const route = {
	name: "IEEE Journal Articles",
	maintainers: ["HenryQW"],
	categories: ["journal"],
	path: "/journal/:punumber/:earlyAccess?",
	parameters: {
		punumber: "Publication Number, look for `punumber` in the URL",
		earlyAccess: "Optional, set any value to get early access articles"
	},
	example: "/ieee/journal/6287639/preprint",
	handler
};
async function handler(ctx) {
	const publicationNumber = ctx.req.param("punumber");
	const earlyAccess = !!ctx.req.param("earlyAccess");
	const { displayTitle, currentIssue, preprintIssue, coverImagePath } = await fetchMetadata(publicationNumber);
	const { issueNumber, volume } = earlyAccess ? preprintIssue : currentIssue;
	const list = (await fetchTOCData(publicationNumber, issueNumber)).records.map((item) => {
		return mapRecordToItem(volume)(item);
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const m = (load(await rofetch(`https://ieeexplore.ieee.org${item.link}`))("script[type=\"text/javascript\"]:contains(\"xplGlobal.document.metadata\")").text() || "").match(/xplGlobal\.document\.metadata\s*=\s*(\{[\s\S]*?\})\s*;/);
		item.abstract = m ? JSON.parse(m[1]).abstract ?? " " : " ";
		item.description = renderDescription(item);
		return item;
	})));
	return {
		title: displayTitle,
		link: `${ieeeHost}/xpl/tocresult.jsp?isnumber=${issueNumber}`,
		item: items,
		image: `${ieeeHost}${coverImagePath}`
	};
}
async function fetchMetadata(punumber) {
	return (await got_default(`${ieeeHost}/rest/publication/home/metadata?pubid=${punumber}`)).data;
}
async function fetchTOCData(punumber, isnumber) {
	return (await got_default.post(`${ieeeHost}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, { json: {
		punumber,
		isnumber,
		rowsPerPage: "100"
	} })).data;
}
function mapRecordToItem(volume) {
	return (item) => ({
		abstract: item.abstract || "",
		authors: item.authors ? item.authors.map((author) => author.preferredName).join("; ") : "",
		description: "",
		doi: item.doi,
		link: item.htmlLink,
		title: item.articleTitle || "",
		volume
	});
}
//#endregion
export { route };
