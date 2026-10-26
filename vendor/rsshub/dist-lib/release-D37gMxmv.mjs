import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/app-center/release.tsx
const renderDescription = ({ releaseDate, fingerprint, appOS, minOS, deviceFamily, androidMinApiLevel, bundleId, downloadUrl, installUrl, fileExtension, sizeInMBytes, releaseNotes }) => {
	const releaseNotesHtml = releaseNotes?.trim().replaceAll("\n", "<br>");
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("b", { children: "Release Date" }),
			": ",
			releaseDate,
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("b", { children: "Fingerprint" }),
			": ",
			fingerprint,
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("b", { children: "OS" }),
			": ",
			appOS,
			/* @__PURE__ */ jsx("br", {}),
			minOS ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("b", { children: "Minimum OS Version" }),
				": ",
				minOS,
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			androidMinApiLevel ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("b", { children: "Android Minimum API Level" }),
				": ",
				androidMinApiLevel,
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			deviceFamily ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("b", { children: "Device Family" }),
				": ",
				deviceFamily,
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			bundleId ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("b", { children: "Bundle ID" }),
				": ",
				bundleId,
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			fileExtension ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("b", { children: "File Extension" }),
				": ",
				fileExtension,
				/* @__PURE__ */ jsx("br", {})
			] }) : null,
			/* @__PURE__ */ jsx("b", { children: "Size" }),
			": ",
			sizeInMBytes,
			" MB"
		] }),
		releaseNotesHtml ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "Release Notes" }), ":"] }), raw(releaseNotesHtml)] }) : null,
		/* @__PURE__ */ jsxs("p", { children: [
			"[ ",
			/* @__PURE__ */ jsx("a", {
				href: downloadUrl,
				children: "Download"
			}),
			downloadUrl === installUrl ? "" : /* @__PURE__ */ jsxs(Fragment, { children: [
				" ",
				"| ",
				/* @__PURE__ */ jsx("a", {
					href: installUrl,
					children: "Install"
				})
			] }),
			" ",
			"]"
		] })
	] }));
};
const route = {
	path: "/release/:user/:app/:distribution_group",
	categories: ["program-update"],
	example: "/app-center/release/cloudflare/1.1.1.1-windows/beta",
	parameters: {
		user: "User",
		app: "App name",
		distribution_group: "Distribution group"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group", "install.appcenter.ms/orgs/:user/apps/:app/distribution_groups/:distribution_group"] }],
	name: "Release",
	maintainers: ["Rongronggg9"],
	handler,
	description: `::: tip
The parameters can be extracted from the Release page URL: \`https://install.appcenter.ms/users/:user/apps/:app/distribution_groups/:distribution_group\`
:::`
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const app = ctx.req.param("app");
	const distribution_group = ctx.req.param("distribution_group");
	const apiUrl = `https://install.appcenter.ms/api/v0.1/apps/${user}/${app}/distribution_groups/${distribution_group}`;
	const releasesListUrl = `${apiUrl}/public_releases?scope=tester`;
	const link = `https://install.appcenter.ms/users/${user}/apps/${app}/distribution_groups/${distribution_group}`;
	let items = (await got_default(releasesListUrl)).data.map((item) => ({
		pubDate: parseDate(item.uploaded_at),
		link: `${apiUrl}/releases/${item.id}?is_install_page=true`
	}));
	const md = new markdownit();
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const releaseInfo = (await got_default(item.link)).data;
		const username = releaseInfo.owner.display_name;
		const appOS = releaseInfo.app_os;
		const shortVersion = releaseInfo.short_version;
		const versionCode = releaseInfo.version;
		const isExternalBuild = releaseInfo.is_external_build;
		const isMandatoryUpdate = releaseInfo.mandatory_update;
		const sizeInMBytes = (releaseInfo.size / (1024 * 1024)).toFixed(2);
		const releaseDate = releaseInfo.uploaded_at;
		const fingerprint = releaseInfo.fingerprint;
		const minOS = releaseInfo.min_os;
		const androidMinApiLevel = releaseInfo.android_min_api_level;
		const deviceFamily = releaseInfo.device_family;
		const bundleId = releaseInfo.bundle_identifier;
		const releaseNotes = releaseInfo.release_notes;
		const downloadUrl = releaseInfo.download_url;
		const installUrl = releaseInfo.install_url;
		const fileExtension = releaseInfo.fileExtension;
		const appName = releaseInfo.app_display_name;
		const distributionGroupId = releaseInfo.distribution_group_id;
		item._feed_title = `${appName} (${releaseInfo.distribution_groups.find((group) => group.id === distributionGroupId).display_name}) for ${appOS} by ${username} - App Center Releases`;
		item._feed_icon = releaseInfo.app_icon_url;
		const version = shortVersion && versionCode ? `${shortVersion} (${versionCode})` : shortVersion || versionCode;
		item.title = `${appName}: ` + (isMandatoryUpdate ? "[Mandatory]" : "") + (isExternalBuild ? "[External Build]" : "") + `Version ${version}`;
		item.link = link;
		item.author = username;
		item.description = renderDescription({
			releaseDate,
			sizeInMBytes,
			minOS,
			deviceFamily,
			androidMinApiLevel,
			bundleId,
			downloadUrl,
			installUrl,
			fingerprint,
			appOS,
			fileExtension,
			releaseNotes: releaseNotes && md.render(releaseNotes)
		});
		item.guid = fingerprint;
		return item;
	})));
	const icon = items && items[0]._feed_icon;
	const title = items && items[0]._feed_title;
	return {
		title,
		link,
		description: title,
		image: icon,
		item: items
	};
}
//#endregion
export { route };
