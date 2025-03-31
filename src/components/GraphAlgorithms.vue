<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
const containerWidth = ref(1200);
const containerHeight = ref(600);
const treeDepth = ref(3);
const nodes = reactive([]);
const edges = reactive([]);
const isRunning = ref(false);
const selectedAlgorithm = ref('BFS');
const startNode = ref(null);
const endNode = ref(null);
const selectingStart = ref(false);
const selectingEnd = ref(false);

const algorithmInfo = computed(() => {
  const info = {
    'BFS': 'Time Complexity: O(n) - Explores level by level',
    'DFS': 'Time Complexity: O(n) - Explores depth first',
    'In-Order': 'Time Complexity: O(n) - Left, Root, Right',
    'Pre-Order': 'Time Complexity: O(n) - Root, Left, Right',
    'Post-Order': 'Time Complexity: O(n) - Left, Right, Root',
    'Dijkstra': 'Finds shortest path between two nodes (weighted graph)',
    'Prim': 'Finds Minimum Spanning Tree (greedy, starts from root)',
    'Kruskal': 'Finds Minimum Spanning Tree (uses union-find)'
  };
  return info[selectedAlgorithm.value];
});

function calculateTreeLayout() {
  nodes.splice(0);
  edges.splice(0);

  const maxDepth = treeDepth.value;
  const nodePositions = [];
  const horizontalSpacing = containerWidth.value / (Math.pow(2, maxDepth - 1) + 1);
  const verticalSpacing = containerHeight.value / (maxDepth + 1);

  // Create nodes with positions
  let nodeId = 0;
  for (let depth = 0; depth < maxDepth; depth++) {
    const levelNodes = Math.pow(2, depth);
    const yPosition = (depth + 1) * verticalSpacing;

    for (let i = 0; i < levelNodes; i++) {
      const xPosition = (i + 1) * (containerWidth.value / (levelNodes + 1));
      nodes.push({
        id: nodeId++,
        value: Math.floor(Math.random() * 100),
        x: xPosition,
        y: yPosition,
        visited: false,
        current: false,
        depth: depth,
        children: []
      });
    }
  }

  // Create edges (parent-child relationships)
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].depth >= maxDepth - 1) continue;

    const children = [
      nodes[2 * i + 1],
      nodes[2 * i + 2]
    ].filter(child => child);

// In calculateTreeLayout() function, modify edge creation:
children.forEach(child => {
  edges.push({
    from: nodes[i].id,
    to: child.id,
    weight: Math.floor(Math.random() * 9 + 1), // Add random weight between 1-10
    visited: false,
    inPath: false
  });
  nodes[i].children.push(child.id);
});
  }
}

function selectStartNode() {
  selectingStart.value = true;
  selectingEnd.value = false;
}

function selectEndNode() {
  selectingEnd.value = true;
  selectingStart.value = false;
}

function handleNodeClick(node) {
  if (selectingStart.value) {
    startNode.value = node.id;
    selectingStart.value = false;
  } else if (selectingEnd.value) {
    endNode.value = node.id;
    selectingEnd.value = false;
  }
}

function resetTree() {
  startNode.value = null;
  endNode.value = null;
  calculateTreeLayout();
}

// Dijkstra's Algorithm implementation
async function dijkstra() {
  // Validate node selection
  if (startNode.value === null || endNode.value === null) {
    alert('Please select both start and end nodes');
    isRunning.value = false;
    return;
  }

  // Initialize distances and previous nodes
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(nodes.map(n => n.id));

  nodes.forEach(node => {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  });
  distances.set(startNode.value, 0);

  while (unvisited.size > 0) {
    // Find node with smallest distance
    let currentId = -1;
    let minDistance = Infinity;
    unvisited.forEach(id => {
      if (distances.get(id) < minDistance) {
        minDistance = distances.get(id);
        currentId = id;
      }
    });

    // If no reachable nodes left, break
    if (currentId === -1) break;

    const currentNode = nodes.find(n => n.id === currentId);

    // Visualization updates
    currentNode.current = true;
    await delay(1000);

    // Check if we've reached the target
    if (currentId === endNode.value) break;

    // Process neighbors
    const neighbors = edges.filter(e => e.from === currentId);
    for (const edge of neighbors) {
      const alt = distances.get(currentId) + edge.weight;
      if (alt < distances.get(edge.to)) {
        distances.set(edge.to, alt);
        previous.set(edge.to, currentId);
      }
      edge.visited = true;
      await delay(500);
    }

    unvisited.delete(currentId);
    currentNode.current = false;
    currentNode.visited = true;
  }

  // Highlight shortest path
  let pathNode = endNode.value;
  while (pathNode !== null) {
    const prevNode = previous.get(pathNode);
    if (prevNode === null) break;

    const edge = edges.find(e => e.from === prevNode && e.to === pathNode);
    if (edge) {
      edge.inPath = true;
      await delay(500);
    }
    pathNode = prevNode;
  }
}

// Prim's Algorithm implementation
async function prim() {
  const visited = new Set();
  visited.add(nodes[0].id);

  // Reset all edges first
  edges.forEach(edge => edge.inPath = false);

  while (visited.size < nodes.length) {
    // Find edges that cross the visited/unvisited boundary
    const candidateEdges = edges.filter(edge => 
      visited.has(edge.from) !== visited.has(edge.to) // Fixed missing parenthesis
    );

    if (candidateEdges.length === 0) break;

    // Find minimum weight edge
    const minEdge = candidateEdges.reduce((a, b) => 
      a.weight < b.weight ? a : b
    );

    // Update original edge reference
    const originalEdge = edges.find(e => 
      e.from === minEdge.from && e.to === minEdge.to
    );
    
    if (!originalEdge) continue;
    
    // Visual updates
    originalEdge.inPath = true;
    await delay(1000);

    // Add the unvisited node to visited set
    const newNodes = visited.has(originalEdge.from) 
      ? [originalEdge.to] 
      : [originalEdge.from];
    newNodes.forEach(n => visited.add(n));
  }
}

// Kruskal's Algorithm implementation
async function kruskal() {
  const parent = {};
  nodes.forEach(node => parent[node.id] = node.id);

  // Create a copy of edges sorted by weight
  const edgesCopy = edges.map(edge => ({ ...edge })).sort((a, b) => a.weight - b.weight);

  // Reset all edges first
  edges.forEach(edge => edge.inPath = false);

  function find(u) {
    if (parent[u] !== u) {
      parent[u] = find(parent[u]); // Path compression
    }
    return parent[u];
  }

  function union(u, v) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
    }
  }

  for (const edge of edgesCopy) {
    if (find(edge.from) !== find(edge.to)) {
      // Update the original edge reference
      const originalEdge = edges.find(e =>
        e.from === edge.from && e.to === edge.to
      );
      originalEdge.inPath = true;
      union(edge.from, edge.to);
      await delay(1000);
    }
  }
}

function calculateEdgePath(edge) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  return `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
}

async function startAlgorithm() {
  isRunning.value = true;
  resetVisited();

  switch(selectedAlgorithm.value) {
    case 'BFS':
      await bfs();
      break;
    case 'DFS':
      await dfs();
      break;
    case 'In-Order':
      await inOrderTraversal(0);
      break;
    case 'Pre-Order':
      await preOrderTraversal(0);
      break;
    case 'Post-Order':
      await postOrderTraversal(0);
	  break;
    case 'Dijkstra':
      await dijkstra();
      break;
    case 'Prim':
      await prim();
      break;
    case 'Kruskal':
      await kruskal();
      break;
  }

  isRunning.value = false;
}

// Traversal implementations
async function bfs() {
  const queue = [];
  queue.push(nodes[0]);
  nodes[0].visited = true;

  while (queue.length > 0) {
    const currentNode = queue.shift();
    currentNode.current = true;
    await delay(1000);

    for (const childId of currentNode.children) {
      const child = nodes.find(n => n.id === childId);
      if (!child.visited) {
        child.visited = true;
		const edge = edges.find(e => e.to === currentNode.id);
		if (edge) edge.visited = true;
        queue.push(child);
        await delay(500);
      }
    }

    currentNode.current = false;
  }
}

async function dfs() {
  const stack = [];
  stack.push(nodes[0]);

  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (currentNode.visited) continue;

    currentNode.visited = true;
    currentNode.current = true;

    // Fixed code:
    const edge = edges.find(e => e.to === currentNode.id);
    if (edge) edge.visited = true;

    await delay(1000);

    for (const childId of [...currentNode.children].reverse()) {
      stack.push(nodes.find(n => n.id === childId));
    }

    currentNode.current = false;
  }
}

async function inOrderTraversal(nodeIndex) {
  const node = nodes[nodeIndex];
  if (!node) return;

  const [left, right] = node.children;

  if (left) await inOrderTraversal(nodes.findIndex(n => n.id === left));
  node.current = true;
  node.visited = true;
  await delay(1000);
  node.current = false;
  if (right) await inOrderTraversal(nodes.findIndex(n => n.id === right));
}

async function preOrderTraversal(nodeIndex) {
  const node = nodes[nodeIndex];
  if (!node) return;

  node.current = true;
  node.visited = true;
  await delay(1000);
  node.current = false;

  for (const childId of node.children) {
    await preOrderTraversal(nodes.findIndex(n => n.id === childId));
  }
}

async function postOrderTraversal(nodeIndex) {
  const node = nodes[nodeIndex];
  if (!node) return;

  node.current = true;
  await delay(500);

  for (const childId of node.children) {
    await postOrderTraversal(nodes.findIndex(n => n.id === childId));
  }

  node.visited = true;
  await delay(1000);
  node.current = false;
}

function resetVisited() {
  nodes.forEach(node => {
    node.visited = false;
    node.current = false;
  });
  edges.forEach(edge => edge.visited = false);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

onMounted(calculateTreeLayout);
</script>

<template>
  <div class="main-container">
    <!-- Algorithm Panel -->
    <div class="algorithm-panel">
      <h3>Tree Algorithms</h3>
      <select v-model="selectedAlgorithm" class="algorithm-select">
        <option>BFS</option>
        <option>DFS</option>
        <option>In-Order</option>
        <option>Pre-Order</option>
        <option>Post-Order</option>
        <option>Dijkstra</option>
        <option>Prim</option>
        <option>Kruskal</option>
      </select>
      <div class="complexity-info">
        <h4>Algorithm Info</h4>
        <p>{{ algorithmInfo }}</p>
      </div>

      <div v-if="selectedAlgorithm === 'Dijkstra'" class="node-selection">
        <button @click="selectStartNode">Set Start Node</button>
        <button @click="selectEndNode">Set End Node</button>
        <div v-if="startNode !== null">Start: Node {{ startNode }}</div>
        <div v-if="endNode !== null">End: Node {{ endNode }}</div>
      </div>
    </div>

    <!-- Main Visualization -->
    <div class="visualization-container">
      <div class="controls">
        <button @click="startAlgorithm" :disabled="isRunning">Start</button>
        <button @click="resetTree" :disabled="isRunning">Reset</button>
        <label
          >Tree Depth:
          <input v-model.number="treeDepth" type="number" min="2" max="5"
        /></label>
      </div>

      <svg
        :width="containerWidth"
        :height="containerHeight"
        class="tree-container"
      >
        <!-- Edges -->
        <path
          v-for="(edge, index) in edges"
          :key="index"
          :d="calculateEdgePath(edge)"
          class="edge"
          :class="{ visited: edge.visited, 'in-path': edge.inPath }"
        />

        <!-- Nodes -->
        <circle
          v-for="node in nodes"
          :key="node.id"
          :cx="node.x"
          :cy="node.y"
          r="20"
          class="node"
          :class="{
            visited: node.visited,
            current: node.current,
            start: node.id === startNode,
            end: node.id === endNode,
          }"
          @click="handleNodeClick(node)"
        >
          <title>{{ node.value }}</title>
        </circle>

        <!-- Node Labels -->
        <text
          v-for="node in nodes"
          :key="'text-' + node.id"
          :x="node.x"
          :y="node.y"
          class="node-label"
          text-anchor="middle"
          dy=".3em"
        >
          {{ node.value }}
        </text>

        <!-- Edge Weights -->
        <text
          v-for="edge in edges"
          :key="'weight-' + edge.from + '-' + edge.to"
          :x="
            (nodes.find((n) => n.id === edge.from).x +
              nodes.find((n) => n.id === edge.to).x) /
            2
          "
          :y="
            (nodes.find((n) => n.id === edge.from).y +
              nodes.find((n) => n.id === edge.to).y) /
            2
          "
          class="edge-weight"
        >
          {{ edge.weight }}
        </text>
      </svg>
    </div>
  </div>
</template>


<style>
.main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100vh;
}

.algorithm-panel {
  padding: 20px;
  background: #f5f6fa;
  border-right: 2px solid #dcdde1;
  height: 100vh;
  overflow-y: auto;
}

.visualization-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.tree-container {
  border: 1px solid #dcdde1;
  background: white;
}

.node {
  fill: #487eb0;
  stroke: #2c3e50;
  stroke-width: 2;
  transition: fill 0.3s;
}

.node.visited {
  fill: #e1b12c;
}

.node.current {
  fill: #c23616;
}

.edge {
  stroke: #718093;
  stroke-width: 2;
  fill: none;
}

.edge.visited {
  stroke: #e1b12c;
  stroke-width: 3;
}

.node-label {
  fill: white;
  font-weight: bold;
  pointer-events: none;
}

.complexity-info {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.algorithm-select {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
}

.node.start {
  fill: #4cd137 !important;
}

.node.end {
  fill: #e84118 !important;
}

.edge.in-path {
  stroke: #4cd137;
  stroke-width: 4;
}

.edge-weight {
  fill: #2c3e50;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.node-selection {
  margin: 15px 0;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
}
</style>
