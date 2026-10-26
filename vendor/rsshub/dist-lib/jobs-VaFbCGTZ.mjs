import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lmu/jobs.tsx
const apiUrl = "https://jobs.b-ite.com/api/v1/postings/search";
function findLabel(value, options) {
	return options.find((option) => option.value === value)?.label ?? value;
}
async function handler() {
	const { data: response } = await got_default.post(apiUrl, {
		json: {
			key: "7d4ebad4ecdfd3e99a89596c85c5e4be21cd9c12",
			channel: 0,
			locale: "en",
			sort: {
				by: "custom.bereich",
				order: "asc"
			},
			origin: "https://www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/",
			page: {
				offset: 0,
				num: 1e3
			},
			filter: {
				locale: { in: ["en"] },
				"custom.beschaeftigtengruppe": { in: ["02_wiss"] }
			}
		},
		headers: {
			"content-type": "application/json",
			"bite-jobsapi-client": "v5-20230925-9df79de"
		}
	});
	const jobPostings = response.jobPostings;
	const bereichOptions = response.fields["custom.bereich"].options;
	const verguetungOptions = response.fields["custom.verguetung"].options;
	return {
		title: "LMU Academic Staff Job Openings",
		link: "https://www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/",
		item: jobPostings.map((job) => {
			const pubDate = parseDate(job.createdOn, "YYYY-MM-DDTHH:mm:ssZ");
			const institutionLabel = findLabel(job.custom.bereich, bereichOptions);
			const RemunerationGroupLabel = findLabel(job.custom.verguetung, verguetungOptions);
			const description = renderDescription(institutionLabel, RemunerationGroupLabel, job);
			return {
				title: job.title,
				link: job.url,
				description,
				pubDate
			};
		})
	};
}
const renderDescription = (institutionLabel, RemunerationGroupLabel, job) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("strong", { children: "Institution:" }),
		" ",
		institutionLabel
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("strong", { children: "Remuneration:" }),
		" ",
		RemunerationGroupLabel
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("strong", { children: "Application deadline:" }),
		" ",
		job.endsOn
	] }),
	/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Job Details:" }) }),
	/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "About us:" }) }),
	job.custom?.das_sind_wir || "",
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Your qualifications:" }) }),
	job.custom?.das_sind_sie || "",
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: "Benefits:" }) }),
	job.custom?.das_ist_unser_angebot || "",
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("strong", { children: "Contact:" }),
		" ",
		job.custom?.kontakt || ""
	] })
] }));
const route = {
	path: "/jobs",
	name: "Job Openings",
	url: "lmu.de",
	example: "/lmu/jobs",
	maintainers: ["StarDxxx"],
	categories: ["university", "study"],
	radar: [{
		source: ["www.lmu.de/en/about-lmu/working-at-lmu/job-portal/academic-staff/"],
		target: "/lmu/jobs"
	}],
	description: "RSS feed for LMU academic staff job openings.",
	handler
};
//#endregion
export { route };
