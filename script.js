let defaultData = [
    { name: "P1", height: 160, weight: 70 },
    { name: "P2", height: 167, weight: 75 },
    { name: "P3", height: 162, weight: 80 },
    { name: "P4", height: 171, weight: 90 },
    { name: "P5", height: 156, weight: 60 },
    { name: "P6", height: 165, weight: 62 },
    { name: "P7", height: 159, weight: 68 },
    { name: "P8", height: 185, weight: 100 },
    { name: "P9", height: 177, weight: 92 },
    { name: "P10", height: 169, weight: 92 },
    { name: "P11", height: 160, weight: 78 },
    { name: "P12", height: 170, weight: 90 },
    { name: "P13", height: 185, weight: 95 },
    { name: "P14", height: 160, weight: 85 },
    { name: "P15", height: 162, weight: 87 }
];

let currentData = JSON.parse(JSON.stringify(defaultData));
let chart = null;
let lastCentroids = null;

function switchStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function getDistanceMethod() {
    const selected = document.querySelector('input[name="distanceMethod"]:checked');
    return selected ? selected.value : 'manhattan';
}

function manhattanDistance(p1, p2) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

function euclideanDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function calculateDistance(p1, p2) {
    if (getDistanceMethod() === 'manhattan') {
        return manhattanDistance(p1, p2);
    } else {
        return euclideanDistance(p1, p2);
    }
}

function getDistanceFormula(point, cent) {
    if (getDistanceMethod() === 'manhattan') {
        return `|${point.x}-${cent.x}| + |${point.y}-${cent.y}|`;
    } else {
        return `√[(${point.x}-${cent.x})² + (${point.y}-${cent.y})²]`;
    }
}

function getVarNames() {
    return {
        x: document.getElementById('xName').value || 'X',
        y: document.getElementById('yName').value || 'Y'
    };
}

function getCurrentCentroids() {
    const k = parseInt(document.getElementById('kValue').value);
    const firstK = currentData.slice(0, k);
    return firstK.map((point, idx) => ({
        name: `C${idx+1}`,
        x: point.height,
        y: point.weight
    }));
}

function displayDataInputTable() {
    const varNames = getVarNames();
    let html = `<table class="data-input-table"><thead><tr><th>#</th><th>Name</th><th>${varNames.x}</th><th>${varNames.y}</th><th>Action</th></tr></thead><tbody>`;
    
    currentData.forEach((p, idx) => {
        const pointName = (p.name && p.name.trim() !== "") ? p.name : `P${idx+1}`;
        const xValue = (p.height === 0 || p.height === null || p.height === "") ? "" : p.height;
        const yValue = (p.weight === 0 || p.weight === null || p.weight === "") ? "" : p.weight;
        
        html += `<tr data-idx="${idx}">
            <td>${idx + 1}</td>
            <td><input type="text" value="${pointName}" class="name-input" data-idx="${idx}" style="width:70px"></td>
            <td><input type="number" value="${xValue}" class="height-input" data-idx="${idx}" style="width:80px"></td>
            <td><input type="number" value="${yValue}" class="weight-input" data-idx="${idx}" style="width:80px"></td>
            <td><button class="delete-row" data-idx="${idx}">Delete</button></td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    document.getElementById('dataInputTable').innerHTML = html;
    
    document.querySelectorAll('.name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            currentData[idx].name = e.target.value;
        });
    });
    document.querySelectorAll('.height-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            let val = parseFloat(e.target.value);
            currentData[idx].height = isNaN(val) ? 0 : val;
            displayCentroids();
        });
    });
    document.querySelectorAll('.weight-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            let val = parseFloat(e.target.value);
            currentData[idx].weight = isNaN(val) ? 0 : val;
            displayCentroids();
        });
    });
    document.querySelectorAll('.delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            currentData.splice(idx, 1);
            displayDataInputTable();
            displayCentroids();
        });
    });
}

function displayCentroids() {
    const centroids = getCurrentCentroids();
    let html = '';
    centroids.forEach(c => {
        html += `<div class="centroid">${c.name}: (${c.x}, ${c.y})</div>`;
    });
    document.getElementById('centroidsBox').innerHTML = html;
}

function displayEquations() {
    const centroids = getCurrentCentroids();
    let html = '';
    const samplePoints = currentData.slice(0, 5);
    const method = getDistanceMethod();
    document.getElementById('distanceEquationsTitle').innerHTML = method === 'manhattan' ? 'Manhattan Distance Equations' : 'Euclidean Distance Equations';
    
    centroids.forEach(cent => {
        html += `<h3>Distance to ${cent.name} (${cent.x},${cent.y}):</h3>`;
        samplePoints.forEach(p => {
            if (p && p.height > 0 && p.weight > 0) {
                const point = { x: p.height, y: p.weight };
                const dist = calculateDistance(point, cent);
                const formula = getDistanceFormula(point, cent);
                html += `<p>d(${p.name}, ${cent.name}) = ${formula} = ${dist.toFixed(2)}</p>`;
            }
        });
    });
    document.getElementById('equations').innerHTML = html;
}

function buildDistancesTable() {
    const centroids = getCurrentCentroids();
    const results = [];
    
    currentData.forEach(point => {
        if (point.height <= 0 || point.weight <= 0) return;
        const pointObj = { x: point.height, y: point.weight };
        const distances = centroids.map(cent => calculateDistance(pointObj, cent));
        const minDist = Math.min(...distances);
        const clusterDisplay = [];
        distances.forEach((d, idx) => {
            if (d === minDist) clusterDisplay.push(centroids[idx].name);
        });
        results.push({
            name: point.name,
            distances: distances.map(d => d.toFixed(2)),
            clusterDisplay: clusterDisplay.join(",")
        });
    });
    return { centroids, results };
}

function displayDistancesTable() {
    const { centroids, results } = buildDistancesTable();
    let html = `<table class="results-table"><thead><tr><th>Point</th>${centroids.map(c => `<th>${c.name}</th>`).join('')}<th>Cluster</th></tr></thead><tbody>`;
    results.forEach(row => {
        html += `<tr><td>${row.name}</td>${row.distances.map(d => `<td>${d}</td>`).join('')}<td class="cluster-col">${row.clusterDisplay}</td></tr>`;
    });
    html += `</tbody></table>`;
    document.getElementById('distancesTable').innerHTML = html;
    return { centroids, results };
}

function buildClustersFromDistances(results, centroids) {
    const clusters = {};
    centroids.forEach(c => { clusters[c.name] = []; });
    results.forEach(item => {
        const firstCluster = item.clusterDisplay.split(',')[0];
        if (firstCluster) {
            const point = currentData.find(p => p.name === item.name);
            if (point) clusters[firstCluster].push(point);
        }
    });
    return clusters;
}

function displayClusters(clusters) {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#1abc9c', '#e67e22'];
    let html = `<div class="clusters-wrapper">`;
    let idx = 0;
    for (let [name, members] of Object.entries(clusters)) {
        if (members.length === 0) continue;
        html += `<div class="cluster-card" style="border-top-color: ${colors[idx % colors.length]}"><h3 style="color: ${colors[idx % colors.length]}">${name} (${members.length} points)</h3><div>${members.map(p => `<span class="point-badge">${p.name} (${p.height},${p.weight})</span>`).join('')}</div></div>`;
        idx++;
    }
    html += `</div>`;
    document.getElementById('clustersDisplay').innerHTML = html;
}

function calculateNewCentroids(clusters) {
    const newCentroids = [];
    for (let [name, members] of Object.entries(clusters)) {
        if (members.length === 0) {
            newCentroids.push({ name: name, x: 0, y: 0 });
            continue;
        }
        let sumX = 0, sumY = 0;
        members.forEach(m => { sumX += m.height; sumY += m.weight; });
        newCentroids.push({ name: name, x: sumX / members.length, y: sumY / members.length });
    }
    return newCentroids;
}

function displayNewCentroids(newCentroids, clusters) {
    let html = `<div class="calculation-box"><h3>New Centroids Calculation (${getDistanceMethod() === 'manhattan' ? 'Manhattan' : 'Euclidean'})</h3>`;
    for (let [name, members] of Object.entries(clusters)) {
        if (members.length === 0) continue;
        let heights = members.map(m => m.height);
        let weights = members.map(m => m.weight);
        let sumH = heights.reduce((a, b) => a + b, 0);
        let sumW = weights.reduce((a, b) => a + b, 0);
        let avgH = sumH / members.length;
        let avgW = sumW / members.length;
        html += `<div><h4>${name}</h4><p><strong>X:</strong> (${heights.join(" + ")}) / ${members.length} = ${sumH} / ${members.length} = ${avgH.toFixed(2)}</p><p><strong>Y:</strong> (${weights.join(" + ")}) / ${members.length} = ${sumW} / ${members.length} = ${avgW.toFixed(2)}</p><hr></div>`;
    }
    html += `</div>`;
    document.getElementById('newCentroidsDisplay').innerHTML = html;
}

function displayIterationDetails(iterationNum, centroids, clusters, finalFlag = false) {
    let html = `<div class="iteration-box"><h4>${finalFlag ? 'Final Result' : `Iteration ${iterationNum}`}</h4>`;
    let distancesHtml = `<table class="results-table"><thead><tr><th>Point</th>${centroids.map(c => `<th>${c.name}</th>`).join('')}<th>Assigned</th></tr></thead><tbody>`;
    currentData.forEach(point => {
        if (point.height <= 0 || point.weight <= 0) return;
        const pointObj = { x: point.height, y: point.weight };
        const distances = [];
        let minDist = Infinity, assigned = '';
        centroids.forEach((cent, idx) => {
            const dist = calculateDistance(pointObj, cent);
            distances.push(dist.toFixed(2));
            if (dist < minDist) { minDist = dist; assigned = centroids[idx].name; }
        });
        distancesHtml += `<tr><td>${point.name}</td>${distances.map(d => `<td>${d}</td>`).join('')}<td class="cluster-col">${assigned}</td></tr>`;
    });
    distancesHtml += `</tbody></table>`;
    html += distancesHtml;
    
    if (clusters) {
        let clustersHtml = `<div class="clusters-wrapper">`;
        for (let [name, members] of Object.entries(clusters)) {
            if (members.length === 0) continue;
            clustersHtml += `<div class="cluster-card"><h3>${name} (${members.length})</h3><div>${members.map(m => `<span class="point-badge">${m.name} (${m.height},${m.weight})</span>`).join('')}</div></div>`;
        }
        clustersHtml += `</div>`;
        html += clustersHtml;
    }
    
    if (!finalFlag && clusters) {
        html += `<div class="calculation-box"><h4>New Centroids Calculations:</h4>`;
        for (let [name, members] of Object.entries(clusters)) {
            if (members.length === 0) continue;
            let heightValues = members.map(m => m.height);
            let weightValues = members.map(m => m.weight);
            let sumHeight = heightValues.reduce((a, b) => a + b, 0);
            let sumWeight = weightValues.reduce((a, b) => a + b, 0);
            let avgHeight = sumHeight / members.length;
            let avgWeight = sumWeight / members.length;
            html += `<p><strong>${name}</strong><br>X = (${heightValues.join(' + ')}) / ${members.length} = ${avgHeight.toFixed(2)}<br>Y = (${weightValues.join(' + ')}) / ${members.length} = ${avgWeight.toFixed(2)}</p><hr>`;
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

function runFullKMeans() {
    displayEquations();
    const { centroids: initialCentroids, results } = displayDistancesTable();
    const clusters = buildClustersFromDistances(results, initialCentroids);
    displayClusters(clusters);
    const newCentroids = calculateNewCentroids(clusters);
    displayNewCentroids(newCentroids, clusters);
    
    let centroids = newCentroids;
    let maxIterations = 20;
    let changed = true;
    let iteration = 1;
    let allIterationsHTML = '';
    
    while (changed && iteration < maxIterations) {
        const iterClusters = {};
        centroids.forEach(c => { iterClusters[c.name] = []; });
        currentData.forEach(point => {
            if (point.height <= 0 || point.weight <= 0) return;
            const pointObj = { x: point.height, y: point.weight };
            let minDist = Infinity, assignedCluster = null;
            centroids.forEach(cent => {
                const dist = calculateDistance(pointObj, cent);
                if (dist < minDist) { minDist = dist; assignedCluster = cent.name; }
            });
            if (assignedCluster) iterClusters[assignedCluster].push(point);
        });
        
        const newCentroidsIter = [];
        for (let cent of centroids) {
            const members = iterClusters[cent.name];
            if (members.length === 0) { newCentroidsIter.push(cent); continue; }
            let sumX = 0, sumY = 0;
            members.forEach(m => { sumX += m.height; sumY += m.weight; });
            newCentroidsIter.push({ name: cent.name, x: sumX / members.length, y: sumY / members.length });
        }
        
        allIterationsHTML += displayIterationDetails(iteration + 1, newCentroidsIter, iterClusters, false);
        changed = false;
        for (let i = 0; i < centroids.length; i++) {
            if (Math.abs(centroids[i].x - newCentroidsIter[i].x) > 0.01 || Math.abs(centroids[i].y - newCentroidsIter[i].y) > 0.01) {
                changed = true;
                break;
            }
        }
        centroids = newCentroidsIter;
        iteration++;
    }
    
    const finalClusters = {};
    centroids.forEach(c => { finalClusters[c.name] = []; });
    currentData.forEach(point => {
        if (point.height <= 0 || point.weight <= 0) return;
        const pointObj = { x: point.height, y: point.weight };
        let minDist = Infinity, assignedCluster = null;
        centroids.forEach(cent => {
            const dist = calculateDistance(pointObj, cent);
            if (dist < minDist) { minDist = dist; assignedCluster = cent.name; }
        });
        if (assignedCluster) finalClusters[assignedCluster].push(point);
    });
    
    allIterationsHTML += displayIterationDetails(iteration, centroids, finalClusters, true);
    document.getElementById('iterationSteps').innerHTML = allIterationsHTML;
    drawChart(centroids);
    lastCentroids = centroids;
}

function drawChart(centroids) {
    const ctx = document.getElementById('clustersChart').getContext('2d');
    if (chart) chart.destroy();
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#1abc9c', '#e67e22'];
    const datasets = [];
    const pointClusters = {};
    centroids.forEach(c => { pointClusters[c.name] = []; });
    currentData.forEach(point => {
        if (point.height <= 0 || point.weight <= 0) return;
        const pointObj = { x: point.height, y: point.weight };
        let minDist = Infinity, assignedCluster = null;
        centroids.forEach(cent => {
            const dist = calculateDistance(pointObj, cent);
            if (dist < minDist) { minDist = dist; assignedCluster = cent.name; }
        });
        if (assignedCluster) pointClusters[assignedCluster].push(point);
    });
    let idx = 0;
    for (let [name, members] of Object.entries(pointClusters)) {
        if (members.length === 0) continue;
        datasets.push({
            label: name,
            data: members.map(p => ({ x: p.height, y: p.weight })),
            backgroundColor: colors[idx % colors.length],
            pointRadius: 6,
            type: 'scatter'
        });
        idx++;
    }
    centroids.forEach(c => {
        datasets.push({
            label: c.name + " (centroid)",
            data: [{ x: c.x, y: c.y }],
            backgroundColor: 'black',
            pointStyle: 'star',
            pointRadius: 12,
            type: 'scatter'
        });
    });
    chart = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { title: { display: true, text: document.getElementById('xName').value } },
                y: { title: { display: true, text: document.getElementById('yName').value } }
            }
        }
    });
}

function resetToExample() {
    currentData = JSON.parse(JSON.stringify(defaultData));
    displayDataInputTable();
    displayCentroids();
    document.getElementById('iterationSteps').innerHTML = '';
    document.getElementById('equations').innerHTML = '';
    document.getElementById('distancesTable').innerHTML = '';
    document.getElementById('clustersDisplay').innerHTML = '';
    document.getElementById('newCentroidsDisplay').innerHTML = '';
}

function addNewRow() {
    const newId = currentData.length + 1;
    currentData.push({ name: `P${newId}`, height: 170, weight: 75 });
    displayDataInputTable();
    displayCentroids();
}

function init() {
    displayDataInputTable();
    displayCentroids();
    
    document.getElementById('xName').addEventListener('change', () => {
        displayDataInputTable();
        displayCentroids();
    });
    document.getElementById('yName').addEventListener('change', () => {
        displayDataInputTable();
        displayCentroids();
    });
    document.getElementById('kValue').addEventListener('change', () => { displayCentroids(); });
    document.getElementById('addRowBtn').addEventListener('click', () => addNewRow());
    document.getElementById('resetDataBtn').addEventListener('click', () => resetToExample());
    
    document.getElementById('nextToStep2').addEventListener('click', () => switchStep(2));
    document.getElementById('backToStep1').addEventListener('click', () => switchStep(1));
    document.getElementById('solveBtn').addEventListener('click', () => {
        runFullKMeans();
        switchStep(3);
    });
    document.getElementById('backToStep2').addEventListener('click', () => switchStep(2));
    document.getElementById('nextToStep4').addEventListener('click', () => switchStep(4));
    document.getElementById('backToStep3').addEventListener('click', () => switchStep(3));
    document.getElementById('resetAllBtn').addEventListener('click', () => {
        resetToExample();
        switchStep(1);
    });
    
    switchStep(1);
}

init();