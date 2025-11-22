import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { migrateState } from './state-migration';
import { CompressedState } from './blueprint-compiler';

describe('state-migration', () => {
	let consoleInfoSpy: any;

	beforeEach(() => {
		consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleInfoSpy.mockRestore();
	});

	describe('migrateState', () => {
		it('should return state unchanged if no steps', () => {
			const state: CompressedState = { steps: [] };
			const result = migrateState(state);
			expect(result).toEqual(state);
		});

		it('should return state unchanged if state is null', () => {
			const result = migrateState(null as any);
			expect(result).toBe(null);
		});

		it('should return state unchanged if state has no steps property', () => {
			const state = {} as CompressedState;
			const result = migrateState(state);
			expect(result).toEqual(state);
		});

		it('should not modify steps without vars', () => {
			const state: CompressedState = {
				steps: [
					{ step: 'login' }
				]
			};
			const result = migrateState(state);
			expect(result.steps[0]).toEqual({ step: 'login' });
		});

		it('should not modify steps without migrations', () => {
			const state: CompressedState = {
				steps: [
					{ step: 'login', username: 'admin' }
				]
			};
			const result = migrateState(state);
			expect(result.steps[0].username).toBe('admin');
		});

		describe('addPage migrations', () => {
			it('should migrate postTitle to title', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postTitle: 'My Page' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('My Page');
				expect(result.steps[0].postTitle).toBeUndefined();
			});

			it('should migrate postContent to content', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postContent: 'Page content here' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].content).toBe('Page content here');
				expect(result.steps[0].postContent).toBeUndefined();
			});

			it('should migrate multiple vars together', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPage',
							postTitle: 'My Page',
							postContent: 'Content'
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('My Page');
				expect(result.steps[0].content).toBe('Content');
				expect(result.steps[0].postTitle).toBeUndefined();
				expect(result.steps[0].postContent).toBeUndefined();
			});

			it('should preserve non-migrated vars', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPage',
							postTitle: 'My Page',
							customField: 'value'
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('My Page');
				expect(result.steps[0].customField).toBe('value');
			});

			it('should log migration info', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postTitle: 'My Page' }
					]
				};
				migrateState(state);
				expect(consoleInfoSpy).toHaveBeenCalledWith(
					'Migrated variable "postTitle" to "title" in step "addPage"'
				);
			});
		});

		describe('addPost migrations', () => {
			it('should migrate postTitle to title', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPost', postTitle: 'My Post' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('My Post');
				expect(result.steps[0].postTitle).toBeUndefined();
			});

			it('should migrate postContent to content', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPost', postContent: 'Post content' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].content).toBe('Post content');
			});

			it('should migrate postDate to date', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPost', postDate: '2024-01-01' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].date).toBe('2024-01-01');
			});

			it('should migrate postType to type', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPost', postType: 'article' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].type).toBe('article');
			});

			it('should migrate postStatus to status', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPost', postStatus: 'publish' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].status).toBe('publish');
			});

			it('should migrate all post vars together', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPost',
							postTitle: 'Title',
							postContent: 'Content',
							postDate: '2024-01-01',
							postType: 'post',
							postStatus: 'draft'
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('Title');
				expect(result.steps[0].content).toBe('Content');
				expect(result.steps[0].date).toBe('2024-01-01');
				expect(result.steps[0].type).toBe('post');
				expect(result.steps[0].status).toBe('draft');
			});
		});

		describe('addProduct migrations', () => {
			it('should migrate productTitle to title', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productTitle: 'My Product' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('My Product');
			});

			it('should migrate productDescription to description', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productDescription: 'Description' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].description).toBe('Description');
			});

			it('should migrate productPrice to price', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productPrice: '99.99' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].price).toBe('99.99');
			});

			it('should migrate productSalePrice to salePrice', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productSalePrice: '79.99' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].salePrice).toBe('79.99');
			});

			it('should migrate productSku to sku', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productSku: 'ABC123' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].sku).toBe('ABC123');
			});

			it('should migrate productStatus to status', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addProduct', productStatus: 'instock' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].status).toBe('instock');
			});

			it('should migrate all product vars together', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addProduct',
							productTitle: 'Widget',
							productDescription: 'A great widget',
							productPrice: '49.99',
							productSalePrice: '39.99',
							productSku: 'WID-001',
							productStatus: 'instock'
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('Widget');
				expect(result.steps[0].description).toBe('A great widget');
				expect(result.steps[0].price).toBe('49.99');
				expect(result.steps[0].salePrice).toBe('39.99');
				expect(result.steps[0].sku).toBe('WID-001');
				expect(result.steps[0].status).toBe('instock');
			});
		});

		describe('complex scenarios', () => {
			it('should migrate multiple steps', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postTitle: 'Page 1' },
						{ step: 'addPost', postTitle: 'Post 1' },
						{ step: 'addProduct', productTitle: 'Product 1' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('Page 1');
				expect(result.steps[1].title).toBe('Post 1');
				expect(result.steps[2].title).toBe('Product 1');
			});

			it('should handle mix of migrated and non-migrated steps', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'login', username: 'admin' },
						{ step: 'addPage', postTitle: 'My Page' },
						{ step: 'installPlugin', slug: 'test' }
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].username).toBe('admin');
				expect(result.steps[1].title).toBe('My Page');
				expect(result.steps[2].slug).toBe('test');
			});

			it('should preserve step properties other than vars', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPage',
							postTitle: 'My Page',
							count: 5
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].count).toBe(5);
				expect(result.steps[0].title).toBe('My Page');
			});

			it('should preserve state properties other than steps', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postTitle: 'My Page' }
					],
					title: 'Blueprint Title',
					autosave: '10'
				};
				const result = migrateState(state);
				expect(result.title).toBe('Blueprint Title');
				expect(result.autosave).toBe('10');
			});

			it('should handle boolean values', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPost',
							postTitle: 'Test',
							featured: true
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('Test');
				expect(result.steps[0].featured).toBe(true);
			});

			it('should handle numeric values', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addProduct',
							productPrice: 99.99,
							quantity: 10
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].price).toBe(99.99);
				expect(result.steps[0].quantity).toBe(10);
			});

			it('should handle array values', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPost',
							postTitle: 'Test',
							tags: ['tag1', 'tag2']
						}
					]
				};
				const result = migrateState(state);
				expect(result.steps[0].title).toBe('Test');
				expect(result.steps[0].tags).toEqual(['tag1', 'tag2']);
			});

			it('should log multiple migrations', () => {
				const state: CompressedState = {
					steps: [
						{
							step: 'addPost',
							postTitle: 'Title',
							postContent: 'Content'
						}
					]
				};
				migrateState(state);
				expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
				expect(consoleInfoSpy).toHaveBeenCalledWith(
					'Migrated variable "postTitle" to "title" in step "addPost"'
				);
				expect(consoleInfoSpy).toHaveBeenCalledWith(
					'Migrated variable "postContent" to "content" in step "addPost"'
				);
			});

			it('should not mutate original state', () => {
				const state: CompressedState = {
					steps: [
						{ step: 'addPage', postTitle: 'My Page' }
					]
				};
				const originalPostTitle = state.steps[0].postTitle;
				migrateState(state);
				// Original state should still have old property name
				expect(originalPostTitle).toBe('My Page');
			});
		});
	});
});
