<script setup lang="ts">
import { useData } from "vitepress";
import Card from "../Card/index.vue";
const { theme } = useData();
const columns = 3;
</script>

<template>
  <div class="home">
    <div class="content">
      <Card
        class="item"
        title="阮一峰技术周刊"
        description="大佬的科技周刊，值得一追"
        :link="theme.sidebar['/ruanyf_weekly/']?.[0].items[0].items[0].link"
      />
      <Card
        class="item"
        title="HelloGithub"
        description="Github萌新必追，推荐有趣好玩的开源项目"
        :link="theme.sidebar['/hello_github/']?.[0].link"
      />
      <Card
        class="item"
        title="前端精读周刊"
        description="想提升前端的技术吗？一起看看吧"
        :link="theme.sidebar['/frontend_weekly/']?.[0].items[0].link"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 1152px;
}
.content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  .item {
    width: calc((100% - ((v-bind(columns) - 1) * 16px)) / v-bind(columns));
  }
}
</style>
