import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { JSDOM } from "jsdom";
//#region lib/routes/yamibo/utils.ts
const bbsOrigin = "https://bbs.yamibo.com";
function getDate(date) {
	return timezone(parseDate(date), 8);
}
async function fetchThread(tid, options, retry = 0) {
	const { auth, salt } = config.yamibo;
	const params = new URLSearchParams();
	params.set("mod", "viewthread");
	params.set("tid", tid);
	if (options?.ordertype) params.set("ordertype", options.ordertype);
	if (options?._dsign) params.set("_dsign", options._dsign);
	const link = `https://bbs.yamibo.com/forum.php?${params.toString()}`;
	const headers = {};
	if (auth && salt) headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
	const data = await rofetch(link, { headers });
	if (data.startsWith("<script type=\"text/javascript\">") && retry <= 3) {
		let script = data.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)[1];
		script = script.replace(/= location;|=location;/, "=fakeLocation;");
		script = script.replace("location.replace", "foo");
		script = script.replace("location.assign", "foo");
		script = script.replace(/location\[[^\]]*\]\(/, "foo(");
		script = script.replace(/location\[[^\]]*\]=/, "window.locationValue=");
		script = script.replace("location.href=", "window.locationValue=");
		script = script.replace("location=", "window.locationValue=");
		const locationValue = new JSDOM(`<script>
                function foo(value) { window.locationValue = value; };
                fakeLocation = { href: '', replace: foo, assign: foo };
                Object.defineProperty(fakeLocation, 'href', {
                    set: function (value) {
                        window.locationValue = value;
                    }
                });
                ${script}
            <\/script>`, { runScripts: "dangerously" }).window.locationValue;
		if (locationValue) {
			const _dsign = new URLSearchParams(locationValue).get("_dsign");
			if (_dsign) options = {
				...options,
				_dsign
			};
		}
		return await fetchThread(tid, options, retry + 1);
	}
	return {
		link,
		data
	};
}
function generateDescription($item, postId) {
	const content = $item.find(`#postmessage_${postId}`).parent();
	content.find("img").each((_, img) => {
		const src = img.attribs.zoomfile ?? img.attribs.src;
		img.attribs.src = `${bbsOrigin}/${src}`;
	});
	let description = content.html() ?? "";
	const images = $item.find(".pattl img").toArray();
	for (const img of images) {
		const src = img.attribs.zoomfile ?? img.attribs.src;
		description += `<img src="${bbsOrigin}/${src}" />`;
	}
	return description;
}
//#endregion
export { getDate as i, fetchThread as n, generateDescription as r, bbsOrigin as t };
