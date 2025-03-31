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

    // Hover handlers
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
          <span class="gif-text">Search Algorithms</span>
        </div>
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'SortingAlgorithms' }"
        @click="selectedComponent = 'SortingAlgorithms'"
      >
        <div class="gif-container">
          <img src="./assets/gifs/Sort.gif" alt="Sort GIF" />
          <span class="gif-text">Sorting Algorithms</span>
        </div>
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'GraphAlgorithms' }"
        @click="selectedComponent = 'GraphAlgorithms'"
      >
        <div class="gif-container">
          <img src="./assets/gifs/Graph.gif" alt="Graph GIF" />
          <span class="gif-text">Graph Algorithms</span>
        </div>
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
  flex-grow: 1;
  align-items: stretch;
  background: #73ba9b; /* Match default flex-item color */
}

.flex-item {
  flex: 1 1 0%;
  display: flex;
  transition: all 0.3s ease;
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border: 1px solid #788c69;
  cursor: pointer;
  justify-content: center;
  align-items: center;
}

.flex-item:hover {
  flex: 2 1 0%;
  background-color: #73BA9B;
}

.flex-item.active {
  background-color: #73BA9B;
  font-weight: bold;
}

SortingAlgorithms,
GraphAlgorithms,
SearchAlgorithms {
  width: 100%;
}

.gif-container {
  width: 100%;
  height: 150px; /* Fixed height for all containers */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden; /* Prevent image overflow */
}

.gif-container img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Maintain aspect ratio while filling container */
  border-radius: 10px;
  transition: transform 0.3s ease; /* For hover scaling */
}

.gif-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 5px;
  transition: font-size 0.3s ease, border 0.3s ease;
  background-color: rgba(75, 88, 66, 0.5);
  border: 2px solid transparent;
}

.flex-item:hover .gif-text {
  font-size: 2em;
  border: 2px solid #1A936F;
}

.flex-item.active .gif-text {
  border: 2px solid #0E79B2;
}

.flex-container:hover > .flex-item:not(:hover) {
  filter: blur(3px);
}
</style>
