import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/layoffs/index.ts
const ROW_COUNT = 100;
const WEBSITE_URL = "https://layoffs.fyi";
const ENTRY_URL = "https://airtable.com/embed/shrqYt5kSqMzHV9R5/tbl8c8kanuNB6bPYr";
const AIRTABLE_HOST = "https://airtable.com";
/**
* getMapping can convert either an array or an object
* of a specific structure into a Map, where the key is
* the name and the value is the Id. It will only parse
* entries with 'name' and 'id' in it
*
* Inputs:
*   obj = [{name: 'Apple', id: 1}, {name: 'Peach', id: 2}]
* Returns:
*   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
*
* Inputs:
*   obj = {Apple: {name: 'Apple', id: 1}, Peach: {name: 'Peach', id: 2}}
* Returns:
*   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
*/
const getMappings = function(obj) {
	const mapping = /* @__PURE__ */ new Map();
	const reverseMapping = /* @__PURE__ */ new Map();
	for (const key in obj) {
		if (!("name" in obj[key] && "id" in obj[key])) continue;
		reverseMapping.set(obj[key].name, obj[key].id);
		mapping.set(obj[key].id, obj[key].name);
	}
	return [mapping, reverseMapping];
};
const route = {
	path: "/",
	radar: [{
		source: ["layoffs.fyi/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["BrandNewLifeJackie26"],
	handler,
	url: "layoffs.fyi/"
};
async function handler() {
	const headers = {
		"x-airtable-application-id": "app1PaujS9zxVGUZ4",
		"x-airtable-inter-service-client": "webClient",
		"x-requested-with": "XMLHttpRequest",
		"x-time-zone": "America/Los_Angeles"
	};
	let dataSourceUrl = await cache_default.get(ENTRY_URL);
	let cacheInvalid = false;
	let response;
	if (dataSourceUrl) try {
		response = await got_default({
			method: "get",
			url: dataSourceUrl,
			headers
		});
		if (response.statusCode >= 400) cacheInvalid = true;
	} catch {
		cacheInvalid = true;
	}
	else cacheInvalid = true;
	if (cacheInvalid) {
		const $ = load((await got_default({
			method: "get",
			url: ENTRY_URL
		})).data);
		dataSourceUrl = AIRTABLE_HOST + $("script").text().match(/urlWithParams: "(.*?)"/)[1].replaceAll(String.raw`\u002F`, "/");
		cache_default.set(ENTRY_URL, dataSourceUrl);
		response = await got_default({
			method: "get",
			url: dataSourceUrl,
			headers
		});
	}
	const table = response.data.data.table;
	const columnReverseMapping = getMappings(table.columns)[1];
	const companyColumnId = columnReverseMapping.get("Company");
	const dateAddedColumnId = columnReverseMapping.get("Date Added");
	const numOfLaidOffColumnId = columnReverseMapping.get("# Laid Off");
	const sourceColumnId = columnReverseMapping.get("Source");
	const countryColumnId = columnReverseMapping.get("Country");
	const countryMapping = getMappings(table.columns.find((col) => col.name === "Country").typeOptions.choices)[0];
	const rows = table.rows.slice(0, ROW_COUNT);
	return {
		title: "Tech layoff data feed from layoffs.fyi",
		link: WEBSITE_URL,
		description: "This feed gets tech layoff data from layoffs.fyi and display them in a user friendly way",
		item: rows.map((row) => {
			const rowContent = row.cellValuesByColumnId;
			const company = rowContent[companyColumnId];
			const dateAdded = parseDate(rowContent[dateAddedColumnId]);
			const source = rowContent[sourceColumnId];
			const numOfLaidOff = rowContent[numOfLaidOffColumnId] || "some";
			const country = countryMapping.get(rowContent[countryColumnId]);
			return {
				title: `${company} Layoffs Happening!`,
				description: `${company} lays off ${numOfLaidOff} employees in ${country}. For more details, please visit ${source}.`,
				pubDate: dateAdded,
				link: source
			};
		})
	};
}
//#endregion
export { route };
