import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
import { APIErrorCode, Client, isNotionClientError } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
//#region lib/routes/notion/database.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/database/:databaseId",
	categories: ["other"],
	example: "/notion/database/a7cc133b68454f138011f1530a13531e",
	parameters: { databaseId: "Database ID" },
	features: {
		requireConfig: [{
			name: "NOTION_TOKEN",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["notion.so/:id"],
		target: "/database/:id"
	}],
	name: "Database",
	maintainers: ["curly210102"],
	handler,
	description: `There is an optional query parameter called \`properties=\` that can be used to customize field mapping. There are three built-in fields: author, pubTime and link, which can be used to add additional information.

For example, if you have set up three properties in your database - "Publish Time", "Author", and "Original Article Link" - then execute the following JavaScript code to get the result for the properties parameter.

\`\`\`js
encodeURIComponent(JSON.stringify({"pubTime": "Publish Time", "author": "Author", "link": "Original Article Link"}))
\`\`\`

There is an optional query parameter called \`query=\` that can be used to customize the search rules for your database, such as custom sorting and filtering rules.

please refer to the [Notion API documentation](https://developers.notion.com/reference/post-database-query) and execute \`encodeURIComponent(JSON.stringify(custom rules))\` to provide the query parameter.`
};
async function handler(ctx) {
	if (!config.notion.key) throw new ConfigNotFoundError("Notion RSS is disabled due to the lack of NOTION_TOKEN(<a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>)");
	const databaseId = ctx.req.param("databaseId");
	const notion_api_key = config.notion.key;
	const notion = new Client({ auth: notion_api_key });
	try {
		const database = await notion.databases.retrieve({ database_id: databaseId });
		const title = database.title[0]?.plain_text;
		const description = database.description[0]?.plain_text;
		const link = database.url;
		const image = database.cover?.external.url ?? database.icon?.emoji;
		const databaseQuery = parseCustomQuery(ctx.req.query("query"));
		const { results } = await notion.databases.query({
			database_id: databaseId,
			...databaseQuery
		});
		const customProperties = parseCustomQuery(ctx.req.query("properties")) ?? {};
		const properties = {
			author: customProperties.author ?? "Author",
			link: customProperties.link ?? "URL",
			pubTime: customProperties.pubTime ?? "Created time"
		};
		const n2m = new NotionToMarkdown({ notionClient: notion });
		const pageList = results.filter((item) => Object.values(item.properties).find((property) => property.id === "title")?.title[0]?.plain_text);
		const items = await Promise.all(pageList.map(async (page) => {
			const titleProperty = Object.values(page.properties).find((property) => property.id === "title");
			const pageTitle = titleProperty.title[0].plain_text;
			const pageLink = page.url;
			const pageLastEditedTime = page.last_edited_time;
			const articleLink = properties.link && notionText(page.properties[properties.link]) || titleProperty.title[0].href || "";
			const pageAuthor = notionText(page.properties[properties.author]);
			const pagePubTime = notionText(page.properties[properties.pubTime]);
			const articleContent = await cache_default.tryGet(`${pageLink}-${pageLastEditedTime}`, async () => {
				const mdblocks = await n2m.pageToMarkdown(page.id);
				return n2m.toMarkdownString(mdblocks).parent;
			});
			let author = pageAuthor;
			let pubTime = pagePubTime || pageLastEditedTime;
			if (articleLink && !pageAuthor) {
				const { articleAuthor, articlePubTime } = await cache_default.tryGet(`${pageLink}-${articleLink}`, async () => {
					try {
						const $ = load((await got_default({
							method: "get",
							url: articleLink
						})).body);
						return {
							articleAuthor: $("meta[name=\"author\"]").attr("content"),
							articlePubTime: $("meta[name=\"publish_date\"], meta[name=\"date\"]").attr("content")
						};
					} catch {
						return {};
					}
				});
				if (articleAuthor) author = articleAuthor;
				if (articlePubTime) pubTime = articlePubTime;
			}
			return {
				title: pageTitle,
				author,
				pubDate: parseDate(pubTime),
				description: md.render(articleContent ?? ""),
				link: articleLink || pageLink
			};
		}));
		return {
			title: `Notion - ${title}`,
			link,
			description,
			image,
			item: items,
			allowEmpty: true
		};
	} catch (error) {
		logger.error(error);
		if (isNotionClientError(error)) {
			if (error.statusCode === APIErrorCode.ObjectNotFound) throw new InvalidParameterError("The database is not exist");
			if (error.statusCode === APIErrorCode.Unauthorized) throw new ConfigNotFoundError("Please check the config of NOTION_TOKEN");
			ctx.throw(error.statusCode, "Notion API Error");
		} else ctx.throw(error);
	}
}
function parseCustomQuery(queryString) {
	try {
		if (queryString) return JSON.parse(decodeURIComponent(queryString));
	} catch {
		logger.error("Query Parse Error");
	}
}
function notionText(property) {
	if (!property) return "";
	if (property.type === "rich_text") return property.rich_text?.map((text) => text.plain_text).join("") ?? "";
	if (property.type === "select") return property.select.name;
	if (property.type === "url") return property.url;
	return "";
}
//#endregion
export { route };
