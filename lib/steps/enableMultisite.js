export const enableMultisite = (step) => {
    const steps = [
        {
            "step": "enableMultisite"
        }
    ];
    steps.landingPage = '/wp-admin/network/sites.php';
    return steps;
};
enableMultisite.description = "Enable WordPress Multisite functionality.";
enableMultisite.builtin = true;
enableMultisite.vars = [];
//# sourceMappingURL=enableMultisite.js.map