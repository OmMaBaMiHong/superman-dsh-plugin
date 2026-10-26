import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { load } from "cheerio";
//#region lib/routes/azul/packages.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.azul.com";
	const apiBaseUrl = "https://api.azul.com";
	const targetUrl = new URL("downloads", baseUrl).href;
	const apiUrl = new URL("metadata/v1/zulu/packages", apiBaseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = (await rofetch(apiUrl, { query: {
		availability_types: "ca",
		release_status: "both",
		page_size: 1e3,
		include_fields: "java_package_features, release_status, support_term, os, arch, hw_bitness, abi, java_package_type, javafx_bundled, sha256_hash, cpu_gen, size, archive_type, certifications, lib_c_type, crac_supported",
		page: 1,
		azul_com: true
	} })).slice(0, limit).map((item) => {
		const title = `[${`${item.java_version.join(".")}+${item.openjdk_build_number}`}] (${item.distro_version.join(".")}) ${item.name}`;
		const linkUrl = item.download_url;
		const categories = [
			item.os,
			item.arch,
			item.java_package_type,
			item.archive_type,
			item.abi,
			...item.javafx_bundled ? ["javafx"] : [],
			...item.crac_supported ? ["crac"] : []
		];
		const guid = `azul-${item.name}`;
		let processedItem = {
			title,
			link: linkUrl,
			category: categories,
			guid,
			id: guid,
			language
		};
		const enclosureUrl = item.download_url;
		if (enclosureUrl) {
			const enclosureTitle = item.name;
			const enclosureLength = item.size;
			processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_title: enclosureTitle || title,
				enclosure_length: enclosureLength
			};
		}
		return processedItem;
	});
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/downloads",
	name: "Downloads",
	url: "www.azul.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/azul/downloads",
	parameters: void 0,
	description: void 0,
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.azul.com/downloads"],
		target: "/downloads"
	}],
	view: 5
};
//#endregion
export { handler, route };
