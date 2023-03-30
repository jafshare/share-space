<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  link: string;
  icon?: string;
}>();
</script>

<template>
  <div class="card">
    <h2 class="title">
      <a :href="link">
        {{ title }}
      </a>
    </h2>
    <div class="description">
      {{ description }}
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<style lang="less" scoped>
.card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.card .title {
  font-size: 16px;
  font-weight: 600;
  &:hover {
    color: var(--vp-button-brand-bg);
  }
}
.card .description {
  flex-grow: 1;
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
