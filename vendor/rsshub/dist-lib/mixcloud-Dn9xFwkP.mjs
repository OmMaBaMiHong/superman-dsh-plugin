import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import CryptoJS from "crypto-js";
//#region lib/routes/mixcloud/config.ts
const MIXCLOUD_CONFIG = {
	host: "https://www.mixcloud.com",
	imageBaseURL: "https://thumbnailer.mixcloud.com/unsafe/480x480/",
	graphqlURL: "https://app.mixcloud.com/graphql",
	decryptionKey: "IFYOUWANTTHEARTISTSTOGETPAIDDONOTDOWNLOADFROMMIXCLOUD",
	headers: {
		Referer: "https://www.mixcloud.com",
		"Content-Type": "application/json",
		"X-Requested-With": "XMLHttpRequest"
	}
};
const TYPE_CONFIG = {
	uploads: "uploads",
	reposts: "reposted",
	favorites: "favorites",
	listens: "listeningHistory",
	stream: "stream",
	playlist: "items"
};
const TYPE_NAMES = {
	uploads: "Shows",
	reposts: "Reposts",
	favorites: "Favorites",
	listens: "History",
	stream: "Stream",
	playlist: "Playlist"
};
const CLOUDCAST_FIELDS = `
  id
  slug
  name
  description
  publishDate
  audioLength
  picture(width: 1024, height: 1024) {
    url
  }
  owner {
    displayName
    username
    url
  }
  streamInfo {
    url
    hlsUrl
    dashUrl
  }
  favorites {
    totalCount
  }
  reposts {
    totalCount
  }
  plays
  tags {
    tag {
      name
    }
  }
  featuringArtistList
  isExclusive
  restrictedReason
  comments(first: 100) {
    edges {
      node {
        comment
        created
        user {
          displayName
          username
        }
      }
    }
    totalCount
  }
`;
function getObjectFields(type) {
	if (type === "playlist") return {
		objectType: "playlist",
		objectFields: `
        name
        description
        picture {
          urlRoot
        }
        items(first: 100) {
          edges {
            node {
              cloudcast {
                ${CLOUDCAST_FIELDS}
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      `
	};
	const nodeTemplate = type === "listens" ? `node { cloudcast { ${CLOUDCAST_FIELDS} } }` : `node { ${CLOUDCAST_FIELDS} }`;
	return {
		objectType: "user",
		objectFields: `
        displayName
        biog
        picture {
          urlRoot
        }
        ${TYPE_CONFIG[type]}(first: 100) {
          edges {
            ${nodeTemplate}
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      `
	};
}
//#endregion
//#region lib/routes/mixcloud/index.ts
const route = {
	path: "/:username/:type?",
	categories: ["multimedia"],
	example: "/mixcloud/dholbach/uploads",
	parameters: {
		username: "Username, can be found in URL",
		type: "Type, see below, uploads by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["mixcloud.com/:username/:type?"] }, { source: ["www.mixcloud.com/:username/:type?"] }],
	name: "User",
	maintainers: ["Misaka13514"],
	handler,
	description: `| Shows   | Reposts | Favorites | History | Stream |
| ------- | ------- | --------- | ------- | ------ |
| uploads | reposts | favorites | listens | stream |`
};
async function callApi(objectType, objectFields, username, slug) {
	const lookupKey = objectType + "Lookup";
	const headers = MIXCLOUD_CONFIG.headers;
	const query = `{
    ${lookupKey}(lookup: {username: "${username}"${slug ? `, slug: "${slug}"` : ""}}) {
      ${objectFields}
    }
  }`;
	return (await got_default({
		method: "post",
		url: MIXCLOUD_CONFIG.graphqlURL,
		headers,
		json: { query }
	})).data.data[lookupKey];
}
function decryptXorCipher(key, ciphertext) {
	return [...CryptoJS.enc.Base64.parse(ciphertext).toString(CryptoJS.enc.Utf8)].map((ch, i) => String.fromCodePoint((ch.codePointAt(0) || 0) ^ (key.codePointAt(i % key.length) || 0))).join("");
}
function tryDecrypt(ciphertext) {
	if (!ciphertext) return "";
	try {
		return decryptXorCipher(MIXCLOUD_CONFIG.decryptionKey, ciphertext);
	} catch {
		return ciphertext;
	}
}
function getCloudcast(node, type) {
	if (type === "playlist" || type === "listens") return node.cloudcast;
	return node;
}
function getPlaylistTitle(displayName, type, playlistName) {
	if (type === "playlist" && playlistName) return `Mixcloud - ${displayName}'s Playlist: ${playlistName}`;
	return `Mixcloud - ${displayName}'s ${TYPE_NAMES[type] || type}`;
}
function getPlaylistLink(username, type, playlistSlug) {
	const host = MIXCLOUD_CONFIG.host;
	if (type === "playlist" && playlistSlug) return `${host}/${username}/playlists/${playlistSlug}/`;
	return `${host}/${username}/${type === "uploads" ? "" : type + "/"}`;
}
async function handler(ctx) {
	const username = ctx.req.param("username");
	const playlistSlug = ctx.req.param("playlist");
	const type = ctx.req.param("type") ?? (playlistSlug ? "playlist" : "uploads");
	if (!Object.hasOwn(TYPE_CONFIG, type)) throw new InvalidParameterError(`Invalid type: ${type}`);
	const { objectType, objectFields } = getObjectFields(type);
	const data = await callApi(objectType, objectFields, username, playlistSlug);
	if (!data) throw new Error(`${type === "playlist" ? "Playlist" : "User"} not found`);
	const isPlaylist = type === "playlist";
	const displayName = isPlaylist ? username : data.displayName;
	const description = isPlaylist ? data.description : data.biog;
	const picture = data.picture;
	const image = picture && picture.urlRoot ? `${MIXCLOUD_CONFIG.imageBaseURL}${picture.urlRoot}` : "";
	const items = (data[TYPE_CONFIG[type]]?.edges || []).map((edge) => {
		const cloudcast = getCloudcast(edge.node, type);
		if (!cloudcast) return null;
		const enclosureUrl = tryDecrypt((cloudcast.streamInfo || {}).url);
		const tags = cloudcast.tags?.map((t) => t.tag?.name).filter(Boolean) || [];
		let richDescription = cloudcast.description?.replaceAll("\n", "<br>") || "";
		if (cloudcast.featuringArtistList && cloudcast.featuringArtistList.length > 0) {
			const artists = cloudcast.featuringArtistList.slice(0, 5).join(", ");
			richDescription += richDescription ? "<br><br>" : "";
			richDescription += `<strong>Featured Artists:</strong> ${artists}`;
			if (cloudcast.featuringArtistList.length > 5) richDescription += ` and ${cloudcast.featuringArtistList.length - 5} more...`;
		}
		const stats = [];
		if (cloudcast.plays) stats.push(`${cloudcast.plays} plays`);
		if (cloudcast.favorites?.totalCount) stats.push(`${cloudcast.favorites.totalCount} favorites`);
		if (cloudcast.reposts?.totalCount) stats.push(`${cloudcast.reposts.totalCount} reposts`);
		if (cloudcast.comments?.totalCount) stats.push(`${cloudcast.comments.totalCount} comments`);
		if (stats.length > 0) {
			richDescription += richDescription ? "<br><br>" : "";
			richDescription += `<em>${stats.join(" • ")}</em>`;
		}
		return {
			title: cloudcast.name,
			author: cloudcast.owner?.displayName || username,
			description: richDescription,
			pubDate: parseDate(cloudcast.publishDate),
			guid: Buffer.from(cloudcast.id, "base64").toString(),
			link: `${MIXCLOUD_CONFIG.host}/${cloudcast.owner?.username || username}/${cloudcast.slug}`,
			itunes_item_image: cloudcast.picture?.url || "",
			itunes_duration: cloudcast.audioLength,
			enclosure_url: enclosureUrl,
			enclosure_type: "audio/x-m4a",
			itunes_author: cloudcast.owner?.displayName || username,
			category: tags,
			comments: cloudcast.comments?.totalCount || 0,
			upvotes: cloudcast.favorites?.totalCount || 0,
			media: enclosureUrl ? {
				content: {
					url: enclosureUrl,
					type: "audio/x-m4a",
					duration: cloudcast.audioLength
				},
				thumbnail: cloudcast.picture?.url ? { url: cloudcast.picture.url } : void 0
			} : void 0
		};
	}).filter(Boolean);
	const title = getPlaylistTitle(displayName, type, data.name);
	const link = getPlaylistLink(username, type, playlistSlug);
	return {
		title,
		description: description?.replaceAll("\n", "<br>") || "",
		itunes_author: displayName,
		image,
		link,
		item: items
	};
}
//#endregion
export { route as n, handler as t };
