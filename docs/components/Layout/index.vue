<script setup lang="ts">
import { useData } from "vitepress";
import Theme from "vitepress/theme";
import Home from "../Home/index.vue";
const { page, frontmatter } = useData();
</script>

<template>
  <div class="layout">
    <Theme.NotFound v-if="page.isNotFound" />
    <div v-if="frontmatter.layout === 'home'">
      <!-- 自定义Home -->
      <Home />
    </div>
    <Theme.Layout v-else />
    <!-- <Content v-else /> -->
  </div>
</template>

<style lang="less" scoped></style>
