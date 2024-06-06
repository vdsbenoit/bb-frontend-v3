module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  pwa: {
    name: "Baden Battle Score App",
    themeColor: "#ff2c2c",
    msTileColor: "#ff2c2c",
    appleMobileWebAppCapable: "yes",
    manifestOptions: {
      short_name: "Baden Battle",
      display: "standalone",
      orientation: "portrait",
      icons: [
        {
          src: "./img/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "./img/icons/android-chrome-384x384.png",
          sizes: "384x384",
          type: "image/png"
        },
        {
          src: "./img/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png"
        },
        {
          src: "./img/icons/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png"
        },
        {
          src: "./img/icons/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png"
        },
        {
          src: "./img/icons/mstile-150x150.png",
          sizes: "150x150",
          type: "image/png"
        }
      ]
    },
    iconPaths: {
      faviconSVG: "img/icons/safari-pinned-tab.svg",
      favicon32: "img/icons/favicon-32x32.png",
      favicon16: "img/icons/favicon-16x16.png",
      appleTouchIcon: "img/icons/apple-touch-icon.png",
      maskIcon: "img/icons/safari-pinned-tab.svg",
      msTileImage: "img/icons/mstile-150x150.png"
    }
  }
}
