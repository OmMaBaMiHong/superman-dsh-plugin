import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/patreon/render-content-json.tsx
const TextNode = ({ node }) => {
	let content = node.text ?? "";
	const marks = node.marks ?? [];
	for (const mark of marks) if (mark.type === "bold") content = /* @__PURE__ */ jsx("strong", { children: content });
	else if (mark.type === "link" && mark.attrs?.href) content = /* @__PURE__ */ jsx("a", {
		href: String(mark.attrs.href),
		children: content
	});
	return /* @__PURE__ */ jsx(Fragment, { children: content });
};
const ContentNode = ({ node }) => {
	switch (node.type) {
		case "doc": return /* @__PURE__ */ jsx(Fragment, { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "paragraph": return /* @__PURE__ */ jsx("p", { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "text": return /* @__PURE__ */ jsx(TextNode, { node });
		case "hardBreak": return /* @__PURE__ */ jsx("br", {});
		case "heading": return /* @__PURE__ */ jsx(`h${Math.min(6, Math.max(1, Number(node.attrs?.level) || 3))}`, { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "image": return node.attrs?.src ? /* @__PURE__ */ jsx("img", {
			src: String(node.attrs.src),
			alt: String(node.attrs.alt ?? "")
		}) : null;
		case "bulletList": return /* @__PURE__ */ jsx("ul", { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "orderedList": return /* @__PURE__ */ jsx("ol", { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "listItem": return /* @__PURE__ */ jsx("li", { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
		case "horizontalRule": return /* @__PURE__ */ jsx("hr", {});
		default: return /* @__PURE__ */ jsx(Fragment, { children: node.content?.map((child, index) => /* @__PURE__ */ jsx(ContentNode, { node: child }, index)) });
	}
};
const renderContentJson = (jsonString) => {
	if (!jsonString) return "";
	const doc = JSON.parse(jsonString);
	return renderToString(/* @__PURE__ */ jsx(ContentNode, { node: doc }));
};
//#endregion
//#region lib/routes/patreon/feed.tsx
const renderDescription = ({ attributes, relationships, included }) => {
	const postType = attributes.post_type;
	const imageOrder = attributes.post_metadata?.image_order ?? [];
	const previewImage = attributes.image?.url ?? attributes.meta_image_url;
	const audioUrl = relationships.audio?.attributes?.download_url || relationships.audio_preview?.attributes?.download_url;
	const imageItems = imageOrder.map((mediaIdStr) => included.find((item) => item.id === mediaIdStr)).filter(Boolean);
	const textContent = renderContentJson(attributes.content_json_string) || renderContentJson(attributes.teaser_text_json_string);
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		postType === "image_file" ? /* @__PURE__ */ jsx(Fragment, { children: imageItems.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
			src: image.attributes.image_urls.original,
			alt: image.attributes.file_name
		}), /* @__PURE__ */ jsx("br", {})] })) }) : postType === "video_external_file" ? attributes.video_preview ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("video", {
			controls: true,
			preload: "metadata",
			poster: attributes.image?.url,
			children: /* @__PURE__ */ jsx("source", {
				src: relationships.video_preview?.attributes?.download_url,
				type: "video/mp4"
			})
		}), /* @__PURE__ */ jsx("br", {})] }) : null : postType === "audio_file" || postType === "podcast" ? /* @__PURE__ */ jsxs(Fragment, { children: [attributes.thumbnail?.url ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: attributes.thumbnail.url }), /* @__PURE__ */ jsx("br", {})] }) : null, audioUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("audio", {
			controls: true,
			preload: "metadata",
			children: /* @__PURE__ */ jsx("source", {
				src: audioUrl,
				type: "audio/mpeg"
			})
		}), /* @__PURE__ */ jsx("br", {})] }) : null] }) : postType === "video_embed" || postType === "link" ? previewImage ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: previewImage }), /* @__PURE__ */ jsx("br", {})] }) : null : postType === "text_only" ? null : /* @__PURE__ */ jsxs(Fragment, { children: [
			"Post type: \"",
			postType,
			"\" is not supported.",
			/* @__PURE__ */ jsx("br", {})
		] }),
		textContent ? raw(textContent) : null,
		relationships.attachments_media?.length ? relationships.attachments_media.map((media) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
			href: media.attributes.download_url,
			children: media.attributes.file_name
		}), /* @__PURE__ */ jsx("br", {})] })) : null
	] }));
};
const route = {
	path: "/:creator",
	categories: ["new-media"],
	example: "/patreon/straightupsisters",
	parameters: { creator: "Patreon creator id, can be found in the url" },
	features: {
		requireConfig: [{
			name: "PATREON_SESSION_ID",
			optional: true,
			description: "The value of the session_id cookie after logging in to Patreon, required to access paid posts"
		}],
		nsfw: true
	},
	radar: [{ source: ["patreon.com/:creator", "www.patreon.com/cw/:creator"] }],
	name: "Home",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { creator } = ctx.req.param();
	const baseUrl = "https://www.patreon.com";
	const link = `${baseUrl}/${creator}`;
	const creatorData = await cache_default.tryGet(`patreon:creator:${creator}`, async () => {
		const response = await rofetch(link);
		const $ = cheerio.load(response);
		if ($("meta[property=\"og:url\"]").attr("content")?.startsWith(`${baseUrl}/cw/`)) {
			const ogImage = $("meta[property=\"og:image\"]").attr("content");
			const creatorId = decodeURIComponent(ogImage || "").match(/card-teaser-image\/creator\/(\d+)/)?.[1];
			if (creatorId) return {
				id: creatorId,
				attributes: (await rofetch(`${baseUrl}/api/campaigns/${creatorId}`)).data.attributes
			};
			throw new Error("Unable to extract creator ID");
		}
		const bootstrapEnvelope = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps.bootstrapEnvelope;
		return {
			id: bootstrapEnvelope.pageBootstrap.campaign.data.id,
			attributes: bootstrapEnvelope.pageBootstrap.campaign.data.attributes
		};
	});
	if (!creatorData.id) throw new Error("Creator not found");
	let headers = {};
	if (config.patreon?.sessionId) headers = { Cookie: `session_id=${config.patreon.sessionId}` };
	const posts = await rofetch("https://www.patreon.com/api/posts", {
		headers,
		query: {
			include: "campaign,access_rules,access_rules.tier.null,attachments_media,audio,audio_preview.null,drop,images,media,native_video_insights,poll.choices,poll.current_user_responses.user,poll.current_user_responses.choice,poll.current_user_responses.poll,user,user_defined_tags,ti_checks,video.null,content_unlock_options.product_variant.null",
			"fields[campaign]": "currency,show_audio_post_download_links,avatar_photo_url,avatar_photo_image_urls,earnings_visibility,is_nsfw,is_monthly,name,url",
			"fields[post]": "change_visibility_at,comment_count,commenter_count,content_json_string,created_at,current_user_can_comment,current_user_can_delete,current_user_can_report,current_user_can_view,current_user_comment_disallowed_reason,current_user_has_liked,embed,image,insights_last_updated_at,is_paid,like_count,meta_image_url,min_cents_pledged_to_view,monetization_ineligibility_reason,post_file,post_metadata,published_at,patreon_url,post_type,pledge_url,preview_asset_type,thumbnail,thumbnail_url,teaser_text_json_string,title,upgrade_url,url,was_posted_by_campaign_owner,has_ti_violation,moderation_status,post_level_suspension_removal_date,pls_one_liners_by_category,video,video_preview,view_count,content_unlock_options,is_new_to_current_user,watch_state",
			"fields[post_tag]": "tag_type,value",
			"fields[user]": "image_url,full_name,url",
			"fields[access_rule]": "access_rule_type,amount_cents",
			"fields[media]": "id,image_urls,display,download_url,metadata,file_name",
			"fields[native_video_insights]": "average_view_duration,average_view_pct,has_preview,id,last_updated_at,num_views,preview_views,video_duration",
			"fields[content-unlock-option]": "content_unlock_type",
			"fields[product-variant]": "price_cents,currency_code,checkout_url,is_hidden,published_at_datetime,content_type,orders_count,access_metadata",
			"filter[campaign_id]": creatorData.id,
			"filter[contains_exclusive_posts]": true,
			"filter[is_draft]": false,
			sort: "-published_at",
			"json-api-use-default-includes": false,
			"json-api-version": "1.0"
		}
	});
	const items = posts.data.map(({ attributes, relationships }) => {
		for (const [key, value] of Object.entries(relationships)) if (value.data) relationships[key] = Array.isArray(value.data) ? value.data.map((item) => posts.included.find((i) => i.id === item.id)) : posts.included.find((i) => i.id === value.data.id);
		if (attributes.video_preview) relationships.video_preview = posts.included.find((i) => Number.parseInt(i.id) === attributes.video_preview?.media_id);
		return {
			title: attributes.title,
			description: renderDescription({
				attributes,
				relationships,
				included: posts.included
			}),
			link: attributes.url,
			pubDate: parseDate(attributes.published_at),
			image: attributes.thumbnail?.url ?? attributes.image?.url,
			category: relationships.user_defined_tags?.map((tag) => tag.attributes.value)
		};
	});
	return {
		title: creatorData.attributes.name,
		description: creatorData.attributes.creation_name,
		link,
		image: creatorData.attributes.avatar_photo_image_urls?.thumbnail_large || creatorData.attributes.avatar_photo_image_urls?.thumbnail || creatorData.attributes.avatar_photo_image_urls?.original || creatorData.attributes.avatar_photo_url,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
