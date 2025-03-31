<script setup>
import SortingAlgorithms from "./components/SortingAlgorithms.vue";
import GraphAlgorithms from "./components/GraphAlgorithms.vue";
import SearchAlgorithms from "./components/SearchAlgorithms.vue";
import { ref, onMounted } from "vue";

const selectedComponent = ref(null);

onMounted(() => {
  const gifContainers = document.querySelectorAll(".gif-container");
  gifContainers.forEach((container) => {
    const gif = container.querySelector("img");
    const originalGifSrc = gif.src;
    let placeholderSrc = "";

    if (originalGifSrc.includes("Search.gif")) {
      placeholderSrc = new URL("./assets/img/search.png", import.meta.url).href;
    } else if (originalGifSrc.includes("Sort.gif")) {
      placeholderSrc = new URL("./assets/img/sort.png", import.meta.url).href;
    } else if (originalGifSrc.includes("Graph.gif")) {
      placeholderSrc = new URL("./assets/img/graph.png", import.meta.url).href;
    }

    gif.src = placeholderSrc; // Set placeholder image initially
    gif.style.filter = "grayscale(100%)"; // Initial grayscale

    container.addEventListener("mouseenter", () => {
      gif.src = originalGifSrc; // Load GIF on hover
      gif.style.filter = "none"; // Remove grayscale
    });

    container.addEventListener("mouseleave", () => {
      gif.src = placeholderSrc; // Load PNG on mouse leave
      gif.style.filter = "grayscale(100%)"; // Apply grayscale
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
  display: flex;
  flex-grow: 1;
  transition: flex-grow 0.3s ease;
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
  flex-grow: 3;
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
