// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  plugins: [
    [
      "@snowpack/plugin-webpack",
      {
        sourceMap: false,
        manifest: false,
      }
    ]
  ],
  exclude: ['package*.json', 'snowpack*'],
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  }
};
