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
.flex-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
}
.flex-item {
  flex-grow: 1; /* Initially, all items share space equally */
  transition: flex-grow 0.3s ease; /* Smooth transition */
  padding: 20px;
  text-align: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
}
.flex-item:hover {
  flex-grow: 3;
}
.flex-item.active {
  background-color: #e0e0e0;
  font-weight: bold;
}
</style>
