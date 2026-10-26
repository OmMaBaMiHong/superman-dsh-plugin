import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sciencedirect/call-for-paper.tsx
const route = {
	path: "/call-for-paper/:subject",
	categories: ["journal"],
	example: "/sciencedirect/call-for-paper/education",
	parameters: { subject: "学科分类，例如“education”" },
	radar: [{ source: ["sciencedirect.com"] }],
	name: "Call for Papers",
	maintainers: ["etShaw-zh"],
	handler,
	url: "sciencedirect.com/browse/calls-for-papers",
	description: "`sciencedirect.com/browse/calls-for-papers?subject=education` -> `/sciencedirect/call-for-paper/education`"
};
async function handler(ctx) {
	const { subject = "" } = ctx.req.param();
	const apiUrl = `https://www.sciencedirect.com/browse/calls-for-papers?subject=${subject}`;
	const scriptJSON = load((await got_default(apiUrl)).body)("script[data-iso-key=\"_0\"]").text();
	if (!scriptJSON) throw new Error("Cannot find the script with data-iso-key=\"_0\"");
	let data;
	try {
		data = JSON.parse(JSON.parse(scriptJSON));
	} catch (error) {
		throw new Error(`Failed to parse embedded script JSON: ${error.message}`, { cause: error });
	}
	const cfpList = data?.callsForPapers?.list || [];
	if (!cfpList.length) throw new Error("No Calls for Papers found");
	const items = cfpList.map((cfp) => {
		const link = `https://www.sciencedirect.com/special-issue/${cfp.contentId}/${cfp.url}`;
		const description = renderToString(/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("strong", { children: "Summary:" }),
				" ",
				cfp.summary
			] }),
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("strong", { children: "Submission Deadline:" }),
				" ",
				cfp.submissionDeadline
			] }),
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("strong", { children: "Journal:" }),
				" ",
				`${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor}, CiteScore: ${cfp.journal.citeScore})`
			] })
		] }));
		return {
			title: cfp.title,
			author: `${cfp.journal.displayName} (IF: ${cfp.journal.impactFactor})`,
			link,
			description,
			pubDate: cfp.submissionDeadline || ""
		};
	});
	return {
		title: `ScienceDirect Calls for Papers - ${subject}`,
		link: apiUrl,
		description: `Calls for Papers on ScienceDirect for subject: ${subject}`,
		item: items
	};
}
//#endregion
export { route };
