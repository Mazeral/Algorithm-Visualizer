<script setup>
import SortingAlgorithms from "./components/SortingAlgorithms.vue";
import GraphAlgorithms from "./components/GraphAlgorithms.vue";
import SearchAlgorithms from "./components/SearchAlgorithms.vue";
import { ref } from "vue";

const selectedComponent = ref(null);
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
        Search Algorithms
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'SortingAlgorithms' }"
        @click="selectedComponent = 'SortingAlgorithms'"
      >
        Sorting Algorithms
      </div>
      <div
        class="flex-item"
        :class="{ active: selectedComponent === 'GraphAlgorithms' }"
        @click="selectedComponent = 'GraphAlgorithms'"
      >
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
  flex-grow: 1; /* Make flex-container take up remaining vertical space */
  align-items: stretch;
}

.flex-item {
  display:flex;
  flex-grow: 1;
  transition: flex-grow 0.3s ease;
  padding: 20px;
  text-align: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  text-align:center;
}

.flex-item:hover {
  flex-grow: 3;
}

.flex-item.active {
  background-color: #e0e0e0;
  font-weight: bold;
}

SortingAlgorithms, GraphAlgorithms, SearchAlgorithms {
  width: 100%;
}
</style>
