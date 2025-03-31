<template>
  <div class="sorting-visualizer">
    <!-- Algorithm selection -->
    <div class="controls">
      <label for="algorithm">Select sorting algorithm:</label>
      <select id="algorithm" v-model="selectedAlgorithm">
        <option value="bubbleSort">Bubble Sort</option>
        <option value="selectionSort">Selection Sort</option>
        <option value="insertionSort">Insertion Sort</option>
        <option value="mergeSort">Merge Sort</option>
        <option value="quickSort">Quick Sort</option>
      </select>

      <button @click="resetArray">Generate New Array</button>
      <button @click="startSorting" :disabled="isSorting">Sort</button>
      <button @click="stopSorting" :disabled="!isSorting">Stop</button>
    </div>

    <!-- Visualization area -->
    <div class="array-container">
      <div
        v-for="(value, index) in array"
        :key="index"
        class="array-bar"
        :style="{
          height: `${value}px`,
          backgroundColor: getBarColor(index),
        }"
        :class="{
          comparing: comparingIndices.includes(index),
          sorted: sortedIndices.includes(index),
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Data
const array = ref([]);
const selectedAlgorithm = ref("bubbleSort");
const isSorting = ref(false);
const comparingIndices = ref([]);
const sortedIndices = ref([]);
const animationSpeed = ref(50); // ms

// Add this new ref to track if sorting should stop
const shouldStop = ref(false);
const stopSorting = () => {
  shouldStop.value = true;
  sortedIndices.value = []; // Clear any sorted indices
  comparingIndices.value = []; // Clear comparing indices
};

// Create a wrapper function for all sorting algorithms
async function runSortingAlgorithm(algorithm) {
  shouldStop.value = false;
  isSorting.value = true;
  sortedIndices.value = [];

  try {
    while (!shouldStop.value) {
      const done = await algorithm();
      if (done) break; // If algorithm completes, exit loop
    }
  } finally {
    isSorting.value = false;
  }
}

// Initialize array on mount
onMounted(() => {
  resetArray();
});

// Methods
const resetArray = () => {
  isSorting.value = false;
  comparingIndices.value = [];
  sortedIndices.value = [];

  // Generate random array
  const minVal = 5;
  const maxVal = 500;
  const arraySize = Math.floor(window.innerWidth / 10); // Adjust based on screen width

  array.value = Array.from(
    { length: arraySize },
    () => Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal,
  );
};

const getBarColor = (index) => {
  if (sortedIndices.value.includes(index)) return "#4CAF50"; // Green for sorted
  if (comparingIndices.value.includes(index)) return "#FF5722"; // Orange for comparing
  return "#2196F3"; // Blue for default
};

const startSorting = async () => {
  if (isSorting.value) return;

  switch (selectedAlgorithm.value) {
    case "bubbleSort":
      await runSortingAlgorithm(bubbleSort);
      break;
    case "selectionSort":
      await runSortingAlgorithm(selectionSort);
      break;
    case "mergeSort":
      await runSortingAlgorithm(mergeSort);
      break;
    case "quickSort":
      await runSortingAlgorithm(quickSort);
      break;
    case "insertionSort":
      await runSortingAlgorithm(insertionSort);
      break;
    default:
      await runSortingAlgorithm(bubbleSort);
  }
};

// Sorting algorithms
const bubbleSort = async () => {
  const arr = [...array.value];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (shouldStop.value) return;
      comparingIndices.value = [j, j + 1];

      // Highlight comparing bars
      await sleep(animationSpeed.value);

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        array.value = [...arr];
        await sleep(animationSpeed.value);
      }
    }
    sortedIndices.value.push(n - i - 1);
  }
  sortedIndices.value.push(0); // The first element is also sorted
  return true;
};

const selectionSort = async () => {
  const arr = [...array.value];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      if (shouldStop.value) return;
      comparingIndices.value = [minIdx, j];
      await sleep(animationSpeed.value);

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      array.value = [...arr];
      await sleep(animationSpeed.value);
    }

    sortedIndices.value.push(i);
  }
  sortedIndices.value.push(n - 1); // Last element is sorted

  return true;
};

const insertionSort = async () => {
  const arr = [...array.value];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    if (shouldStop.value) return false;

    let key = arr[i];
    let j = i - 1;

    // Highlight the elements being compared
    comparingIndices.value = [i, j];
    await sleep(animationSpeed.value);

    // Move elements greater than key to one position ahead
    while (j >= 0 && arr[j] > key) {
      if (shouldStop.value) return false;

      arr[j + 1] = arr[j];
      array.value = [...arr]; // Update visualization
      comparingIndices.value = [j + 1, j];
      await sleep(animationSpeed.value);

      j = j - 1;
    }

    arr[j + 1] = key;
    array.value = [...arr]; // Final position of key
    await sleep(animationSpeed.value);

    // Mark the current position as partially sorted
    sortedIndices.value.push(i);
  }

  // Mark all as sorted when done
  sortedIndices.value = Array.from({ length: n }, (_, i) => i);
  return true;
};

const mergeSort = async () => {
  isSorting.value = true;
  const arr = [...array.value];
  try {
    await mergeSortHelper(arr, 0, arr.length - 1);
    // Only mark complete if not stopped
    if (!shouldStop.value) {
      sortedIndices.value = Array.from(
        { length: array.value.length },
        (_, i) => i,
      );
    }
  } finally {
    isSorting.value = false;
  }
  return true;
};

const mergeSortHelper = async (arr, left, right) => {
  if (left >= right || shouldStop.value) return;

  const middle = Math.floor((left + right) / 2);

  comparingIndices.value = [left, right];
  await sleep(animationSpeed.value);

  await mergeSortHelper(arr, left, middle);
  if (shouldStop.value) return;

  await mergeSortHelper(arr, middle + 1, right);
  if (shouldStop.value) return;

  await merge(arr, left, middle, right);
};

const merge = async (arr, left, middle, right) => {
  const n1 = middle - left + 1;
  const n2 = right - middle;

  // Create temp arrays
  const L = new Array(n1);
  const R = new Array(n2);

  // Copy data to temp arrays
  for (let i = 0; i < n1; i++) {
    L[i] = arr[left + i];
  }
  for (let j = 0; j < n2; j++) {
    R[j] = arr[middle + 1 + j];
  }

  // Merge the temp arrays back
  let i = 0,
    j = 0,
    k = left;

  while (i < n1 && j < n2) {
    // Highlight the elements being compared
    comparingIndices.value = [left + i, middle + 1 + j];
    await sleep(animationSpeed.value);

    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }

    // Update visualization
    array.value = [...arr];
    await sleep(animationSpeed.value);
    k++;
  }

  // Copy remaining elements of L[]
  while (i < n1) {
    arr[k] = L[i];
    array.value = [...arr];
    await sleep(animationSpeed.value);
    i++;
    k++;
  }

  // Copy remaining elements of R[]
  while (j < n2) {
    arr[k] = R[j];
    array.value = [...arr];
    await sleep(animationSpeed.value);
    j++;
    k++;
  }

  // Mark this section as being processed
  for (let x = left; x <= right; x++) {
    sortedIndices.value.push(x);
    await sleep(animationSpeed.value / 2);
  }
};

const quickSort = async () => {
  isSorting.value = true;
  sortedIndices.value = [];
  const arr = [...array.value];
  try {
    await quickSortHelper(arr, 0, arr.length - 1);
    if (!shouldStop.value) {
      sortedIndices.value = Array.from(
        { length: array.value.length },
        (_, i) => i,
      );
    }
  } finally {
    isSorting.value = false;
  }
  return true;
};

const quickSortHelper = async (arr, low, high) => {
  if (low < high) {
    // Visualize the current partition range
    if (shouldStop.value) {
      sortedIndices.value = [];
      return;
    }
    comparingIndices.value = [low, high];
    await sleep(animationSpeed.value);

    // pi is partitioning index
    const pi = await partition(arr, low, high);

    // Mark the pivot as sorted
    sortedIndices.value.push(pi);

    // Recursively sort elements before and after partition
    if (shouldStop.value) {
      sortedIndices.value = [];
      return;
    }
    await quickSortHelper(arr, low, pi - 1);
    if (shouldStop.value) {
      sortedIndices.value = [];
      return;
    }
    await quickSortHelper(arr, pi + 1, high);
  }

  // Mark single elements as sorted
  if (shouldStop.value) {
    sortedIndices.value = [];
    return;
  }
  if (low === high) {
    sortedIndices.value.push(low);
  }
};

const partition = async (arr, low, high) => {
  // Choose the rightmost element as pivot
  const pivot = arr[high];

  // Highlight the pivot
  comparingIndices.value = [high];
  if (shouldStop.value) {
    sortedIndices.value = [];
    return;
  }
  await sleep(animationSpeed.value);

  // Index of smaller element
  let i = low - 1;

  if (shouldStop.value) {
    sortedIndices.value = [];
    return;
  }
  for (let j = low; j < high; j++) {
    // Highlight elements being compared
    comparingIndices.value = [j, high];
    await sleep(animationSpeed.value);

    // If current element is smaller than the pivot
    if (arr[j] < pivot) {
      i++; // increment index of smaller element

      // Swap arr[i] and arr[j]
      [arr[i], arr[j]] = [arr[j], arr[i]];
      array.value = [...arr];

      if (shouldStop.value) {
        sortedIndices.value = [];
        return;
      }
      await sleep(animationSpeed.value);
    }
  }

  // Swap arr[i+1] and arr[high] (or pivot)
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  array.value = [...arr];
  await sleep(animationSpeed.value);

  return i + 1;
};

// Helper function
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
</script>

<style scoped>
.sorting-visualizer {
  font-family: Arial, sans-serif;
  max-width: 100%;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.array-container {
  display: flex;
  align-items: flex-end;
  height: 500px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.array-bar {
  width: 8px;
  margin: 0 1px;
  transition: all 0.1s ease;
}

.array-bar.comparing {
  background-color: #ff5722 !important;
}

.array-bar.sorted {
  background-color: #4caf50 !important;
}
</style>
