
module.exports = function (config) {
  config.set({
    basePath: "",

    frameworks: ["jasmine"],

    files: [
      {
        pattern: "tests-dist/**/*.js",
        watched: false,
      },
    ],

    reporters: ["progress", "coverage"],

    browsers: ["ChromeHeadless"],

    singleRun: true,

    autoWatch: false,

    client: {
      clearContext: false,
    },

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
      ],
    },
  });
};
