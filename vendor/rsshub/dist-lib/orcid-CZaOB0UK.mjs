import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/orcid/index.tsx
const route = {
	path: "/:id",
	categories: ["study"],
	example: "/orcid/0000-0002-4731-9700",
	parameters: { id: "Open Researcher and Contributor ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Works List",
	maintainers: ["OrangeEd1t"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const currentUrl = `https://orcid.org/${id}/worksPage.json?offset=0&sort=date&sortAsc=false&pageSize=20`;
	const items = (await got_default(currentUrl)).data.groups;
	const works = [];
	for (const item of items) for (const work of item.works) works.push(work);
	const out = works.map((work) => {
		let Str = "";
		for (const identifier of work.workExternalIdentifiers) Str += identifier.url ? "<a href=\"" + identifier.url.value + "\">" + identifier.externalIdentifierType.value + ": " + identifier.externalIdentifierId.value + "</a><br>" : identifier.externalIdentifierType.value + ": " + identifier.externalIdentifierId.value + "<br>";
		return {
			title: work.title.value,
			link: work.url,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h2", { children: work.title.value }),
				work.journalTitle?.value ? /* @__PURE__ */ jsx("h3", { children: work.journalTitle.value }) : null,
				/* @__PURE__ */ jsxs("span", { children: [
					[
						work.publicationDate?.year,
						work.publicationDate?.month,
						work.publicationDate?.day
					].filter(Boolean).join("-"),
					" | ",
					work.workType.value
				] }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("span", { children: raw(Str) }),
				/* @__PURE__ */ jsxs("span", { children: ["Source: ", work.sourceName] })
			] })),
			guid: work.putCode.value
		};
	});
	return {
		title: "ORCID Works List" + id,
		link: currentUrl,
		item: out
	};
}
//#endregion
export { route };
