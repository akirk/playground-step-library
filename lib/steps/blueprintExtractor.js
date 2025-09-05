import { githubPlugin } from './githubPlugin.js';
export const blueprintExtractor = (step) => {
    return githubPlugin({
        step: 'githubPlugin',
        url: "https://github.com/akirk/blueprint-extractor",
        branch: "main",
    });
};
blueprintExtractor.description = "Generate a new blueprint after modifying the WordPress.";
//# sourceMappingURL=blueprintExtractor.js.map