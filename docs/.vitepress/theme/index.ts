// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import Theme from "vitepress/theme";
import Layout from "../../components/Layout/index.vue";
import "./style.css";

export default {
  ...Theme,
  Layout: () => {
    // return h(Theme.Layout, null, {
    // https://vitepress.dev/guide/extending-default-theme#layout-slots
    // });
    return h(Layout);
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  }
};
