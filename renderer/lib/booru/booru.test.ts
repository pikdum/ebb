import { describe, expect, it } from "vitest";
import { getPosts, getSites, getTags } from "./index";

const sites = getSites().map((site) => site.value);

describe("Booru Providers", () => {
	sites.forEach((site) => {
		it(`should return tags from ${site}`, async () => {
			const tags = await getTags({
				site,
				query: "land",
			});
			expect(tags.length).toBeGreaterThan(0);
		});

		it(`should return posts from ${site}`, async () => {
			if (site === "gelbooru") return; // skip, since they're blocking

			const result = await getPosts({
				site,
				tags: "",
				limit: 1,
				page: 1,
			});
			expect(result.posts.length).toBeGreaterThan(0);

			const post = result.posts[0];
			expect(post.createdAt).toBeDefined();
			expect(typeof post.createdAt).toBe("string");
			expect(post.createdAt).toMatch(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
			);

			if (typeof post.getTagGroups === "function") {
				const tagGroups = await post.getTagGroups();
				expect(tagGroups).toBeDefined();
				expect(tagGroups).toBeInstanceOf(Object);
				expect(Object.keys(tagGroups).length).toBeGreaterThan(0);
				for (const [_group, tags] of Object.entries(tagGroups)) {
					expect(Array.isArray(tags)).toBe(true);
				}
			} else {
				expect(Array.isArray(post.tags)).toBe(true);
				expect(post.tags.length).toBeGreaterThan(0);
			}
		});
	});
});
