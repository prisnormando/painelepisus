// ============================================================
// PAINEL EPISUS INTERMEDIÁRIO - Application Logic
// ============================================================

// Global state
let filteredData = [];
let map = null;
let markersLayer = null;
let statesLayer = null;
let charts = {};

// Chart.js defaults
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666666';
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.legend.position = 'bottom';
Chart.defaults.animation.duration = 600;

// Color palette
const COLORS = {
    primary: '#1A1A2E',
    secondary: '#E67E22',
    tertiary: '#D35400',
    neutral: '#F4F7F6',
    chart: ['#E67E22', '#1A1A2E', '#3498db', '#27ae60', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#34495e', '#d35400', '#2980b9', '#8e44ad', '#c0392b', '#16a085', '#7f8c8d']
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    applyFilters();
    initMap();
});

// ============================================================
// FILTER INITIALIZATION
// ============================================================
function initializeFilters() {
    const data = DADOS_EPISUS;
    
    // Turma filter
    const turmas = [...new Set(data.map(d => d.nometurma))].sort();
    const turmaSelect = document.getElementById('filter-turma');
    turmas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        turmaSelect.appendChild(opt);
    });

    // Porte filter
    const portes = [...new Set(data.map(d => d.portemun))].sort();
    const porteSelect = document.getElementById('filter-porte');
    portes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        porteSelect.appendChild(opt);
    });

    // Sexo checkboxes
    const sexos = [...new Set(data.map(d => d.sexo))].sort();
    const sexoContainer = document.getElementById('filter-sexo');
    sexos.forEach(s => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${s}" checked> ${s}`;
        sexoContainer.appendChild(label);
    });

    // Raça/Cor checkboxes
    const racas = [...new Set(data.map(d => d.raca_cor || 'Não informado'))].sort();
    const racaContainer = document.getElementById('filter-raca');
    racas.forEach(r => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `<input type="checkbox" value="${r}" checked> ${r}`;
        racaContainer.appendChild(label);
    });

    // Faixa Etária filter
    const idades = [...new Set(data.map(d => d.idade))].sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numA - numB;
    });
    const idadeSelect = document.getElementById('filter-idade');
    idades.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        idadeSelect.appendChild(opt);
    });

    // Tema TCC filter
    const temas = [...new Set(data.filter(d => d.tema_grande_area).map(d => d.tema_grande_area))].sort();
    const temaSelect = document.getElementById('filter-tema');
    temas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        temaSelect.appendChild(opt);
    });

    // Município autocomplete
    const municipios = [...new Set(data.map(d => d.municipio_trab_durante_curso))].sort();
    const datalist = document.getElementById('municipios-list');
    municipios.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        datalist.appendChild(opt);
    });
}

// ============================================================
// FILTER APPLICATION
// ============================================================
function getActiveFilters() {
    const filters = {};
    
    const turma = document.getElementById('filter-turma').value;
    if (turma) filters.turma = turma;

    const municipio = document.getElementById('filter-municipio').value.trim();
    if (municipio) filters.municipio = municipio;

    const porte = document.getElementById('filter-porte').value;
    if (porte) filters.porte = porte;

    const sexoChecks = document.querySelectorAll('#filter-sexo input[type="checkbox"]');
    const sexoValues = [...sexoChecks].filter(c => c.checked).map(c => c.value);
    if (sexoValues.length < sexoChecks.length && sexoValues.length > 0) {
        filters.sexo = sexoValues;
    }

    const racaChecks = document.querySelectorAll('#filter-raca input[type="checkbox"]');
    const racaValues = [...racaChecks].filter(c => c.checked).map(c => c.value);
    if (racaValues.length < racaChecks.length && racaValues.length > 0) {
        filters.raca = racaValues;
    }

    const idade = document.getElementById('filter-idade').value;
    if (idade) filters.idade = idade;

    const tema = document.getElementById('filter-tema').value;
    if (tema) filters.tema = tema;

    return filters;
}

function applyFilters() {
    const filters = getActiveFilters();
    let data = [...DADOS_EPISUS];

    // Apply filters
    if (filters.turma) {
        data = data.filter(d => d.nometurma === filters.turma);
    }
    if (filters.municipio) {
        data = data.filter(d => d.municipio_trab_durante_curso && 
            d.municipio_trab_durante_curso.toLowerCase().includes(filters.municipio.toLowerCase()));
    }
    if (filters.porte) {
        data = data.filter(d => d.portemun === filters.porte);
    }
    if (filters.sexo) {
        data = data.filter(d => filters.sexo.includes(d.sexo));
    }
    if (filters.raca) {
        data = data.filter(d => filters.raca.includes(d.raca_cor || 'Não informado'));
    }
    if (filters.idade) {
        data = data.filter(d => d.idade === filters.idade);
    }
    if (filters.tema) {
        data = data.filter(d => d.tema_grande_area === filters.tema);
    }

    filteredData = data;
    
    updateKPIs();
    updateCharts();
    updateMap();
    updateActiveFiltersDisplay(filters);
}

function resetFilters() {
    document.getElementById('filter-turma').value = '';
    document.getElementById('filter-municipio').value = '';
    document.getElementById('filter-porte').value = '';
    document.getElementById('filter-idade').value = '';
    document.getElementById('filter-tema').value = '';

    document.querySelectorAll('#filter-sexo input[type="checkbox"]').forEach(c => c.checked = true);
    document.querySelectorAll('#filter-raca input[type="checkbox"]').forEach(c => c.checked = true);

    applyFilters();
}

function updateActiveFiltersDisplay(filters) {
    const container = document.getElementById('active-filters-container');
    const list = document.getElementById('active-filters-list');
    
    const keys = Object.keys(filters);
    if (keys.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = '';

    const labels = {
        turma: 'Turma',
        municipio: 'Município',
        porte: 'Porte',
        sexo: 'Sexo',
        raca: 'Raça/Cor',
        idade: 'Faixa Etária',
        tema: 'Tema TCC'
    };

    keys.forEach(key => {
        const value = Array.isArray(filters[key]) ? filters[key].join(', ') : filters[key];
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.innerHTML = `${labels[key]}: ${value} <span class="remove" onclick="removeFilter('${key}')">&times;</span>`;
        list.appendChild(tag);
    });
}

function removeFilter(key) {
    switch(key) {
        case 'turma': document.getElementById('filter-turma').value = ''; break;
        case 'municipio': document.getElementById('filter-municipio').value = ''; break;
        case 'porte': document.getElementById('filter-porte').value = ''; break;
        case 'idade': document.getElementById('filter-idade').value = ''; break;
        case 'tema': document.getElementById('filter-tema').value = ''; break;
        case 'sexo':
            document.querySelectorAll('#filter-sexo input[type="checkbox"]').forEach(c => c.checked = true);
            break;
        case 'raca':
            document.querySelectorAll('#filter-raca input[type="checkbox"]').forEach(c => c.checked = true);
            break;
    }
    applyFilters();
}

// ============================================================
// KPI UPDATES
// ============================================================
function updateKPIs() {
    const data = filteredData;
    const egressos = data.filter(d => d.egresso === 'Sim');
    
    // Total egressos
    document.getElementById('kpi-egressos').textContent = egressos.length.toLocaleString('pt-BR');
    document.getElementById('kpi-egressos-detail').textContent = `de ${data.length} registros filtrados`;

    // Municípios
    const municipios = new Set(egressos.map(d => d.mun_ibge_cod).filter(Boolean));
    document.getElementById('kpi-municipios').textContent = municipios.size.toLocaleString('pt-BR');
    document.getElementById('kpi-municipios-detail').textContent = `em ${new Set(egressos.map(d => d.uf_trab)).size} UFs`;

    // Taxa de sucesso
    const turmasFinalizadas = [...new Set(data.filter(d => d.statusturma === 'Finalizada').map(d => d.nometurma))];
    let totalEgressos = 0;
    let totalVagas = 0;
    turmasFinalizadas.forEach(turma => {
        const turmaData = DADOS_EPISUS.filter(d => d.nometurma === turma);
        const vagas = turmaData[0]?.vagas_ofertadas || 0;
        const concluintes = turmaData.filter(d => d.egresso === 'Sim').length;
        totalEgressos += concluintes;
        totalVagas += vagas;
    });
    const taxa = totalVagas > 0 ? ((totalEgressos / totalVagas) * 100).toFixed(1) : 0;
    document.getElementById('kpi-taxa').textContent = taxa + '%';
    document.getElementById('kpi-taxa-detail').textContent = `${totalEgressos} concluintes / ${totalVagas} vagas`;

    // Turmas
    const turmasCount = new Set(data.map(d => d.nometurma));
    const turmasFinCount = new Set(data.filter(d => d.statusturma === 'Finalizada').map(d => d.nometurma));
    document.getElementById('kpi-turmas').textContent = turmasCount.size;
    document.getElementById('kpi-turmas-detail').textContent = `${turmasFinCount.size} finalizadas`;

    // UFs
    const ufs = new Set(egressos.map(d => d.uf_trab).filter(Boolean));
    document.getElementById('kpi-ufs').textContent = ufs.size;
}

// ============================================================
// MAP
// ============================================================
function initMap() {
    map = L.map('map', {
        center: [-14.5, -52],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add states layer
    if (typeof BRASIL_ESTADOS !== 'undefined') {
        statesLayer = L.geoJSON(BRASIL_ESTADOS, {
            style: {
                color: '#1A1A2E',
                weight: 1,
                fillColor: '#e8eceb',
                fillOpacity: 0.3,
                opacity: 0.6
            },
            onEachFeature: function(feature, layer) {
                layer.bindTooltip(feature.properties.name || feature.properties.sigla, {
                    permanent: false,
                    direction: 'center',
                    className: 'state-label'
                });
            }
        }).addTo(map);
    }

    // Initialize markers cluster
    markersLayer = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let size = 'small';
            let dim = 40;
            if (count >= 20) { size = 'large'; dim = 56; }
            else if (count >= 10) { size = 'medium'; dim = 48; }
            
            return L.divIcon({
                html: '<div>' + count + '</div>',
                className: 'marker-cluster marker-cluster-' + size,
                iconSize: L.point(dim, dim)
            });
        }
    });
    map.addLayer(markersLayer);

    updateMap();
}

function updateMap() {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    const egressos = filteredData.filter(d => d.egresso === 'Sim' && d.latitude && d.longitude);
    
    // Group by municipality
    const munGroup = {};
    egressos.forEach(d => {
        const key = d.mun_ibge_cod;
        if (!munGroup[key]) {
            munGroup[key] = {
                nome: d.municipio_trab_durante_curso,
                uf: d.uf_trab,
                lat: d.latitude,
                lng: d.longitude,
                pop: d.popmun,
                count: 0,
                turmas: new Set()
            };
        }
        munGroup[key].count++;
        munGroup[key].turmas.add(d.nometurma);
    });

    // Add markers
    Object.values(munGroup).forEach(mun => {
        const color = getMarkerColor(mun.count);
        const radius = Math.min(Math.max(mun.count * 0.8, 5), 25);
        
        const marker = L.circleMarker([mun.lat, mun.lng], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.75
        });

        const proporcao = mun.pop > 0 ? (mun.count / mun.pop * 200000).toFixed(2) : 'N/A';
        
        marker.bindPopup(`
            <div class="popup-content">
                <strong>${mun.nome}</strong> - ${mun.uf}<br>
                <span class="popup-value">${mun.count}</span> egresso(s)<br>
                Turmas: ${[...mun.turmas].join(', ')}<br>
                Pop.: ${mun.pop ? mun.pop.toLocaleString('pt-BR') : 'N/I'}<br>
                Proporção: <span class="popup-value">${proporcao}</span> por 200 mil hab.
            </div>
        `, {className: 'custom-popup'});

        markersLayer.addLayer(marker);
    });
}

function getMarkerColor(count) {
    if (count >= 30) return '#E67E22';
    if (count >= 20) return '#F39C12';
    if (count >= 10) return '#F1C40F';
    if (count >= 5) return '#82E0AA';
    return '#AED6F1';
}

function expandMap() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = '<button class="modal-close" onclick="closeModal()">&times;</button><div id="modal-map" style="height:70vh;width:100%;border-radius:8px;"></div>';
    modal.classList.add('active');

    setTimeout(() => {
        const modalMap = L.map('modal-map', {
            center: [-14.5, -52],
            zoom: 4,
            minZoom: 3,
            maxZoom: 12
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd'
        }).addTo(modalMap);

        if (typeof BRASIL_ESTADOS !== 'undefined') {
            L.geoJSON(BRASIL_ESTADOS, {
                style: { color: '#1A1A2E', weight: 1, fillColor: '#e8eceb', fillOpacity: 0.3, opacity: 0.6 }
            }).addTo(modalMap);
        }

        const egressos = filteredData.filter(d => d.egresso === 'Sim' && d.latitude && d.longitude);
        const munGroup = {};
        egressos.forEach(d => {
            const key = d.mun_ibge_cod;
            if (!munGroup[key]) {
                munGroup[key] = { nome: d.municipio_trab_durante_curso, uf: d.uf_trab, lat: d.latitude, lng: d.longitude, pop: d.popmun, count: 0, turmas: new Set() };
            }
            munGroup[key].count++;
            munGroup[key].turmas.add(d.nometurma);
        });

        Object.values(munGroup).forEach(mun => {
            const color = getMarkerColor(mun.count);
            const radius = Math.min(Math.max(mun.count * 0.8, 5), 25);
            L.circleMarker([mun.lat, mun.lng], {
                radius: radius, fillColor: color, color: '#fff', weight: 1.5, opacity: 0.9, fillOpacity: 0.75
            }).bindPopup(`<div class="popup-content"><strong>${mun.nome}</strong> - ${mun.uf}<br><span class="popup-value">${mun.count}</span> egresso(s)</div>`).addTo(modalMap);
        });
    }, 200);
}

// ============================================================
// CHARTS
// ============================================================
function updateCharts() {
    const egressos = filteredData.filter(d => d.egresso === 'Sim');
    
    createTurmaChart(egressos);
    createTaxaSucessoChart();
    createSexoChart(egressos);
    createRacaChart(egressos);
    createIdadeChart(egressos);
    createTitulacaoChart(egressos);
    createFormacaoChart(egressos);
    createTemaChart(egressos);
    createTipoTccChart(egressos);
    createAbrangenciaChart(egressos);
    createRegiaoChart(egressos);
    createProporcaoChart(egressos);
}

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        charts[id] = null;
    }
}

function countBy(arr, key) {
    const counts = {};
    arr.forEach(d => {
        const val = d[key] || 'Não informado';
        counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
}

function sortedEntries(obj, limit) {
    let entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    if (limit) entries = entries.slice(0, limit);
    return entries;
}

// Turma Chart
function createTurmaChart(data) {
    destroyChart('turmaChart');
    const counts = countBy(data, 'nometurma');
    const entries = sortedEntries(counts);
    
    charts['turmaChart'] = new Chart(document.getElementById('turmaChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'Egressos',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.secondary,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Taxa de Sucesso Chart
function createTaxaSucessoChart() {
    destroyChart('taxaSucessoChart');
    const turmas = [...new Set(DADOS_EPISUS.map(d => d.nometurma))].sort();
    const taxas = [];
    const labels = [];

    turmas.forEach(turma => {
        const turmaData = DADOS_EPISUS.filter(d => d.nometurma === turma);
        if (turmaData[0]?.statusturma === 'Finalizada') {
            const vagas = turmaData[0].vagas_ofertadas;
            const concluintes = turmaData.filter(d => d.egresso === 'Sim').length;
            const taxa = vagas > 0 ? ((concluintes / vagas) * 100).toFixed(1) : 0;
            labels.push(turma);
            taxas.push(parseFloat(taxa));
        }
    });

    charts['taxaSucessoChart'] = new Chart(document.getElementById('taxaSucessoChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Taxa de Sucesso (%)',
                data: taxas,
                backgroundColor: taxas.map(t => t >= 80 ? '#27ae60' : t >= 60 ? '#f39c12' : '#e74c3c'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#f0f0f0' }, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Sexo Chart
function createSexoChart(data) {
    destroyChart('sexoChart');
    const counts = countBy(data, 'sexo');
    const entries = sortedEntries(counts);

    charts['sexoChart'] = new Chart(document.getElementById('sexoChart'), {
        type: 'doughnut',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                data: entries.map(e => e[1]),
                backgroundColor: [COLORS.secondary, COLORS.primary, '#95a5a6'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.raw / total) * 100).toFixed(1);
                            return `${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Raça/Cor Chart
function createRacaChart(data) {
    destroyChart('racaChart');
    const counts = countBy(data, 'raca_cor');
    const entries = sortedEntries(counts);

    charts['racaChart'] = new Chart(document.getElementById('racaChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'Egressos',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.chart.slice(0, entries.length),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                y: { grid: { display: false } }
            }
        }
    });
}

// Faixa Etária Chart
function createIdadeChart(data) {
    destroyChart('idadeChart');
    const counts = countBy(data, 'idade');
    // Sort by age
    const entries = Object.entries(counts).sort((a, b) => {
        const numA = parseInt(a[0]);
        const numB = parseInt(b[0]);
        return numA - numB;
    });

    charts['idadeChart'] = new Chart(document.getElementById('idadeChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'Egressos',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.secondary,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Titulação Chart
function createTitulacaoChart(data) {
    destroyChart('titulacaoChart');
    const counts = countBy(data, 'maior_titulacao_antes');
    const order = ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'];
    const entries = order.map(o => [o, counts[o] || 0]).filter(e => e[1] > 0);

    charts['titulacaoChart'] = new Chart(document.getElementById('titulacaoChart'), {
        type: 'doughnut',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                data: entries.map(e => e[1]),
                backgroundColor: ['#3498db', '#E67E22', '#27ae60', '#9b59b6'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.raw / total) * 100).toFixed(1);
                            return `${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Formação Acadêmica Top 10
function createFormacaoChart(data) {
    destroyChart('formacaoChart');
    const counts = countBy(data, 'area_de_formacao');
    const entries = sortedEntries(counts, 10);

    charts['formacaoChart'] = new Chart(document.getElementById('formacaoChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'Egressos',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.chart.slice(0, 10),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                y: { grid: { display: false } }
            }
        }
    });
}

// Temas TCC
function createTemaChart(data) {
    destroyChart('temaChart');
    const filtered = data.filter(d => d.tema_grande_area);
    const counts = countBy(filtered, 'tema_grande_area');
    const entries = sortedEntries(counts, 15);

    charts['temaChart'] = new Chart(document.getElementById('temaChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'TCCs',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.secondary,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                y: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

// Tipo TCC
function createTipoTccChart(data) {
    destroyChart('tipoTccChart');
    const filtered = data.filter(d => d.tipo_trab_tcc);
    const counts = countBy(filtered, 'tipo_trab_tcc');
    const entries = sortedEntries(counts);

    charts['tipoTccChart'] = new Chart(document.getElementById('tipoTccChart'), {
        type: 'doughnut',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                data: entries.map(e => e[1]),
                backgroundColor: [COLORS.secondary, COLORS.primary, '#95a5a6'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.raw / total) * 100).toFixed(1);
                            return `${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Abrangência TCC
function createAbrangenciaChart(data) {
    destroyChart('abrangenciaChart');
    const filtered = data.filter(d => d.abrangencia_tcc);
    const counts = countBy(filtered, 'abrangencia_tcc');
    const entries = sortedEntries(counts);

    charts['abrangenciaChart'] = new Chart(document.getElementById('abrangenciaChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'TCCs',
                data: entries.map(e => e[1]),
                backgroundColor: COLORS.chart.slice(0, entries.length),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Região Chart
function createRegiaoChart(data) {
    destroyChart('regiaoChart');
    const counts = countBy(data, 'regiao_trab');
    const order = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
    const entries = order.map(r => [r, counts[r] || 0]);

    charts['regiaoChart'] = new Chart(document.getElementById('regiaoChart'), {
        type: 'bar',
        data: {
            labels: entries.map(e => e[0]),
            datasets: [{
                label: 'Egressos',
                data: entries.map(e => e[1]),
                backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Proporção Epidemiologistas por 200 mil hab (Top 10 UFs)
function createProporcaoChart(data) {
    destroyChart('proporcaoChart');
    
    // Group by UF
    const ufGroup = {};
    data.forEach(d => {
        if (!d.uf_trab) return;
        if (!ufGroup[d.uf_trab]) {
            ufGroup[d.uf_trab] = { count: 0, pop: 0 };
        }
        ufGroup[d.uf_trab].count++;
        // Use max population from municipalities in that UF
        if (d.popmun) {
            ufGroup[d.uf_trab].pop += d.popmun;
        }
    });

    // Actually we need total pop per UF - use sum of unique municipalities
    const ufMunPop = {};
    data.forEach(d => {
        if (!d.uf_trab || !d.mun_ibge_cod) return;
        const key = d.uf_trab;
        if (!ufMunPop[key]) ufMunPop[key] = {};
        ufMunPop[key][d.mun_ibge_cod] = d.popmun || 0;
    });

    const proporcoes = Object.entries(ufGroup).map(([uf, info]) => {
        const munPops = ufMunPop[uf] || {};
        const totalPop = Object.values(munPops).reduce((a, b) => a + b, 0);
        const prop = totalPop > 0 ? (info.count / totalPop * 200000).toFixed(2) : 0;
        return { uf, count: info.count, prop: parseFloat(prop) };
    }).sort((a, b) => b.prop - a.prop).slice(0, 10);

    charts['proporcaoChart'] = new Chart(document.getElementById('proporcaoChart'), {
        type: 'bar',
        data: {
            labels: proporcoes.map(p => p.uf),
            datasets: [{
                label: 'Por 200 mil hab.',
                data: proporcoes.map(p => p.prop),
                backgroundColor: proporcoes.map(p => p.prop >= 1 ? '#27ae60' : '#E67E22'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return `${ctx.raw} epidemiologistas por 200 mil hab.`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// ============================================================
// MODAL / EXPAND
// ============================================================
function expandChart(chartId) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = '<button class="modal-close" onclick="closeModal()">&times;</button><canvas id="modal-chart" style="max-height:70vh;"></canvas>';
    modal.classList.add('active');

    // Clone chart config
    const originalChart = charts[chartId];
    if (!originalChart) return;

    const config = JSON.parse(JSON.stringify(originalChart.config));
    config.options.maintainAspectRatio = false;
    
    setTimeout(() => {
        const modalCanvas = document.getElementById('modal-chart');
        modalCanvas.style.height = '60vh';
        new Chart(modalCanvas, config);
    }, 100);
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('active');
}

// Close modal on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
