import { createApp } from "vue";
import App from "./App.vue";
import { DemoGhostPlugin } from "@demoghostjs/vue";
import "demoghost/css";

const app = createApp(App);
app.use(DemoGhostPlugin);
app.mount("#app");
