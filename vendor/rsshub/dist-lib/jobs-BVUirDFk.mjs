import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hiring.cafe/jobs.tsx
const CONFIG = {
	DEFAULT_PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100
};
const API = {
	BASE_URL: "https://hiring.cafe/api/search-jobs",
	HEADERS: { "Content-Type": "application/json" }
};
const validateSearchParams = ({ keywords, page = 0, size = CONFIG.DEFAULT_PAGE_SIZE }) => {
	const normalizedSize = Math.floor(Number(size));
	return {
		keywords: keywords.trim(),
		page: Math.max(0, Math.floor(Number(page))),
		size: Math.min(Math.max(1, normalizedSize), CONFIG.MAX_PAGE_SIZE)
	};
};
const fetchJobs = async (searchParams) => {
	const payload = {
		size: searchParams.size || 20,
		page: searchParams.page || 0,
		searchState: {
			searchQuery: searchParams.keywords,
			sortBy: searchParams.sortBy || "date"
		}
	};
	return await rofetch(API.BASE_URL, {
		method: "POST",
		body: payload,
		headers: API.HEADERS
	});
};
const renderJobDescription = (jobInfo, processedData) => {
	const isCompensationTransparent = Boolean(processedData.is_compensation_transparent && processedData.yearly_min_compensation && processedData.yearly_max_compensation);
	const companyInfoDescription = jobInfo.company_info_description;
	const hasCompanyInfo = Boolean(companyInfoDescription);
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("strong", { children: "Company:" }),
			" ",
			processedData.company_name
		] }),
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("strong", { children: "Location:" }),
			" ",
			processedData.formatted_workplace_location ?? "Remote/Unspecified"
		] }),
		isCompensationTransparent ? /* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("strong", { children: "Compensation:" }),
			" $",
			processedData.yearly_min_compensation?.toLocaleString(),
			" - $",
			processedData.yearly_max_compensation?.toLocaleString(),
			" per year"
		] }) : null,
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("strong", { children: "Workplace Type:" }),
			" ",
			processedData.workplace_type ?? "Not specified"
		] }),
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("strong", { children: "Requirements:" }),
			" ",
			processedData.requirements_summary ?? "No requirements specified"
		] }),
		/* @__PURE__ */ jsx("div", {
			class: "job-description",
			children: jobInfo.description ? raw(jobInfo.description) : null
		}),
		hasCompanyInfo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("h2", { children: ["About ", processedData.company_name] }), raw(companyInfoDescription)] }) : null
	] }));
};
const transformJobItem = (item) => {
	const { job_information: jobInfo, v5_processed_job_data: processedData, apply_url, id } = item;
	return {
		title: `${jobInfo.title} - ${processedData.company_name}`,
		description: renderJobDescription(jobInfo, processedData),
		link: apply_url,
		pubDate: new Date(processedData.estimated_publish_date_millis).toUTCString(),
		category: [
			processedData.job_category,
			...processedData.role_activities,
			processedData.workplace_type
		].filter((x) => !!x),
		author: processedData.company_name,
		guid: id
	};
};
async function handler(ctx) {
	const searchParams = validateSearchParams({ keywords: ctx.req.param("keywords") });
	const response = await fetchJobs(searchParams);
	const items = response.results.map((item) => transformJobItem(item));
	return {
		title: `HiringCafe Jobs: ${searchParams.keywords}`,
		description: `Job search results for "${searchParams.keywords}" on HiringCafe`,
		link: `https://hiring.cafe/jobs?q=${encodeURIComponent(searchParams.keywords)}`,
		item: items,
		total: response.total
	};
}
const route = {
	path: "/jobs/:keywords",
	categories: ["other"],
	example: "/hiring.cafe/jobs/sustainability",
	parameters: { keywords: "Keywords to search for" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hiring.cafe"] }],
	name: "Jobs",
	maintainers: ["mintyfrankie"],
	handler
};
//#endregion
export { route };
