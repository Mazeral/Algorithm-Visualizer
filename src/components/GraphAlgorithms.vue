<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue"; // Added nextTick

const viewBox = ref("0 0 1200 600"); // Define SVG coordinate system

const treeDepth = ref(3);
const nodes = reactive([]);
const edges = reactive([]);
const isRunning = ref(false);
const selectedAlgorithm = ref("BFS");
const startNode = ref(null);
const endNode = ref(null);
const selectingStart = ref(false);
const selectingEnd = ref(false);

const graphAlgorithms = ["Dijkstra", "BFS", "DFS", "Prim", "Kruskal"];
const treeAlgorithms = ["In-Order", "Pre-Order", "Post-Order"];

// --- Computed Properties ---
const isGraphAlgorithm = computed(() => graphAlgorithms.includes(selectedAlgorithm.value));
const needsStartNode = computed(() => ["BFS", "DFS", "Dijkstra", "Prim"].includes(selectedAlgorithm.value));
const needsEndNode = computed(() => ["Dijkstra"].includes(selectedAlgorithm.value));

// --- Configuration ---
const graphConfig = reactive({
    nodeCount: 12, // Adjusted default
    edgeProbability: 0.25, // Adjusted default
});
const layoutConfig = reactive({ // Configuration for force layout
    iterations: 100,
    repulsion: 2500, // Force pushing nodes apart
    stiffness: 0.003, // Spring stiffness for edges
    damping: 0.7, // Slows down movement
    padding: 0.1 // Keep nodes away from edges
});

// --- Initialization and Reset ---
watch(selectedAlgorithm, () => { resetVisualization(); });
watch(graphConfig, () => { if (isGraphAlgorithm.value) resetVisualization(); }, { deep: true });
watch(treeDepth, () => { if (!isGraphAlgorithm.value) resetVisualization(); });

function clearVisualState() {
    nodes.forEach((node) => {
        node.visited = false;
        node.current = false;
    });
    edges.forEach((edge) => {
        edge.visited = false;
        edge.inPath = false;
    });
    isRunning.value = false;
}

async function resetVisualization() {
    clearVisualState();
    startNode.value = null;
    endNode.value = null;
    selectingStart.value = false;
    selectingEnd.value = false;

    // Use nextTick to ensure DOM is updated before layout calculations if needed
    await nextTick();

    if (isGraphAlgorithm.value) {
        initializeGraph();
        // Apply layout improvements after nodes/edges exist
        await nextTick(); // Wait for nodes/edges to render in reactive arrays
        applyForceLayout();
    } else {
        calculateTreeLayout();
    }
}

// --- Graph Generation ---

function initializeGraph() {
    nodes.splice(0);
    edges.splice(0);

    // Get current SVG dimensions from viewBox for positioning
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.value.split(" ").map(Number);
    const padding = layoutConfig.padding;


    // 1. Create nodes with random initial positions
    for (let i = 0; i < graphConfig.nodeCount; i++) {
        nodes.push({
            id: i,
            value: i,
            x: Math.random() * (vbWidth - 2 * padding) + padding,
            y: Math.random() * (vbHeight - 2 * padding) + padding,
            visited: false,
            current: false,
            // For force layout:
            vx: 0, // velocity x
            vy: 0, // velocity y
            fx: 0, // force x
            fy: 0, // force y
        });
    }

    // 2. Create initial random edges
    const createdEdges = new Set();
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() < graphConfig.edgeProbability) {
                const weight = Math.floor(Math.random() * 9 + 1);
                const edgeKey1 = `${i}-${j}`;
                const edgeKey2 = `${j}-${i}`;
                if (!createdEdges.has(edgeKey1)) {
                    edges.push({ from: i, to: j, weight, visited: false, inPath: false });
                    edges.push({ from: j, to: i, weight, visited: false, inPath: false });
                    createdEdges.add(edgeKey1);
                    createdEdges.add(edgeKey2);
                }
            }
        }
    }

    // 3. Ensure graph connectivity
    ensureConnectivity(createdEdges);

    // 4. Apply force layout (called from resetVisualization after nextTick)
    // applyForceLayout(); // Now called from resetVisualization
}

function ensureConnectivity(createdEdges) {
    if (nodes.length < 2) return;

    const visited = new Set();
    const q = [nodes[0]]; // Start BFS from node 0
    visited.add(nodes[0].id);

    while (q.length > 0) {
        const node = q.shift();
        edges.filter(e => e.from === node.id).forEach(edge => {
            if (!visited.has(edge.to)) {
                visited.add(edge.to);
                q.push(nodes.find(n => n.id === edge.to));
            }
        });
         edges.filter(e => e.to === node.id).forEach(edge => { // Check reverse direction too
            if (!visited.has(edge.from)) {
                visited.add(edge.from);
                q.push(nodes.find(n => n.id === edge.from));
            }
        });
    }

    // Find nodes not in the main component
    const disconnectedNodes = nodes.filter(n => !visited.has(n.id));
    let visitedArray = Array.from(visited); // Nodes in the main component

    // Connect disconnected nodes
    while (disconnectedNodes.length > 0 && visitedArray.length > 0) {
        const nodeToConnect = disconnectedNodes.pop();
        // Connect to a random node already in the main component
        const connectToNode = nodes.find(n => n.id === visitedArray[Math.floor(Math.random() * visitedArray.length)]);

        if (nodeToConnect && connectToNode) {
            const fromId = nodeToConnect.id;
            const toId = connectToNode.id;
             const edgeKey1 = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
             const edgeKey2 = `${Math.max(fromId, toId)}-${Math.min(fromId, toId)}`;

            if (!createdEdges.has(edgeKey1)) {
                 console.log(`Connecting disconnected node ${fromId} to ${toId}`);
                 const weight = Math.floor(Math.random() * 9 + 1);
                 edges.push({ from: fromId, to: toId, weight, visited: false, inPath: false });
                 edges.push({ from: toId, to: fromId, weight, visited: false, inPath: false });
                 createdEdges.add(edgeKey1);
                 createdEdges.add(edgeKey2);
            }
             visited.add(fromId); // Add the newly connected node to the main set
             visitedArray.push(fromId) // Add to array for subsequent connections
        } else {
            // Safety break if something goes wrong
            console.error("Could not find nodes to connect for ensuring connectivity.");
            break;
        }
    }
}

function applyForceLayout() {
    if (!isGraphAlgorithm.value || nodes.length === 0) return;

    const [vbX, vbY, vbWidth, vbHeight] = viewBox.value.split(" ").map(Number);
    const kRepulsion = layoutConfig.repulsion;
    const kStiffness = layoutConfig.stiffness;
    const damping = layoutConfig.damping;
    const iterations = layoutConfig.iterations;
    const padding = layoutConfig.padding; // Use layoutConfig padding

    for (let iter = 0; iter < iterations; iter++) {
        // Calculate repulsion forces between all pairs of nodes
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].fx = 0;
            nodes[i].fy = 0;
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1; // Avoid division by zero
                const force = kRepulsion / (distance * distance); // Coulomb's law model
                nodes[i].fx -= force * (dx / distance);
                nodes[i].fy -= force * (dy / distance);
            }
        }

        // Calculate attraction forces along edges (springs)
         edges.filter((e, idx) => idx % 2 === 0).forEach(edge => { // Process each conceptual edge once
            const nodeFrom = nodes.find(n => n.id === edge.from);
            const nodeTo = nodes.find(n => n.id === edge.to);
            if (!nodeFrom || !nodeTo) return;

            const dx = nodeTo.x - nodeFrom.x;
            const dy = nodeTo.y - nodeFrom.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            // Hooke's law: F = k * x (where x is displacement from rest length, assume 0)
            const force = kStiffness * distance; // Simple model, pulls stronger when further

            const fx = force * (dx / distance);
            const fy = force * (dy / distance);

            nodeFrom.fx += fx;
            nodeFrom.fy += fy;
            nodeTo.fx -= fx;
            nodeTo.fy -= fy;
        });


        // Update node positions based on forces and damping
        nodes.forEach(node => {
            node.vx = (node.vx + node.fx) * damping;
            node.vy = (node.vy + node.fy) * damping;

            node.x += node.vx;
            node.y += node.vy;

            // Keep nodes within bounds
            node.x = Math.max(padding, Math.min(vbWidth - padding, node.x));
            node.y = Math.max(padding, Math.min(vbHeight - padding, node.y));
        });
    }

     // Clear velocity after layout settles
     nodes.forEach(node => {
        node.vx = 0;
        node.vy = 0;
        node.fx = 0;
        node.fy = 0;
     })
    console.log("Force layout applied.");
}


// --- Tree Layout ---

function calculateTreeLayout() {
    nodes.splice(0);
    edges.splice(0);

    const [vbX, vbY, vbWidth, vbHeight] = viewBox.value.split(" ").map(Number);
    const maxDepth = treeDepth.value;
    const verticalSpacing = (vbHeight - 2 * layoutConfig.padding) / maxDepth; // Use padding
    const startY = layoutConfig.padding + verticalSpacing / 2; // Center first level vertically somewhat


    let nodeId = 0;
    for (let depth = 0; depth < maxDepth; depth++) {
        const levelNodes = Math.pow(2, depth);
        const yPosition = startY + depth * verticalSpacing;

        for (let i = 0; i < levelNodes; i++) {
            const levelWidth = vbWidth * 0.9; // Use 90% of width
            const startX = vbWidth * 0.05;
            // Distribute nodes evenly across the level width
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
                children: [],
            });
        }
    }

    // Create edges (parent-child relationships)
    // (Logic remains the same, uses node positions calculated above)
    let currentNodeIndex = 0;
     for (let depth = 0; depth < maxDepth - 1; depth++) {
         const levelNodes = Math.pow(2, depth);
         for (let i = 0; i < levelNodes; i++) {
             const parentNode = nodes[currentNodeIndex];
             if (!parentNode) continue; // Safety check

             const leftChildIndex = nodes.findIndex(n => n.depth === depth + 1 && Math.floor(n.id / 2) === parentNode.id); // Find actual children by ID pattern if possible or index
             const rightChildIndex = leftChildIndex !== -1 ? nodes.findIndex((n, idx) => idx > leftChildIndex && n.depth === depth + 1 && Math.floor(n.id / 2) === parentNode.id) : -1;

            // More robustly find children based on the typical binary tree node indexing pattern
            const expectedLeftId = 2 * parentNode.id + 1;
            const expectedRightId = 2 * parentNode.id + 2;

            const leftChild = nodes.find(n => n.id === expectedLeftId);
            const rightChild = nodes.find(n => n.id === expectedRightId);

             if (leftChild) {
                 const weight = Math.floor(Math.random() * 9 + 1);
                 edges.push({ from: parentNode.id, to: leftChild.id, weight, visited: false, inPath: false });
                 parentNode.children.push(leftChild.id);
             }
             if (rightChild) {
                const weight = Math.floor(Math.random() * 9 + 1);
                 edges.push({ from: parentNode.id, to: rightChild.id, weight, visited: false, inPath: false });
                 parentNode.children.push(rightChild.id);
             }
             currentNodeIndex++;
         }
     }
}

// --- Node Selection ---
// (No changes needed in selectStartNode, selectEndNode, handleNodeClick)
function selectStartNode() {
 if (isRunning.value) return;
 selectingStart.value = true;
 selectingEnd.value = false;
}

function selectEndNode() {
 if (isRunning.value) return;
 selectingEnd.value = true;
 selectingStart.value = false;
}

function handleNodeClick(node) {
 if (isRunning.value) return;

 if (selectingStart.value) {
   if (startNode.value !== null && startNode.value !== node.id) { }
   if (node.id === endNode.value) endNode.value = null;
   startNode.value = node.id;
   selectingStart.value = false;
 } else if (selectingEnd.value) {
   if (endNode.value !== null && endNode.value !== node.id) { }
   if (node.id === startNode.value) startNode.value = null;
   endNode.value = node.id;
   selectingEnd.value = false;
 }
}


// --- Algorithms ---
const delayTime = ref(500);
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// (No changes needed in bfs, dfs, dijkstra, traversals)
// BFS Implementation (Graph) - Requires Start Node
async function bfs() {
 if (startNode.value === null) {
   alert("Please select a start node for BFS.");
   return false; // Indicate failure
 }

 const startNodeObj = nodes.find((n) => n.id === startNode.value);
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
   const neighborEdges = edges.filter((e) => e.from === currentNode.id);

   for (const edge of neighborEdges) {
     const neighborNode = nodes.find((n) => n.id === edge.to);

     if (neighborNode && !neighborNode.visited) {
       neighborNode.visited = true;
       // Mark edge as visited (use a unique key for bidirectional)
       const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
       if (!visitedEdges.has(edgeKey)) {
         // Find both directions of the edge to mark visited
         const edgePair = edges.filter(
           (e) =>
             (e.from === edge.from && e.to === edge.to) ||
             (e.from === edge.to && e.to === edge.from),
         );
         edgePair.forEach((ep) => (ep.visited = true));
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

 const startNodeObj = nodes.find((n) => n.id === startNode.value);
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
   const neighborEdges = edges.filter((e) => e.from === currentNode.id); //.reverse();

   for (const edge of neighborEdges) {
     const neighborNode = nodes.find((n) => n.id === edge.to);

     if (neighborNode && !neighborNode.visited) {
       // Mark edge as visited
       const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
       if (!visitedEdges.has(edgeKey)) {
         const edgePair = edges.filter(
           (e) =>
             (e.from === edge.from && e.to === edge.to) ||
             (e.from === edge.to && e.to === edge.from),
         );
         edgePair.forEach((ep) => (ep.visited = true));
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
     const neighborNode = nodes.find((n) => n.id === edge.to);
     if (!neighborNode) continue; // Skip if neighbor doesn't exist

     // Mark edge as visited (considered)
     edge.visited = true; // Highlight edge being considered
     await delay(delayTime.value / 3);

     const alt = distances.get(currentId) + edge.weight;

     if (alt < distances.get(edge.to)) {
       distances.set(edge.to, alt);
       previous.set(edge.to, currentId);
       if (pq.has(edge.to)) {
         // Update priority in pq if it's still there
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
     const pathEdge = edges.find(
       (e) => e.from === prevNodeId && e.to === pathNodeId,
     );
     const pathEdgeReverse = edges.find(
       (e) => e.from === pathNodeId && e.to === prevNodeId,
     ); // Find reverse too

     if (pathEdge) pathEdge.inPath = true;
     if (pathEdgeReverse) pathEdgeReverse.inPath = true; // Mark both directions inPath

     await delay(delayTime.value / 2);
     pathNodeId = prevNodeId;
   }
 } else {
   alert("End node is not reachable from the start node.");
 }

 return true; // Indicate success or completion
}


// Tree Traversals (No changes needed)
async function inOrderTraversal(nodeId) {
 const node = nodes.find((n) => n.id === nodeId);
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
 const node = nodes.find((n) => n.id === nodeId);
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
 const node = nodes.find((n) => n.id === nodeId);
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
// (No changes needed in startAlgorithm)
async function startAlgorithm() {
 if (isRunning.value) return; // Prevent multiple runs

 clearVisualState(); // Clear previous highlights before starting
 isRunning.value = true;
 let success = false;

 try {
   switch (selectedAlgorithm.value) {
     case "BFS": success = await bfs(); break;
     case "DFS": success = await dfs(); break;
     case "Dijkstra": success = await dijkstra(); break;
     case "In-Order":
       if (nodes.length > 0) await inOrderTraversal(nodes[0].id);
       success = true; break;
     case "Pre-Order":
       if (nodes.length > 0) await preOrderTraversal(nodes[0].id);
       success = true; break;
     case "Post-Order":
       if (nodes.length > 0) await postOrderTraversal(nodes[0].id);
       success = true; break;
   }
 } catch (error) {
   console.error("Algorithm execution failed:", error);
   alert("An error occurred during the algorithm execution.");
 } finally {
   isRunning.value = false;
 }
}


// --- SVG Helpers ---
function calculateEdgePath(edge) {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return "";
    // Add a slight curve to edges? (More complex, optional)
    // Basic straight line:
    return `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
}

// --- Lifecycle Hook ---
onMounted(() => {
    resetVisualization(); // Initialize
});

</script>

<template>
  <div class="main-container">
    <div class="algorithm-panel">
      <h3>Algorithm Visualizer</h3>

       <label for="algo-select">Select Algorithm:</label>
       <select id="algo-select" v-model="selectedAlgorithm" class="algorithm-select" :disabled="isRunning">
           <optgroup label="Graph Traversal"> <option>BFS</option> <option>DFS</option> </optgroup>
           <optgroup label="Shortest Path"> <option>Dijkstra</option> </optgroup>
           <optgroup label="Tree Traversal"> <option>In-Order</option> <option>Pre-Order</option> <option>Post-Order</option> </optgroup>
       </select>

       <div v-if="isGraphAlgorithm" class="config-section graph-config">
           <h4>Graph Options</h4>
           <label> Node Count: <input v-model.number="graphConfig.nodeCount" type="number" min="3" max="50" :disabled="isRunning" /> </label>
           <label> Edge Probability: <input v-model.number="graphConfig.edgeProbability" type="number" min="0.05" max="1" step="0.05" :disabled="isRunning" /> </label>
       </div>
       <div v-else class="config-section tree-config">
           <h4>Tree Options</h4>
           <label> Tree Depth: <input v-model.number="treeDepth" type="number" min="2" max="6" :disabled="isRunning" /> </label>
       </div>

       <div v-if="needsStartNode || needsEndNode" class="config-section node-selection">
           <h4>Node Selection</h4>
           <button v-if="needsStartNode" @click="selectStartNode" :disabled="isRunning || selectingStart" :class="{ selecting: selectingStart }"> {{ startNode !== null ? `Start: ${startNode}` : 'Select Start Node' }} {{ selectingStart ? '...' : '' }} </button>
           <button v-if="needsEndNode" @click="selectEndNode" :disabled="isRunning || selectingEnd" :class="{ selecting: selectingEnd }"> {{ endNode !== null ? `End: ${endNode}` : 'Select End Node' }} {{ selectingEnd ? '...' : '' }} </button>
           <p v-if="selectingStart || selectingEnd" class="selection-hint"> Click on a node in the visualization. </p>
       </div>

        <div class="config-section layout-config" v-if="isGraphAlgorithm">
             <h4>Layout Options</h4>
             <label title="Higher values push nodes apart more strongly"> Repulsion: <input type="range" v-model.number="layoutConfig.repulsion" min="500" max="10000" step="100" :disabled="isRunning"> {{layoutConfig.repulsion}} </label>
             <label title="Higher values make edges act like stiffer springs"> Stiffness: <input type="range" v-model.number="layoutConfig.stiffness" min="0.01" max="0.2" step="0.01" :disabled="isRunning"> {{layoutConfig.stiffness}} </label>
              <label title="Lower values make the layout settle faster but might overshoot"> Damping: <input type="range" v-model.number="layoutConfig.damping" min="0.1" max="0.95" step="0.05" :disabled="isRunning"> {{layoutConfig.damping}} </label>
              <label> Iterations: <input type="range" v-model.number="layoutConfig.iterations" min="20" max="300" step="10" :disabled="isRunning"> {{layoutConfig.iterations}} </label>
              <button @click="applyForceLayout" :disabled="isRunning || !isGraphAlgorithm">Re-Apply Layout</button>
        </div>


       <div class="config-section speed-control">
           <h4>Speed</h4>
           <label> Delay (ms): <input type="range" v-model.number="delayTime" min="10" max="2000" step="10" :disabled="isRunning"> <span>{{ delayTime }}ms</span> </label>
       </div>

       <div class="main-controls">
           <button @click="startAlgorithm" :disabled="isRunning || (needsStartNode && startNode === null) || (needsEndNode && endNode === null)"> {{ isRunning ? 'Running...' : 'Start' }} </button>
           <button @click="resetVisualization" :disabled="isRunning">Reset</button>
       </div>

    </div>

    <div class="visualization-container">
      <svg
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        class="visualization-svg"
      >
        <g class="edges">
           <path
             v-for="(edge, index) in edges"
             :key="'edge-' + edge.from + '-' + edge.to + '-' + index" :d="calculateEdgePath(edge)"
             class="edge"
             :class="{ visited: edge.visited, 'in-path': edge.inPath }"
           />
        </g>

        <g class="edge-weights">
             <text
              v-for="edge in edges.filter(e => e.from < e.to)" :key="'weight-' + edge.from + '-' + edge.to"
              :x="(nodes.find(n => n.id === edge.from)?.x + nodes.find(n => n.id === edge.to)?.x) / 2"
              :y="(nodes.find(n => n.id === edge.from)?.y + nodes.find(n => n.id === edge.to)?.y) / 2"
              class="edge-weight"
               dy="-2" >
              {{ edge.weight }}
            </text>
         </g>

         <g class="nodes">
          <circle
            v-for="node in nodes"
            :key="'node-' + node.id"
            :cx="node.x"
            :cy="node.y"
            r="15" class="node"
            :class="{
              visited: node.visited,
              current: node.current,
              start: node.id === startNode,
              end: node.id === endNode,
            }"
            @click="handleNodeClick(node)"
          >
            <title>{{ `Node ID: ${node.id}` }}</title>
          </circle>
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
             {{ node.id }}
           </text>
         </g>
      </svg>
    </div>
  </div>
</template>

<style>
:root {
 /* Colors */
 --color-background: #f8f9fa;
 --color-panel: #e9ecef;
 --color-border: #dee2e6;
 --color-text: #212529;
 --color-primary: #007bff;
 --color-secondary: #6c757d;
 --color-node: #0d6efd;
 --color-node-stroke: #0a58ca;
 --color-node-visited: #ffc107; /* Brighter yellow */
 --color-node-current: #dc3545;
 --color-node-start: #198754;
 --color-node-end: #fd7e14;
 --color-edge: #adb5bd; /* Lighter gray */
 --color-edge-visited: #6c757d;
 --color-edge-path: #198754;
 --color-label: white;
 --color-weight: #343a40; /* Darker */

 /* Sizes */
 --node-radius: 15px;
 --node-label-size: 9px;
 --edge-weight-size: 9px;
 --edge-stroke-width: 1.5px;
 --edge-visited-stroke-width: 2px;
 --edge-path-stroke-width: 3.5px;
}

body {
 margin: 0;
 font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* Modern font stack */
 background-color: var(--color-background);
 color: var(--color-text);
 font-size: 14px; /* Base font size */
}

.main-container {
 display: grid;
 grid-template-columns: 300px 1fr; /* Slightly wider panel */
 height: 100vh;
 overflow: hidden;
}

.algorithm-panel {
 padding: 20px;
 background: var(--color-panel);
 border-right: 1px solid var(--color-border);
 height: 100vh;
 overflow-y: auto;
 display: flex;
 flex-direction: column;
 gap: 20px; /* Increased gap */
}

.algorithm-panel h3, .algorithm-panel h4 {
 margin-top: 0;
 margin-bottom: 10px;
 border-bottom: 1px solid var(--color-border);
 padding-bottom: 8px;
 color: var(--color-text);
}
.algorithm-panel h4 {
    margin-bottom: 10px;
    font-size: 0.95em;
    font-weight: 600; /* Slightly bolder */
}


.config-section label,
.config-section .main-controls,
.node-selection,
.layout-config label /* Target layout labels specifically */
 {
 display: flex;
 flex-direction: column;
 gap: 10px;
}
.config-section input[type="number"],
.config-section input[type="range"],
.algorithm-select,
button {
    font-size: 0.9em; /* Slightly smaller controls */
}

.config-section input[type="number"],
.config-section input[type="range"],
.algorithm-select {
 width: 100%;
 padding: 8px 10px;
 border: 1px solid var(--color-border);
 border-radius: 4px;
 box-sizing: border-box;
 background-color: #fff; /* White background for inputs */
}
.config-section input[type="range"] { padding: 0; }

.layout-config label, /* Row layout for layout sliders */
.speed-control label {
    flex-direction: row;
    align-items: center;
    gap: 10px;
}
.layout-config input[type="range"],
.speed-control input[type="range"] {
    flex-grow: 1;
}
.layout-config span,
.speed-control span {
     min-width: 45px;
     text-align: right;
     font-size: 0.85em;
     color: var(--color-secondary);
 }


.algorithm-select { margin-bottom: 15px; }

button {
 padding: 9px 15px;
 background-color: var(--color-primary);
 color: white;
 border: none;
 border-radius: 4px;
 cursor: pointer;
 transition: background-color 0.2s ease, box-shadow 0.2s ease;
 text-align: center;
}

button:hover:not(:disabled) {
 background-color: var(--color-node-stroke);
 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:disabled {
 background-color: var(--color-secondary);
 cursor: not-allowed;
 opacity: 0.7;
}

button.selecting { background-color: var(--color-node-current); }

.selection-hint {
 font-size: 0.85em;
 color: var(--color-secondary);
 text-align: center;
 margin-top: 5px;
}

/* Changed: Container uses Flexbox and relative sizing */
.visualization-container {
 display: flex; /* Use flexbox */
 justify-content: center;
 align-items: center;
 padding: 15px; /* Reduced padding */
 overflow: hidden;
 background-color: white;
 height: 100%; /* Ensure container takes available height */
 box-sizing: border-box;
}

/* Changed: SVG is responsive */
.visualization-svg {
 /* border: 1px solid var(--color-border); */ /* Optional: keep border or remove */
 display: block; /* Remove extra space below SVG */
 width: 100%; /* Take full width of container */
 height: 100%; /* Take full height of container */
 max-width: 100%;
 max-height: 100%;
}

/* SVG Elements Styling */
.node {
 fill: var(--color-node);
 stroke: var(--color-node-stroke);
 stroke-width: 1px; /* Thinner stroke */
 cursor: pointer;
 transition: fill 0.2s ease, stroke 0.2s ease, r 0.2s ease;
 r: var(--node-radius); /* Use CSS var */
}
.node:hover { stroke-width: 2px; r: calc(var(--node-radius) + 2px); } /* Slightly grow on hover */

.node.visited { fill: var(--color-node-visited); }
.node.current { fill: var(--color-node-current); stroke: #a02a1a; stroke-width: 2px; }
.node.start { fill: var(--color-node-start) !important; stroke: darkgreen !important; }
.node.end { fill: var(--color-node-end) !important; stroke: darkorange !important; }

.edge {
 stroke: var(--color-edge);
 stroke-width: var(--edge-stroke-width);
 fill: none;
 transition: stroke 0.2s ease, stroke-width 0.2s ease;
}

.edge.visited { stroke: var(--color-edge-visited); stroke-width: var(--edge-visited-stroke-width); }
.edge.in-path { stroke: var(--color-edge-path); stroke-width: var(--edge-path-stroke-width); }

.node-label {
 fill: var(--color-label);
 font-size: var(--node-label-size);
 font-weight: 500; /* Normal weight */
 pointer-events: none;
 text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
}

.edge-weight {
 fill: var(--color-weight);
 font-size: var(--edge-weight-size);
 font-weight: 500;
 pointer-events: none;
 text-anchor: middle;
 /* Add a slight background/outline for readability */
 paint-order: stroke;
 stroke: white; /* Outline color */
 stroke-width: 2px; /* Outline thickness */
 stroke-linejoin: round;
}

</style>
