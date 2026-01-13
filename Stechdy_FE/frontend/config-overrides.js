/* eslint-disable */
module.exports = function override(config, env) {
    if (env === 'production') {
        // Completely remove CssMinimizerPlugin to avoid the error
        if (config.optimization && config.optimization.minimizer) {
            config.optimization.minimizer = config.optimization.minimizer.filter(
                plugin => plugin.constructor.name !== 'CssMinimizerPlugin'
            );
        }

        // Alternative: disable CSS optimization entirely
        if (config.optimization) {
            config.optimization.minimize = false;
        }
    }
    return config;
};
