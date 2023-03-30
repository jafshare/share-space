<script setup lang="ts">
import { useData } from "vitepress";
import { VPHomeHero } from "vitepress/theme";
import Card from "../Card/index.vue";
const { theme } = useData();
</script>

<template>
  <div class="home">
    <VPHomeHero />
    <div style="display: flex; gap: 16px; padding: 30px">
      <Card
        style="flex: 1"
        title="阮一峰技术周刊"
        description="大佬的科技周刊，值得一追"
        :link="theme.sidebar['/ruanyf_weekly/']?.[0].items[0].items[0].link"
      />
      <Card
        style="flex: 1"
        title="HelloGithub"
        description="Github萌新必追，推荐有趣好玩的开源项目"
        :link="theme.sidebar['/hello_github/']?.[0].link"
      />
      <Card
        style="flex: 1"
        title="前端精读周刊"
        description="想提升前端的技术吗？一起看看吧"
        :link="theme.sidebar['/frontend_weekly/']?.[0].items[0].link"
      />
    </div>
  </div>
</template>

<style lang="less" scoped></style>
