<template>
  <div v-for="(item, index) in images" :key="index" v-show="index === activeIndex">
    <img:src="item" alt="">
      <p>{{ activeIndex }},{{ item }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const images = ref([
  'https://picsum.photos/800/374?random=1',
  'https://picsum.photos/800/374?random=2',
  'https://picsum.photos/800/374?random=3',
  'https://picsum.photos/800/374?random=4'
])
const activeIndex = ref(0)
let timer = null
const startCarousel = () => {
  timer = window.setInterval(
    () => {
      activeIndex.value = (activeIndex.value + 1) % images.value.length
      console.log(activeIndex.value)
    }
    , 3000
  )
}
onMounted(() => {
  startCarousel()
})
</script>
<style scoped></style>
