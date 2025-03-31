<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue"; // Added watch

const containerWidth = ref(1200);
const containerHeight = ref(600);
const treeDepth = ref(3); // Keep for tree algorithms
const nodes = reactive([]);
const edges = reactive([]);
const isRunning = ref(false);
const selectedAlgorithm = ref("BFS");
const startNode = ref(null); // ID of the start node
const endNode = ref(null); // ID of the end node
const selectingStart = ref(false);
const selectingEnd = ref(false);

// Define which algorithms operate on graphs
const graphAlgorithms = ["Dijkstra", "BFS", "DFS", "Prim", "Kruskal"]; // Added Prim/Kruskal
const treeAlgorithms = ["In-Order", "Pre-Order", "Post-Order"];

// --- Computed Properties ---

// Determines if the selected algorithm is graph-based
const isGraphAlgorithm = computed(() =>
  graphAlgorithms.includes(selectedAlgorithm.value),
);

// Determines if the selected algorithm requires a start node
const needsStartNode = computed(() =>
  ["BFS", "DFS", "Dijkstra", "Prim"].includes(selectedAlgorithm.value), // Prim often starts at a node
);

// Determines if the selected algorithm requires an end node
const needsEndNode = computed(() =>
  ["Dijkstra"].includes(selectedAlgorithm.value),
);

// --- Configuration ---

const graphConfig = reactive({
  nodeCount: 10,
  edgeProbability: 0.3,
});

// --- Initialization and Reset ---

// Watch for algorithm changes to reset the visualization
watch(selectedAlgorithm, () => {
  resetVisualization(); // Reset when algorithm type changes
});

// Watch for config changes to reset the graph/tree
watch(graphConfig, () => {
  if (isGraphAlgorithm.value) {
    resetVisualization();
  }
}, { deep: true });

watch(treeDepth, () => {
  if (!isGraphAlgorithm.value) {
    resetVisualization();
  }
});


// Resets node/edge visual states (visited, current, path) and selections
function clearVisualState() {
  nodes.forEach((node) => {
    node.visited = false;
    node.current = false;
    // Keep start/end node visual indication if they are selected
  });
  edges.forEach((edge) => {
    edge.visited = false;
    edge.inPath = false;
  });
  isRunning.value = false; // Ensure running state is reset
}

// Resets the entire visualization (structure and state)
function resetVisualization() {
  clearVisualState(); // Clear highlights and running state first
  startNode.value = null;
  endNode.value = null;
  selectingStart.value = false;
  selectingEnd.value = false;

  if (isGraphAlgorithm.value) {
    initializeGraph();
  } else {
    calculateTreeLayout();
  }
}


function initializeGraph() {
  nodes.splice(0); // Clear existing nodes
  edges.splice(0); // Clear existing edges

  // Create nodes with random positions
  for (let i = 0; i < graphConfig.nodeCount; i++) {
    nodes.push({
      id: i,
      value: i, // Use ID as value for simplicity, or keep random
      x: Math.random() * (containerWidth.value - 40) + 20, // Add padding
      y: Math.random() * (containerHeight.value - 40) + 20, // Add padding
      visited: false,
      current: false,
    });
  }

  // Create random edges (ensure graph is likely connected for smaller node counts)
  const createdEdges = new Set();
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < graphConfig.edgeProbability) {
        const weight = Math.floor(Math.random() * 9 + 1);
        const edgeKey1 = `${i}-${j}`;
        const edgeKey2 = `${j}-${i}`;

        if (!createdEdges.has(edgeKey1)) {
           // Add bidirectional edges
          edges.push({ from: i, to: j, weight, visited: false, inPath: false });
          edges.push({ from: j, to: i, weight, visited: false, inPath: false }); // Add reverse for lookups if needed by algos
          createdEdges.add(edgeKey1);
          createdEdges.add(edgeKey2);
        }
      }
    }
  }

  // Optional: Add logic to ensure graph connectivity if needed,
  // e.g., by ensuring node 0 connects to node 1, 1 to 2 etc., then add random edges.
}

function calculateTreeLayout() {
  nodes.splice(0);
  edges.splice(0);

  const maxDepth = treeDepth.value;
  //const horizontalSpacing = containerWidth.value / (Math.pow(2, maxDepth - 1) + 1); // Can simplify positioning
  const verticalSpacing = containerHeight.value / (maxDepth + 1);

  let nodeId = 0;
  for (let depth = 0; depth < maxDepth; depth++) {
    const levelNodes = Math.pow(2, depth);
    const yPosition = (depth + 1) * verticalSpacing;

    for (let i = 0; i < levelNodes; i++) {
      // Calculate x based on position within the level
      const levelWidth = containerWidth.value * 0.8; // Use 80% of width
      const startX = containerWidth.value * 0.1;
      const xSpacing = levelWidth / (levelNodes + 1);
      const xPosition = startX + (i + 1) * xSpacing;

      nodes.push({
        id: nodeId++,
        value: Math.floor(Math.random() * 100),
        x: xPosition,
        y: yPosition,
        visited: false,
        current: false,
        depth: depth,
        children: [], // Store child IDs
      });
    }
  }

  // Create edges (parent-child relationships)
  let currentNodeIndex = 0;
  for (let depth = 0; depth < maxDepth - 1; depth++) {
    const levelNodes = Math.pow(2, depth);
    for (let i = 0; i < levelNodes; i++) {
        const parentNode = nodes[currentNodeIndex];
        const leftChildIndex = 2 * currentNodeIndex + 1;
        const rightChildIndex = 2 * currentNodeIndex + 2;

        if (nodes[leftChildIndex]) {
            const child = nodes[leftChildIndex];
            edges.push({ from: parentNode.id, to: child.id, weight: Math.floor(Math.random() * 9 + 1), visited: false, inPath: false });
            parentNode.children.push(child.id);
        }
        if (nodes[rightChildIndex]) {
            const child = nodes[rightChildIndex];
            edges.push({ from: parentNode.id, to: child.id, weight: Math.floor(Math.random() * 9 + 1), visited: false, inPath: false });
             parentNode.children.push(child.id);
        }
        currentNodeIndex++;
    }
  }
}


// --- Node Selection ---

function selectStartNode() {
  if (isRunning.value) return;
  selectingStart.value = true;
  selectingEnd.value = false;
  // Clear previous selection visually if desired
  // if (startNode.value !== null) nodes.find(n => n.id === startNode.value).isStart = false;
}

function selectEndNode() {
  if (isRunning.value) return;
  selectingEnd.value = true;
  selectingStart.value = false;
  // Clear previous selection visually if desired
  // if (endNode.value !== null) nodes.find(n => n.id === endNode.value).isEnd = false;
}

function handleNodeClick(node) {
  if (isRunning.value) return;

  if (selectingStart.value) {
    // Deselect previous start node if any
    if (startNode.value !== null && startNode.value !== node.id) {
       // Optional: Add specific visual state for selection if needed
    }
     if (node.id === endNode.value) endNode.value = null; // Cannot be start and end
    startNode.value = node.id;
    selectingStart.value = false;
  } else if (selectingEnd.value) {
    // Deselect previous end node if any
    if (endNode.value !== null && endNode.value !== node.id) {
       // Optional: Add specific visual state for selection if needed
    }
     if (node.id === startNode.value) startNode.value = null; // Cannot be start and end
    endNode.value = node.id;
    selectingEnd.value = false;
  }
}

// --- Algorithms ---

const delayTime = ref(500); // Control animation speed

function delay(ms) {
  // Adjust delay based on ref value
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// BFS Implementation (Graph) - Requires Start Node
async function bfs() {
  if (startNode.value === null) {
    alert("Please select a start node for BFS.");
    return false; // Indicate failure
  }

  const startNodeObj = nodes.find(n => n.id === startNode.value);
  if (!startNodeObj) return false; // Should not happen

  const queue = [startNodeObj];
  startNodeObj.visited = true;
  startNodeObj.current = true; // Mark start as current initially
  await delay(delayTime.value);
  startNodeObj.current = false;

  const visitedEdges = new Set(); // Track visited edges to avoid double highlighting

  while (queue.length > 0) {
    const currentNode = queue.shift();
    currentNode.current = true;
    await delay(delayTime.value);

    // Find neighbors using the edges array
    const neighborEdges = edges.filter(e => e.from === currentNode.id);

    for (const edge of neighborEdges) {
        const neighborNode = nodes.find(n => n.id === edge.to);

        if (neighborNode && !neighborNode.visited) {
            neighborNode.visited = true;
            // Mark edge as visited (use a unique key for bidirectional)
            const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
            if (!visitedEdges.has(edgeKey)) {
                // Find both directions of the edge to mark visited
                const edgePair = edges.filter(e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from));
                edgePair.forEach(ep => ep.visited = true);
                visitedEdges.add(edgeKey);
                await delay(delayTime.value / 2); // Shorter delay for edge highlight
            }
            queue.push(neighborNode);
        }
    }
    currentNode.current = false;
  }
  return true; // Indicate success
}


// DFS Implementation (Graph) - Requires Start Node
async function dfs() {
    if (startNode.value === null) {
        alert("Please select a start node for DFS.");
        return false; // Indicate failure
    }

    const startNodeObj = nodes.find(n => n.id === startNode.value);
    if (!startNodeObj) return false;

    const stack = [startNodeObj]; // Use stack for DFS
    const visitedOrder = []; // Keep track of visit order if needed
    const visitedEdges = new Set(); // Track visited edges

    while (stack.length > 0) {
        const currentNode = stack.pop();

        if (currentNode.visited) continue; // Skip if already visited via another path

        currentNode.visited = true;
        currentNode.current = true;
        visitedOrder.push(currentNode.id);
        await delay(delayTime.value);


        // Find neighbors (consider reversing for typical stack-based DFS order)
        const neighborEdges = edges.filter(e => e.from === currentNode.id); //.reverse();

        for (const edge of neighborEdges) {
            const neighborNode = nodes.find(n => n.id === edge.to);

            if (neighborNode && !neighborNode.visited) {
                // Mark edge as visited
                 const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
                 if (!visitedEdges.has(edgeKey)) {
                    const edgePair = edges.filter(e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from));
                    edgePair.forEach(ep => ep.visited = true);
                    visitedEdges.add(edgeKey);
                    await delay(delayTime.value / 2);
                 }
                stack.push(neighborNode); // Push unvisited neighbors onto stack
            }
        }
        currentNode.current = false; // Move off current node after exploring neighbors
    }
    return true; // Indicate success
}

// Dijkstra's Algorithm implementation - Requires Start and End Nodes
async function dijkstra() {
  if (startNode.value === null || endNode.value === null) {
    alert("Please select both start and end nodes for Dijkstra.");
    return false;
  }
   if (startNode.value === endNode.value) {
    alert("Start and end nodes cannot be the same.");
    return false;
  }

  const distances = new Map();
  const previous = new Map();
  const pq = new Map(); // Use Map as a simple Priority Queue {id: distance}

  nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    pq.set(node.id, Infinity); // Initialize priority queue
  });

  distances.set(startNode.value, 0);
  pq.set(startNode.value, 0); // Set start node distance

  while (pq.size > 0) {
    // Get node with the smallest distance from pq
    let currentId = -1;
    let minDistance = Infinity;
    for (let [id, dist] of pq.entries()) {
        if (dist < minDistance) {
            minDistance = dist;
            currentId = id;
        }
    }

    // If no reachable nodes left or reached destination with finite distance
    if (currentId === -1 || minDistance === Infinity) break;

    pq.delete(currentId); // Remove current node from priority queue

    const currentNode = nodes.find((n) => n.id === currentId);
    if (!currentNode) continue; // Should not happen


    // Visualization: Mark current node
    currentNode.current = true;
    await delay(delayTime.value);

    // If we reached the end node, we can potentially stop early (optional)
    // if (currentId === endNode.value) break;

     currentNode.visited = true; // Mark visited after processing neighbors


    // Process neighbors
    const neighborEdges = edges.filter((e) => e.from === currentId);
    for (const edge of neighborEdges) {
      const neighborNode = nodes.find(n => n.id === edge.to);
      if (!neighborNode) continue; // Skip if neighbor doesn't exist

      // Mark edge as visited (considered)
      edge.visited = true; // Highlight edge being considered
      await delay(delayTime.value / 3);

      const alt = distances.get(currentId) + edge.weight;

      if (alt < distances.get(edge.to)) {
        distances.set(edge.to, alt);
        previous.set(edge.to, currentId);
        if (pq.has(edge.to)) { // Update priority in pq if it's still there
             pq.set(edge.to, alt);
        }

         // Visualization: Potentially show edge relaxation (e.g., different color temporarily)
      }
      // edge.visited = false; // Optional: Remove highlight after consideration if desired
    }

    currentNode.current = false; // Unmark current after processing neighbors
  }

  // Highlight the shortest path if found
  if (distances.get(endNode.value) !== Infinity) {
      let pathNodeId = endNode.value;
      while (pathNodeId !== null && pathNodeId !== startNode.value) {
          const prevNodeId = previous.get(pathNodeId);
          if (prevNodeId === null) break; // Should not happen if path exists

          // Find the specific edge used in the path
          const pathEdge = edges.find((e) => e.from === prevNodeId && e.to === pathNodeId);
           const pathEdgeReverse = edges.find((e) => e.from === pathNodeId && e.to === prevNodeId); // Find reverse too

          if (pathEdge) pathEdge.inPath = true;
          if (pathEdgeReverse) pathEdgeReverse.inPath = true; // Mark both directions inPath

          // Highlight the node in path (optional, already marked visited)
          // nodes.find(n => n.id === pathNodeId).inPath = true; // Need corresponding CSS class

          await delay(delayTime.value / 2);
          pathNodeId = prevNodeId;
      }
  } else {
      alert("End node is not reachable from the start node.");
  }

   return true; // Indicate success or completion
}


// --- Tree Traversal Stubs (Keep if needed, otherwise remove) ---
async function inOrderTraversal(nodeId) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;
  const children = node.children || [];
  const leftChildId = children.length > 0 ? children[0] : null;
  const rightChildId = children.length > 1 ? children[1] : null;

  if (leftChildId !== null) await inOrderTraversal(leftChildId);

  node.current = true;
  node.visited = true;
  await delay(delayTime.value);
  node.current = false;

  if (rightChildId !== null) await inOrderTraversal(rightChildId);
}

async function preOrderTraversal(nodeId) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  node.current = true;
  node.visited = true;
  await delay(delayTime.value);
  node.current = false;

  const children = node.children || [];
  for (const childId of children) {
    await preOrderTraversal(childId);
  }
}

async function postOrderTraversal(nodeId) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  const children = node.children || [];
  for (const childId of children) {
    await postOrderTraversal(childId);
  }

  node.current = true;
  node.visited = true;
  await delay(delayTime.value);
  node.current = false;
}

// --- Main Control ---

async function startAlgorithm() {
  if (isRunning.value) return; // Prevent multiple runs

  clearVisualState(); // Clear previous highlights before starting
  isRunning.value = true;
  let success = false;

  try {
      switch (selectedAlgorithm.value) {
          case "BFS":
              success = await bfs();
              break;
          case "DFS":
              success = await dfs();
              break;
          case "Dijkstra":
              success = await dijkstra();
              break;
          case "In-Order":
             if (nodes.length > 0) await inOrderTraversal(nodes[0].id);
             success = true;
              break;
          case "Pre-Order":
             if (nodes.length > 0) await preOrderTraversal(nodes[0].id);
              success = true;
              break;
          case "Post-Order":
              if (nodes.length > 0) await postOrderTraversal(nodes[0].id);
              success = true;
              break;
          // Add calls for Prim/Kruskal if implemented
          // case "Prim":
          //     success = await prim(); // Assuming prim returns boolean
          //     break;
          // case "Kruskal":
          //     success = await kruskal(); // Assuming kruskal returns boolean
          //      break;
      }
  } catch (error) {
      console.error("Algorithm execution failed:", error);
      alert("An error occurred during the algorithm execution.");
  } finally {
      isRunning.value = false; // Ensure isRunning is set to false
       // Optional: Display completion message based on 'success'
  }
}

// --- SVG Helpers ---

function calculateEdgePath(edge) {
  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);
  if (!fromNode || !toNode) return ""; // Handle cases where nodes might not be found yet
  return `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
}

// --- Lifecycle Hook ---
onMounted(() => {
  resetVisualization(); // Initialize based on the default selected algorithm
});
</script>

<template>
  <div class="main-container">
    <div class="algorithm-panel">
      <h3>Algorithm Visualizer</h3>

      <label for="algo-select">Select Algorithm:</label>
      <select id="algo-select" v-model="selectedAlgorithm" class="algorithm-select" :disabled="isRunning">
        <optgroup label="Graph Traversal">
          <option>BFS</option>
          <option>DFS</option>
        </optgroup>
        <optgroup label="Shortest Path">
          <option>Dijkstra</option>
        </optgroup>
         <optgroup label="Tree Traversal">
          <option>In-Order</option>
          <option>Pre-Order</option>
          <option>Post-Order</option>
        </optgroup>
         </select>

      <div v-if="isGraphAlgorithm" class="config-section graph-config">
        <h4>Graph Options</h4>
        <label>
          Node Count:
          <input
            v-model.number="graphConfig.nodeCount"
            type="number" min="3" max="30" :disabled="isRunning"
          />
        </label>
        <label>
          Edge Probability:
          <input
            v-model.number="graphConfig.edgeProbability"
            type="number" min="0.1" max="1" step="0.1" :disabled="isRunning"
          />
        </label>
      </div>
      <div v-else class="config-section tree-config">
         <h4>Tree Options</h4>
        <label>
          Tree Depth:
          <input v-model.number="treeDepth" type="number" min="2" max="5" :disabled="isRunning" />
        </label>
      </div>

       <div v-if="needsStartNode || needsEndNode" class="config-section node-selection">
          <h4>Node Selection</h4>
          <button v-if="needsStartNode" @click="selectStartNode" :disabled="isRunning || selectingStart" :class="{selecting: selectingStart}">
            {{ startNode !== null ? `Start: ${startNode}` : 'Select Start Node' }} {{ selectingStart ? '...' : '' }}
          </button>
           <button v-if="needsEndNode" @click="selectEndNode" :disabled="isRunning || selectingEnd" :class="{selecting: selectingEnd}">
             {{ endNode !== null ? `End: ${endNode}` : 'Select End Node' }} {{ selectingEnd ? '...' : '' }}
           </button>
           <p v-if="selectingStart || selectingEnd" class="selection-hint">Click on a node in the visualization.</p>
      </div>

      <div class="config-section speed-control">
        <h4>Speed</h4>
         <label>
             Delay (ms):
             <input type="range" v-model.number="delayTime" min="50" max="2000" step="50" :disabled="isRunning">
             <span>{{ delayTime }}ms</span>
         </label>
      </div>

      <div class="main-controls">
         <button @click="startAlgorithm" :disabled="isRunning || (needsStartNode && startNode === null) || (needsEndNode && endNode === null)">
            {{ isRunning ? 'Running...' : 'Start' }}
         </button>
         <button @click="resetVisualization" :disabled="isRunning">Reset</button>
      </div>

    </div>

    <div class="visualization-container">
      <svg
        :width="containerWidth"
        :height="containerHeight"
        class="visualization-svg"
      >
        <g class="edges">
           <path
             v-for="(edge, index) in edges"
             :key="'edge-' + index"
             :d="calculateEdgePath(edge)"
             class="edge"
             :class="{ visited: edge.visited, 'in-path': edge.inPath }"
           />
        </g>

<g class="edge-weights">
    <text
      v-for="(edge, index) in edges.filter((e, i) => i % 2 === 0)"
      :key="'weight-' + index"
      :x="(nodes.find(n => n.id === edge.from).x + nodes.find(n => n.id === edge.to).x) / 2"
      :y="(nodes.find(n => n.id === edge.from).y + nodes.find(n => n.id === edge.to).y) / 2"
      class="edge-weight">
      {{ edge.weight }}
    </text>
</g>

        <g class="nodes">
          <circle
            v-for="node in nodes"
            :key="'node-' + node.id"
            :cx="node.x"
            :cy="node.y"
            r="18" class="node"
            :class="{
              visited: node.visited,
              current: node.current,
              start: node.id === startNode,
              end: node.id === endNode,
            }"
            @click="handleNodeClick(node)"
          >
            <title>{{ `Node ID: ${node.id}\nValue: ${node.value}` }}</title> </circle>
        </g>

        <g class="node-labels">
           <text
             v-for="node in nodes"
             :key="'text-' + node.id"
             :x="node.x"
             :y="node.y"
             class="node-label"
             text-anchor="middle"
             dy=".3em"
           >
             {{ node.id }} </text>
         </g>
      </svg>
    </div>
  </div>
</template>

<style>
:root {
  --color-background: #f8f9fa;
  --color-panel: #e9ecef;
  --color-border: #dee2e6;
  --color-text: #212529;
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-node: #0d6efd; /* Bootstrap blue */
  --color-node-stroke: #0a58ca;
  --color-node-visited: #ffca2c; /* Yellowish */
  --color-node-current: #dc3545; /* Red */
  --color-node-start: #198754; /* Green */
  --color-node-end: #fd7e14; /* Orange */
  --color-edge: #6c757d; /* Gray */
  --color-edge-visited: #adb5bd;
  --color-edge-path: #198754; /* Green */
  --color-label: white;
  --color-weight: #495057;
}

body {
  margin: 0;
  font-family: sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
}

.main-container {
  display: grid;
  grid-template-columns: 280px 1fr; /* Fixed panel width */
  height: 100vh;
  overflow: hidden; /* Prevent body scroll */
}

.algorithm-panel {
  padding: 15px;
  background: var(--color-panel);
  border-right: 1px solid var(--color-border);
  height: 100vh;
  overflow-y: auto; /* Allow scrolling within panel */
  display: flex;
  flex-direction: column;
  gap: 15px; /* Spacing between sections */
}

.algorithm-panel h3, .algorithm-panel h4 {
    margin-top: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 5px;
}
.algorithm-panel h4 {
    margin-bottom: 8px;
    font-size: 1em;
}

.config-section label,
.config-section .main-controls,
.node-selection {
    display: flex;
    flex-direction: column;
    gap: 8px; /* Spacing within sections */
}
.config-section label input[type="number"],
.config-section label input[type="range"],
.algorithm-select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-sizing: border-box; /* Include padding in width */
}
.config-section label input[type="range"] {
    padding: 0;
}


.algorithm-select {
    margin-bottom: 10px;
}

button {
    padding: 8px 12px;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

button:hover:not(:disabled) {
    background-color: var(--color-node-stroke);
}

button:disabled {
    background-color: var(--color-secondary);
    cursor: not-allowed;
}

button.selecting {
    background-color: var(--color-node-current);
}

.selection-hint {
    font-size: 0.8em;
    color: var(--color-secondary);
    text-align: center;
    margin-top: 5px;
}


.visualization-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden; /* Prevent container overflow */
  background-color: white;
}

.visualization-svg {
  border: 1px solid var(--color-border);
  /* background: white; */ /* Moved to container */
  max-width: 100%;
  max-height: 100%;
}

/* SVG Elements */
.node {
  fill: var(--color-node);
  stroke: var(--color-node-stroke);
  stroke-width: 1.5;
  cursor: pointer;
  transition: fill 0.3s ease, stroke 0.3s ease;
}
.node:hover {
    stroke-width: 3;
}

.node.visited { fill: var(--color-node-visited); }
.node.current { fill: var(--color-node-current); stroke: #a02a1a; stroke-width: 2.5; }
.node.start { fill: var(--color-node-start) !important; } /* Use !important to override other states */
.node.end { fill: var(--color-node-end) !important; }

.edge {
  stroke: var(--color-edge);
  stroke-width: 2;
  fill: none;
  transition: stroke 0.3s ease, stroke-width 0.3s ease;
}

.edge.visited { stroke: var(--color-edge-visited); stroke-width: 2.5; }
.edge.in-path { stroke: var(--color-edge-path); stroke-width: 4; }

.node-label {
  fill: var(--color-label);
  font-size: 10px;
  font-weight: bold;
  pointer-events: none; /* Prevent labels from interfering with clicks */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Improve readability */
}

.edge-weight {
  fill: var(--color-weight);
  font-size: 10px;
  font-weight: normal;
  pointer-events: none;
  text-anchor: middle;
}

.speed-control label {
    flex-direction: row;
    align-items: center;
    gap: 10px;
}
.speed-control input[type="range"] {
    flex-grow: 1;
}
.speed-control span {
    min-width: 40px; /* Ensure space for text */
    text-align: right;
}

</style>
