import { describe, expect, it } from "vitest";
import { getPosts, getSites, getTags } from "./index";

const sites = getSites().map((site) => site.value);

describe("Booru Providers", () => {
	sites.forEach((site) => {
		it(`should return posts from ${site} and check hasNextPage`, async () => {
			const result = await getPosts({
				site,
				tags: "", // Using empty tags to get broad results, increasing likelihood of a next page
				limit: 1, // Small limit to ensure there's likely a next page
				page: 0, // Start from the first page
			});
			expect(result.posts.length).toBeGreaterThan(0);
			expect(typeof result.hasNextPage).toBe("function");

			const hasNext = await result.hasNextPage();
			expect(typeof hasNext).toBe("boolean");

			// Existing post assertions
			const post = result.posts[0];
			expect(post.createdAt).toBeDefined();
			expect(typeof post.createdAt).toBe("string");
			expect(post.createdAt).toMatch(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
			);
		});

		// Specific test for Gelbooru hasNextPage returning false
		if (site === "gelbooru") {
			it("should correctly determine no next page for Gelbooru with a specific query (id:1)", async () => {
				const result = await getPosts({
					site: "gelbooru",
					tags: "id:1", // Query for a single, specific post
					limit: 10, // Limit high enough to get all (i.e., the one) post
					page: 0,
				});

				// Expect exactly one post for id:1
				expect(result.posts.length).toBe(1);
				expect(typeof result.hasNextPage).toBe("function");

				const hasNext = await result.hasNextPage();
				// Since we fetched the specific post by ID and limit is > 1,
				// and assuming Gelbooru's id:1 query returns only 1 post,
				// there should be no next page.
				expect(hasNext).toBe(false);
			});

			// Test case for when Gelbooru *should* have a next page
			it("should correctly determine a next page for Gelbooru with a general query", async () => {
				const result = await getPosts({
					site: "gelbooru",
					tags: "cat", // A common tag likely to have many results
					limit: 1, // Very small limit
					page: 0, // First page
				});

				expect(result.posts.length).toBe(1); // Ensure we got a post
				expect(typeof result.hasNextPage).toBe("function");

				const hasNext = await result.hasNextPage();
				// With 'cat' and limit 1, it's highly probable there's a next page.
				expect(hasNext).toBe(true);
			});
		}

		it(`should return tags from ${site}`, async () => {
			const tags = await getTags({
				site,
				query: "land",
			});
			expect(tags.length).toBeGreaterThan(0);
		});

		it(`should get tags from a post from ${site}`, async () => {
			const result = await getPosts({
				site,
				tags: "",
				limit: 1,
				page: 1,
			});
			const post = result.posts[0];
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
