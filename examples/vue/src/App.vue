<script setup lang="ts">
import { ref } from "vue";
import { useDemoGhost } from "@demoghostjs/vue";
import { click, type, wait, highlight } from "demoghost";

const { play, isPlaying } = useDemoGhost();
const message = ref("");
const savedText = ref("Vue 3 Demo");

const runDemo = () => {
  play([
    click("#vue-input"),
    type("#vue-input", "Autopilot in Vue 3!"),
    wait(200),
    click("#vue-save"),
    highlight("#vue-output", { duration: 1200 })
  ]);
};

const save = () => {
  if (message.value) {
    savedText.value = message.value;
    message.value = "";
  }
};
</script>

<template>
  <div style="padding: 40px; max-width: 500px; margin: 0 auto;">
    <h2>Vue 3 Composition API Adapter</h2>
    <button @click="runDemo" :disabled="isPlaying" style="margin-bottom: 20px;">
      {{ isPlaying ? 'Playing Demo...' : 'Run Vue Demo' }}
    </button>

    <div>
      <input id="vue-input" v-model="message" placeholder="Type a message" style="padding: 8px; margin-right: 8px;" />
      <button id="vue-save" @click="save" style="padding: 8px;">Save</button>
    </div>

    <div id="vue-output" style="margin-top: 20px; font-weight: bold;">
      Output: {{ savedText }}
    </div>
  </div>
</template>
