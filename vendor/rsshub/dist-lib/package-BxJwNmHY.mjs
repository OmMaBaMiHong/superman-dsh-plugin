import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/npm/package.tsx
const route = {
	path: "/package/:name{(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*}",
	name: "Package",
	maintainers: ["Fatpandac"],
	categories: ["program-update"],
	example: "/npm/package/rsshub",
	radar: [{ source: ["www.npmjs.com/package/:name"] }],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const packageDownloadLastMonthAPI = `https://api.npmjs.org/downloads/point/last-month/${name}`;
	const packageDownloadLastWeekAPI = `https://api.npmjs.org/downloads/point/last-week/${name}`;
	const packageDownloadLastDayAPI = `https://api.npmjs.org/downloads/point/last-day/${name}`;
	const packageVersionAPI = `https://registry.npmjs.org/${name}`;
	const downloadCountLastMonthRes = await rofetch(packageDownloadLastMonthAPI);
	const downloadCountLastWeekRes = await rofetch(packageDownloadLastWeekAPI);
	const downloadCountLastDayRes = await rofetch(packageDownloadLastDayAPI);
	const packageVersion = (await rofetch(packageVersionAPI)).time;
	const packageVersionList = Object.entries(packageVersion).map(([key, value]) => ({
		version: key,
		time: value
	})).toReversed();
	return {
		title: `${name} - npm`,
		link: `https://www.npmjs.com/package/${name}`,
		description: `${name} - npm`,
		item: [{
			title: `${name} - npm`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h3", { children: "Download" }),
				/* @__PURE__ */ jsxs("p", { children: ["Last Day: ", downloadCountLastDayRes.downloads] }),
				/* @__PURE__ */ jsxs("p", { children: ["Last week: ", downloadCountLastWeekRes.downloads] }),
				/* @__PURE__ */ jsxs("p", { children: ["Last month: ", downloadCountLastMonthRes.downloads] }),
				/* @__PURE__ */ jsx("hr", {}),
				/* @__PURE__ */ jsx("h3", { children: "Version" }),
				packageVersionList.map((version) => /* @__PURE__ */ jsxs("p", { children: [
					version.version,
					": ",
					version.time
				] }))
			] })),
			link: `https://www.npmjs.com/package/${name}`,
			guid: `https://www.npmjs.com/package/${name}${packageVersion.modified}`
		}]
	};
}
//#endregion
export { route };
