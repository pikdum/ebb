import { describe, it, expect } from "vitest";
import { Danbooru } from "./danbooru"; // Assuming Danbooru class is exported
import type { BooruPost } from "./index";

describe("Danbooru Connector", () => {
	describe("transformPostData", () => {
		it("should correctly transform raw post data and include postView URL", async () => {
			const mockRawPosts = [
				{
					id: 12345,
					image_width: 800,
					image_height: 1200,
					tag_string: "tag1 tag2 artist:some_artist copyright:some_copyright character:some_character",
					file_url: "https://danbooru.donmai.us/data/sample/sample-12345.jpg",
					large_file_url: "https://danbooru.donmai.us/data/sample/sample-12345.jpg",
					preview_file_url: "https://danbooru.donmai.us/data/preview/preview-12345.jpg",
					rating: "g",
					tag_string_general: "tag1 tag2",
					tag_string_character: "some_character",
					tag_string_copyright: "some_copyright",
					tag_string_artist: "some_artist",
					tag_string_meta: "meta_tag",
					created_at: "2023-01-15T10:30:00.000Z",
				},
				{
					id: 67890,
					image_width: 1024,
					image_height: 768,
					tag_string: "another_tag solo",
					file_url: "https://danbooru.donmai.us/data/sample/sample-67890.png",
					large_file_url: "https://danbooru.donmai.us/data/sample/sample-67890.png",
					preview_file_url: "https://danbooru.donmai.us/data/preview/preview-67890.jpg",
					rating: "s",
					tag_string_general: "another_tag solo",
					tag_string_character: "",
					tag_string_copyright: "",
					tag_string_artist: "",
					tag_string_meta: "",
					created_at: "2023-02-20T12:00:00.000Z",
				},
			];

			const result = Danbooru.transformPostData(mockRawPosts);
			expect(result.posts).toHaveLength(2);
			expect(result.hasNextPage).toBe(true); // Based on current logic that it's true if posts.length > 0

			// Check first post
			const post1 = result.posts[0];
			expect(post1.id).toBe("12345");
			expect(post1.postView).toBe("https://danbooru.donmai.us/posts/12345");
			expect(post1.fileUrl).toBe(mockRawPosts[0].file_url);
			expect(post1.previewUrl).toBe(mockRawPosts[0].preview_file_url);
			expect(post1.sampleUrl).toBe(mockRawPosts[0].large_file_url);
			expect(post1.tags).toEqual(mockRawPosts[0].tag_string.split(" "));
			expect(post1.rating).toBe("general"); // transformed from 'g'
			expect(post1.createdAt).toBe(new Date(mockRawPosts[0].created_at).toISOString());
			expect(post1.height).toBe(mockRawPosts[0].image_height);
			expect(post1.width).toBe(mockRawPosts[0].image_width);

			// Check second post
			const post2 = result.posts[1];
			expect(post2.id).toBe("67890");
			expect(post2.postView).toBe("https://danbooru.donmai.us/posts/67890");
			expect(post2.rating).toBe("sensitive"); // transformed from 's'

			// Test getTagGroups for the first post
			if (post1.getTagGroups) {
				const tagGroups = await post1.getTagGroups();
				expect(tagGroups.Tag).toEqual(["tag1", "tag2"]);
				expect(tagGroups.Character).toEqual(["some_character"]);
				expect(tagGroups.Copyright).toEqual(["some_copyright"]);
				expect(tagGroups.Artist).toEqual(["some_artist"]);
				expect(tagGroups.Metadata).toEqual(["meta_tag"]);
			} else {
				// Should not happen if getTagGroups is implemented as expected
				throw new Error("getTagGroups not defined on Danbooru post object");
			}
		});

		it("should handle empty input", () => {
			const result = Danbooru.transformPostData([]);
			expect(result.posts).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should filter out posts without file_url", () => {
			const mockRawPostsWithMissingFileUrl = [
				{
					id: 111,
					// ... other fields ...
					file_url: undefined, // Missing file_url
					tag_string: "test",
					created_at: "2023-01-01T00:00:00.000Z",
					rating: "g",
				},
				{
					id: 222,
					file_url: "https://danbooru.donmai.us/data/sample/sample-222.jpg",
					// ... other fields ...
					tag_string: "test2",
					created_at: "2023-01-02T00:00:00.000Z",
					rating: "q",
				}
			];
			// @ts-expect-error testing invalid input
			const result = Danbooru.transformPostData(mockRawPostsWithMissingFileUrl);
			expect(result.posts).toHaveLength(1);
			expect(result.posts[0].id).toBe("222");
			expect(result.posts[0].postView).toBe("https://danbooru.donmai.us/posts/222");
		});
	});
});
