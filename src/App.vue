<script setup>
import SortingAlgorithms from "./components/SortingAlgorithms.vue";
import GraphAlgorithms from "./components/GraphAlgorithms.vue";
import SearchAlgorithms from "./components/SearchAlgorithms.vue";
import { ref, onMounted } from "vue";

const selectedComponent = ref(null);

onMounted(() => {
  const flexItems = document.querySelectorAll(".flex-item");
  flexItems.forEach((flexItem) => {
    const gif = flexItem.querySelector("img");
    const originalGifSrc = gif.src;
    let placeholderSrc = "";

    if (originalGifSrc.includes("Search.gif")) {
      placeholderSrc = new URL("./assets/img/search.png", import.meta.url).href;
    } else if (originalGifSrc.includes("Sort.gif")) {
      placeholderSrc = new URL("./assets/img/sort.png", import.meta.url).href;
    } else if (originalGifSrc.includes("Graph.gif")) {
      placeholderSrc = new URL("./assets/img/graph.png", import.meta.url).href;
    }

    gif.src = placeholderSrc;
    gif.style.filter = "grayscale(100%)";

    flexItem.addEventListener("mouseenter", () => {
      gif.src = originalGifSrc;
      gif.style.filter = "none";
    });

    flexItem.addEventListener("mouseleave", () => {
      gif.src = placeholderSrc;
      gif.style.filter = "grayscale(100%)";
    });
  });
});
</script>

<template>
  <header></header>

  <main>
    <div class="flex-container">
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'SearchAlgorithms' }"
        @click="selectedComponent = 'SearchAlgorithms'"
      >
        <div class="gif-container">
          <img src="./assets/gifs/Search.gif" alt="Search GIF" />
        </div>
        Search Algorithms
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'SortingAlgorithms' }"
        @click="selectedComponent = 'SortingAlgorithms'"
      >
        <div class="gif-container">
          <img src="./assets/gifs/Sort.gif" alt="Sort GIF" />
        </div>
        Sorting Algorithms
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'GraphAlgorithms' }"
        @click="selectedComponent = 'GraphAlgorithms'"
      >
        <div class="gif-container">
          <img src="./assets/gifs/Graph.gif" alt="Graph GIF" />
        </div>
        Graph Algorithms
      </div>
    </div>
    <SortingAlgorithms v-if="selectedComponent === 'SortingAlgorithms'" />
    <GraphAlgorithms v-if="selectedComponent === 'GraphAlgorithms'" />
    <SearchAlgorithms v-if="selectedComponent === 'SearchAlgorithms'" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.flex-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-grow: 1;
  align-items: stretch;
}

.flex-item {
	flex: 1 1 0%;
  display: flex;
  flex-grow: 1;
  transition: flex 0.3s ease;
  padding: 20px;
  text-align: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.flex-item:hover {
  flex: 3 1 0%;
    background-color: #ddd; /* Change background color on hover */
}

.flex-item.active {
  background-color: #e0e0e0;
  font-weight: bold;
}

SortingAlgorithms,
GraphAlgorithms,
SearchAlgorithms {
  width: 100%;
}

.gif-container {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gif-container img {
  width: 80%;
  height: auto;
  object-fit: contain;
}
</style>
