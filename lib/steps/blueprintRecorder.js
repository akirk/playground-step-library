import { githubPlugin } from './githubPlugin.js';
export const blueprintRecorder = (step) => {
    return githubPlugin({
        step: 'githubPlugin',
        url: "https://github.com/akirk/blueprint-recorder",
        branch: "main",
    });
};
blueprintRecorder.description = "Record steps made and compile a new blueprint.";
//# sourceMappingURL=blueprintRecorder.js.map