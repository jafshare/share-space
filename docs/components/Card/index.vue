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
    <div class="title">
      <h2>
        <a :href="link">
          {{ title }}
        </a>
      </h2>
    </div>
    <div class="description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
  color: rgba(60, 60, 67);
  background-color: rgb(246, 246, 247);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.card .title:hover {
  color: #747bff;
}
.card .description {
  flex-grow: 1;
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(60, 60, 67, 0.75);
}
</style>
