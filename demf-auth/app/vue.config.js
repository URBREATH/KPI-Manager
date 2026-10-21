const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");
const { VuetifyPlugin } = require("webpack-plugin-vuetify");
process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,

  configureWebpack: {
    externals: [],

    plugins: [
      new VuetifyPlugin({ autoImport: true }), // Enabled by default
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
      }),
    ],
    output: {
      libraryTarget: "system",
    },
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableLegacy: true,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
    // vuetify: {
    //   // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    // },
  },
  filenameHashing: false,
  publicPath: "/",
});
