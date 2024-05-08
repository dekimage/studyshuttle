await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["studyshuttle.mk", "cdn.pixabay.com"],
  },
};

export default config;
