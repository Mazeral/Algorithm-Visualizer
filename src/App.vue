<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import GraphAlgorithms from "./components/GraphAlgorithms.vue";
import SearchAlgorithms from "./components/SearchAlgorithms.vue";
import SortingAlgorithms from "./components/SortingAlgorithms.vue";

const selectedComponent = ref(null);
const showMainView = ref(true);

// Reactive state for image management
const items = reactive([
  {
    id: "SearchAlgorithms",
    originalGif: new URL("./assets/gifs/Search.gif", import.meta.url).href,
    placeholder: new URL("./assets/img/search.png", import.meta.url).href,
    currentSrc: SearchAlgorithms,
    isHovered: false,
    active: false,
  },
  {
    id: "SortingAlgorithms",
    originalGif: new URL("./assets/gifs/Sort.gif", import.meta.url).href,
    placeholder: new URL("./assets/img/sort.png", import.meta.url).href,
    currentSrc: SortingAlgorithms,
    isHovered: false,
    active: false,
  },
  {
    id: "GraphAlgorithms",
    originalGif: new URL("./assets/gifs/Graph.gif", import.meta.url).href,
    placeholder: new URL("./assets/img/graph.png", import.meta.url).href,
    currentSrc: GraphAlgorithms,
    isHovered: false,
    active: false,
  },
]);

// Initialize image states
function initializeImages() {
  items.forEach((item) => {
    item.currentSrc = item.placeholder;
    item.isHovered = false;
    item.active = false;
  });
}

function resetView() {
  selectedComponent.value = null;
  showMainView.value = true;
  initializeImages();
}

// Watch for main view changes
watch(showMainView, (newVal) => {
  if (newVal) initializeImages();
});

// Initial setup
onMounted(initializeImages);
</script>

<template>
  <header>
    <button v-if="!showMainView" @click="resetView" class="back-button">
      ← Back
    </button>
  </header>

  <main>
    <div class="flex-container" v-if="showMainView">
      <div
        class="flex-item"
        v-for="item in items"
        :key="item.id"
        :class="{ active: item.active }"
        @click="
          () => {
            selectedComponent = item.id;
            showMainView = false;
          }
        "
        @mouseenter="item.isHovered = true"
        @mouseleave="item.isHovered = false"
      >
        <div class="gif-container">
          <img
            :src="item.isHovered ? item.originalGif : item.placeholder"
            :style="{ filter: item.isHovered ? 'none' : 'grayscale(100%)' }"
            :alt="`${item.id} GIF`"
          />
          <span class="gif-text">{{ item.id }}</span>
        </div>
      </div>
    </div>
    <div v-else>
      <SortingAlgorithms v-if="selectedComponent === 'SortingAlgorithms'" />
      <GraphAlgorithms v-if="selectedComponent === 'GraphAlgorithms'" />
      <SearchAlgorithms v-if="selectedComponent === 'SearchAlgorithms'" />
    </div>
  </main>
</template>

<style scoped>
.back-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 10px 20px;
  background: #f5f5f5;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.back-button:hover {
  background: #73ba9b;
  transform: scale(1.05);
}
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
  background-color: #73ba9b;
}

.flex-item.active {
  background-color: #73ba9b;
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
  transition:
    font-size 0.3s ease,
    border 0.3s ease;
  background-color: rgba(75, 88, 66, 0.5);
  border: 2px solid transparent;
}

.flex-item:hover .gif-text {
  font-size: 2em;
  border: 2px solid #1a936f;
}

.flex-item.active .gif-text {
  border: 2px solid #0e79b2;
}

.flex-container:hover > .flex-item:not(:hover) {
  filter: blur(3px);
}
</style>
