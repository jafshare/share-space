---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Share-Space"
  text: "整合多个 github 开源文档的知识网站"
  tagline: "知识空间"
---

<script setup>
import { useData } from 'vitepress'
import Card from '../components/Card/index.vue'
const { theme } = useData()
</script>
<div style="display:flex;gap:16px;padding:30px">
  <Card style="flex:1;" title="阮一峰技术周刊" description="大佬的科技周刊，值得一追" :link="theme.sidebar['/ruanyf_weekly/']?.[0].items[0].items[0].link"/>
  <Card style="flex:1;" title="HelloGithub" description="Github萌新必追，推荐有趣好玩的开源项目" :link="theme.sidebar['/hello_github/']?.[0].link"/>
  <Card style="flex:1;" title="前端精读周刊" description="想提升前端的技术吗？一起看看吧" :link="theme.sidebar['/frontend_weekly/']?.[0].items[0].link"/>
</div>
