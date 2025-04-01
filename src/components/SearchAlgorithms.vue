<script setup>
import { ref, reactive, watch } from "vue";

const array = reactive([]);
const targetValue = ref(null);
const isRunning = ref(false);
const currentIndex = ref(-1);
const foundIndex = ref(-1);
const checkedIndices = reactive([]);
const searchComplete = ref(false);
const speed = ref(500);
const selectedAlgorithm = ref("Linear Search");

// Generate initial array
const generateNewArray = () => {
  array.splice(0);
  for (let i = 0; i < 22; i++) {
    const num = Math.floor(Math.random() * 100) + 1;
    if (!array.includes(num)) array.push(num);
    else --i;
  }
  if (needsSortedArray()) {
    array.sort((a, b) => a - b);
  }
  resetSearch();
};

// Reset search state
const resetSearch = () => {
  currentIndex.value = -1;
  foundIndex.value = -1;
  checkedIndices.splice(0);
  searchComplete.value = false;
};

// Linear Search implementation
const linearSearch = async () => {
  for (let i = 0; i < array.length; i++) {
    currentIndex.value = i;
    checkedIndices.push(i);
    await delay();

    if (array[i] === targetValue.value) {
      foundIndex.value = i;
      return true;
    }
  }
  return false;
};

// Binary Search implementation
const binarySearch = async () => {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    currentIndex.value = mid;
    checkedIndices.push(mid);
    await delay();

    if (array[mid] === targetValue.value) {
      foundIndex.value = mid;
      return true;
    } else if (array[mid] < targetValue.value) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return false;
};

// Jump Search implementation
const jumpSearch = async () => {
  const n = array.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  let currentStep = step;

  while (currentStep < n && array[currentStep - 1] < targetValue.value) {
    prev = currentStep;
    currentStep += step;
    currentIndex.value = prev;
    checkedIndices.push(prev);
    await delay();
  }

  // Linear search within the block
  while (prev < Math.min(currentStep, n)) {
    currentIndex.value = prev;
    checkedIndices.push(prev);
    await delay();

    if (array[prev] === targetValue.value) {
      foundIndex.value = prev;
      return true;
    }
    prev++;
  }

  return false;
};

// Interpolation Search implementation
const interpolationSearch = async () => {
  let low = 0;
  let high = array.length - 1;

  while (
    low <= high &&
    targetValue.value >= array[low] &&
    targetValue.value <= array[high]
  ) {
    const pos = Math.floor(
      low +
        ((targetValue.value - array[low]) * (high - low)) /
          (array[high] - array[low]),
    );

    currentIndex.value = pos;
    checkedIndices.push(pos);
    await delay();

    if (array[pos] === targetValue.value) {
      foundIndex.value = pos;
      return true;
    }

    if (array[pos] < targetValue.value) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }
  return false;
};

// Start search process
const startSearch = async () => {
  if (!targetValue.value) return;

  isRunning.value = true;
  resetSearch();

  try {
    let found;
    switch (selectedAlgorithm.value) {
      case "Linear Search":
        found = await linearSearch();
        break;
      case "Binary Search":
      case "Jump Search":
      case "Interpolation Search":
        if (!isSorted()) {
          alert("Array must be sorted for this algorithm");
          return;
        }
        if (selectedAlgorithm.value === "Binary Search")
          found = await binarySearch();
        if (selectedAlgorithm.value === "Jump Search")
          found = await jumpSearch();
        if (selectedAlgorithm.value === "Interpolation Search")
          found = await interpolationSearch();
        break;
    }

    if (!found) foundIndex.value = -1;
  } finally {
    isRunning.value = false;
    searchComplete.value = true;
  }
};

// Check if array is sorted
const isSorted = () => {
  for (let i = 1; i < array.length; i++) {
    if (array[i - 1] > array[i]) return false;
  }
  return true;
};

// Check if algorithm requires sorted array
const needsSortedArray = () => {
  return ["Binary Search", "Jump Search", "Interpolation Search"].includes(
    selectedAlgorithm.value,
  );
};

// Delay helper
const delay = () => new Promise((resolve) => setTimeout(resolve, speed.value));

// Watch algorithm changes
watch(selectedAlgorithm, (newVal) => {
  if (needsSortedArray()) {
    array.sort((a, b) => a - b);
  }
  resetSearch();
});

// Initial setup
generateNewArray();
</script>

<template>
  <div class="search-visualizer">
    <div class="controls">
      <select v-model="selectedAlgorithm">
        <option>Linear Search</option>
        <option>Binary Search</option>
        <option>Jump Search</option>
        <option>Interpolation Search</option>
      </select>

      <input
        type="number"
        v-model.number="targetValue"
        placeholder="Enter target value"
        :disabled="isRunning"
      />

      <button @click="startSearch" :disabled="!targetValue || isRunning">
        {{ isRunning ? "Searching..." : "Start Search" }}
      </button>

      <button @click="generateNewArray">New Array</button>

      <label>
        Speed:
        <input
          type="range"
          v-model.number="speed"
          min="100"
          max="1000"
          step="100"
        />
        {{ speed }}ms
      </label>
    </div>

    <div class="array-container">
      <div
        v-for="(num, index) in array"
        :key="index"
        class="array-element"
        :class="{
          active: currentIndex === index,
          found: foundIndex === index,
          checked: checkedIndices.includes(index),
          'not-found': searchComplete && foundIndex === -1,
        }"
      >
        {{ num }}
      </div>
    </div>

    <div class="status">
      <div v-if="searchComplete">
        <span v-if="foundIndex !== -1">
          Found {{ targetValue }} at index {{ foundIndex }}
        </span>
        <span v-else> {{ targetValue }} not found in the array </span>
      </div>
    </div>
  </div>
</template>

<style>
.search-visualizer {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.array-container {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 100px;
}

.array-element {
  width: 60px;
  height: 60px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.array-element.active {
  background: #f1c40f;
}

.array-element.found {
  background: #2ecc71;
}

.array-element.checked {
  background: #e74c3c;
  opacity: 0.7;
}

.array-element.not-found {
  background: #95a5a6;
}

.status {
  margin-top: 20px;
  text-align: center;
  font-size: 1.2em;
}

button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

input[type="number"] {
  padding: 8px;
  width: 150px;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
