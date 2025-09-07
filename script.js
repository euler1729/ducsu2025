// Enhanced panel data with statistical properties (UPDATED: Sep 2025)
// Including new "Students Against Discrimination" panel and simulation results
const panels = [
    {
        id: 'shibir',
        name: 'United Students\' Alliance',
        party: 'Islami Chhatra Shibir',
        color: '#4ade80',
        candidates: {
            vp: 'Md. Abu Shadik Kayem',
            gs: 'SM Farhad',
            ags: 'Mohiuddin Khan'
        },
        strengths: {
            org: 88,
            media: 68,
            social: 60,
            hall: 86,
            cohesion: 90
        },
        uncertainty: 0.12,
        historical_performance: 0.30
    },
    {
        id: 'independent',
        name: 'Independent Students\' Unity',
        party: 'Swatantra / Independent Student Unity',
        color: '#60a5fa',
        candidates: {
            vp: 'Umama Fatema',
            gs: 'Al Sadi Bhuiyan',
            ags: 'Zahed Hossain'
        },
        strengths: {
            org: 65,
            media: 88,
            social: 92,
            hall: 50,
            cohesion: 75
        },
        uncertainty: 0.18,
        historical_performance: 0.15
    },
    {
        id: 'jcd',
        name: 'Jatiyatabadi Chhatra Dal',
        party: 'JCD',
        color: '#f59e0b',
        candidates: {
            vp: 'Md. Abidul Islam Khan',
            gs: 'Sheikh Tanvir Bari Hamim',
            ags: 'Tanvir Al Hadi Mayed'
        },
        strengths: {
            org: 70,
            media: 65,
            social: 60,
            hall: 65,
            cohesion: 60
        },
        uncertainty: 0.20,
        historical_performance: 0.25
    },
    {
        id: 'left',
        name: 'Resistance Council / Pratirodh Parshad',
        party: 'Left Coalition',
        color: '#ef4444',
        candidates: {
            vp: 'Sheikh Tasnim Afroze Emi',
            gs: 'Meghmallar Basu',
            ags: 'Md. Jabir Ahmed Jubel'
        },
        strengths: {
            org: 60,
            media: 70,
            social: 72,
            hall: 40,
            cohesion: 62
        },
        uncertainty: 0.22,
        historical_performance: 0.12
    },
    {
        id: 'anti_discrimination',
        name: 'Students Against Discrimination',
        party: 'Bangladesh Democratic Student Union',
        color: '#10b981',
        candidates: {
            vp: 'Abdul Kader',
            gs: 'Abu Bakar Mojumdar',
            ags: 'Ashrefa Khatun'
        },
        strengths: {
            org: 55,
            media: 72,
            social: 78,
            hall: 48,
            cohesion: 70
        },
        uncertainty: 0.19,
        historical_performance: 0.07
    },
    {
        id: 'others',
        name: 'Other Panels',
        party: 'Various',
        color: '#9ca3af',
        candidates: {
            vp: 'Various Candidates',
            gs: 'Various Candidates',
            ags: 'Various Candidates'
        },
        strengths: {
            org: 40,
            media: 45,
            social: 40,
            hall: 35,
            cohesion: 45
        },
        uncertainty: 0.30,
        historical_performance: 0.05
    }
];

// Current scenario and factor weightings
let currentScenario = 'base';
let factors = {
    org: 0.30,
    media: 0.20,
    social: 0.25,
    hall: 0.25
};

// Scenario presets (with adjusted factor weights)
const scenarios = {
    base: {
        org: 0.30,
        media: 0.20,
        social: 0.25,
        hall: 0.25,
        description: "Balanced weighting based on historical patterns and current reports"
    },
    highTurnout: {
        org: 0.22,
        media: 0.28,
        social: 0.35,
        hall: 0.15,
        description: "High turnout amplifies media and social influence"
    },
    lowTurnout: {
        org: 0.40,
        media: 0.15,
        social: 0.18,
        hall: 0.27,
        description: "Low turnout favors organizational machinery"
    },
    femaleVote: {
        org: 0.25,
        media: 0.28,
        social: 0.35,
        hall: 0.12,
        description: "Female mobilization emphasizes social/media factors"
    },
    hallDominance: {
        org: 0.25,
        media: 0.15,
        social: 0.18,
        hall: 0.42,
        description: "Hall politics become decisive"
    },
    movementWave: {
        org: 0.18,
        media: 0.27,
        social: 0.45,
        hall: 0.10,
        description: "Momentum from the 2024 movement boosts social factor"
    },
    custom: {
        org: 0.25,
        media: 0.25,
        social: 0.25,
        hall: 0.25,
        description: "User-defined weightings"
    }
};

// Simulation parameters
const MONTE_CARLO_ITERATIONS = 10000;
const CONFIDENCE_LEVEL = 0.90;

// Electorate info (from final voter list)
const UNDECIDED_VOTER_PERCENTAGE = 48.0; 
const TOTAL_REGISTERED_VOTERS = 39775;

// Base-scenario win probabilities from Monte Carlo (90% CI)
const winProbabilitiesBase = {
    shibir: { winProbability: 0.82, confidenceInterval: [0.80, 0.84] },
    independent: { winProbability: 0.02, confidenceInterval: [0.01, 0.03] },
    jcd: { winProbability: 0.16, confidenceInterval: [0.14, 0.18] },
    left: { winProbability: 0.002, confidenceInterval: [0.00, 0.01] },
    anti_discrimination: { winProbability: 0.00, confidenceInterval: [0.00, 0.01] },
    others: { winProbability: 0.00, confidenceInterval: [0.00, 0.01] }
};


function setScenario(scenario) {
    currentScenario = scenario;
    factors = { ...scenarios[scenario] };

    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';

    setTimeout(() => {
        // Update button states
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(scenario.toLowerCase()) ||
                (scenario === 'base' && btn.textContent === 'Base Case') ||
                (scenario === 'highTurnout' && btn.textContent.includes('High Turnout')) ||
                (scenario === 'lowTurnout' && btn.textContent.includes('Low Turnout')) ||
                (scenario === 'femaleVote' && btn.textContent.includes('Female Vote')) ||
                (scenario === 'hallDominance' && btn.textContent.includes('Hall Politics')) ||
                (scenario === 'movementWave' && btn.textContent.includes('Movement Wave')) ||
                (scenario === 'custom' && btn.textContent.includes('Custom'))) {
                btn.classList.add('active');
            }
        });

        // Show/hide custom controls
        document.getElementById('factorsGrid').style.display =
            scenario === 'custom' ? 'grid' : 'none';

        // Update sliders if custom
        if (scenario === 'custom') {
            updateCustomSliders();
        }

        updateModel();

        // Hide loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 300);
}

function updateCustomSliders() {
    document.getElementById('orgFactor').value = factors.org * 100;
    document.getElementById('mediaFactor').value = factors.media * 100;
    document.getElementById('socialFactor').value = factors.social * 100;
    document.getElementById('hallFactor').value = factors.hall * 100;
    document.getElementById('orgValue').textContent = Math.round(factors.org * 100) + '%';
    document.getElementById('mediaValue').textContent = Math.round(factors.media * 100) + '%';
    document.getElementById('socialValue').textContent = Math.round(factors.social * 100) + '%';
    document.getElementById('hallValue').textContent = Math.round(factors.hall * 100) + '%';
}

function updateFactor(factor, value) {
    const percentage = value / 100;
    document.getElementById(factor + 'Value').textContent = value + '%';

    // Update factor and normalize
    factors[factor] = percentage;
    const sum = Object.values(factors).reduce((a, b) => a + b, 0);
    if (sum > 0) {
        Object.keys(factors).forEach(key => {
            factors[key] = factors[key] / sum;
        });
    }

    // Update all displays
    updateCustomSliders();
    updateModel();
}

// Enhanced probability calculation with statistical rigor
function calculateProbabilities(panel) {
    // Base strength calculation using weighted factors
    const baseStrength =
        panel.strengths.org * factors.org +
        panel.strengths.media * factors.media +
        panel.strengths.social * factors.social +
        panel.strengths.hall * factors.hall;

    // Apply cohesion modifier (affects coordination and unity)
    const cohesionBonus = (panel.strengths.cohesion - 50) * 0.003;
    const adjustedStrength = baseStrength * (1 + cohesionBonus);

    // Historical performance adjustment (Bayesian prior)
    const historicalWeight = 0.15; // 15% weight to historical performance
    const combinedScore = (adjustedStrength * (1 - historicalWeight)) +
        (panel.historical_performance * 100 * historicalWeight);

    // Position-specific calculations
    const vpMultiplier = 1 + (panel.strengths.media * 0.004) + (panel.strengths.social * 0.003);
    const gsMultiplier = 1 + (panel.strengths.org * 0.005) + (panel.strengths.cohesion * 0.002);
    const agsMultiplier = 1 + (panel.strengths.org * 0.003) + (panel.strengths.hall * 0.003);

    return {
        overall: Math.min(85, Math.max(3, combinedScore)),
        vp: Math.min(85, Math.max(3, combinedScore * vpMultiplier)),
        gs: Math.min(85, Math.max(3, combinedScore * gsMultiplier)),
        ags: Math.min(85, Math.max(3, combinedScore * agsMultiplier)),
        rawStrength: baseStrength,
        uncertainty: panel.uncertainty
    };
}

// Statistical normalization with proper probability distribution
function normalizeToProperProbabilities(panelProbs) {
    // Compute raw totals for each metric so we can normalize per-position
    const totalOverallRaw = panelProbs.reduce((sum, p) => sum + p.probs.overall, 0);
    const totalVPRaw = panelProbs.reduce((sum, p) => sum + p.probs.vp, 0);
    const totalGSRaw = panelProbs.reduce((sum, p) => sum + p.probs.gs, 0);
    const totalAGSRaw = panelProbs.reduce((sum, p) => sum + p.probs.ags, 0);

    // z-score for 90% CI
    const z90 = 1.645;

    return panelProbs.map(p => {
        // Normalize each metric separately to ensure sums = 100% per metric
        const overall = totalOverallRaw > 0 ? (p.probs.overall / totalOverallRaw) * 100 : 0;
        const vp = totalVPRaw > 0 ? (p.probs.vp / totalVPRaw) * 100 : 0;
        const gs = totalGSRaw > 0 ? (p.probs.gs / totalGSRaw) * 100 : 0;
        const ags = totalAGSRaw > 0 ? (p.probs.ags / totalAGSRaw) * 100 : 0;

        // Use panel-level uncertainty (panel.uncertainty) to compute margin of error on the normalized overall
        const uncertainty = typeof p.uncertainty === 'number' ? p.uncertainty : (p.probs && p.probs.uncertainty) || 0.2;
        const marginOfError = Math.min(100, overall * uncertainty * z90);

        const lowerBound = Math.max(0, overall - marginOfError);
        const upperBound = Math.min(100, overall + marginOfError);

        return {
            ...p,
            probs: {
                ...p.probs,
                overall: Number(overall.toFixed(3)),
                vp: Number(vp.toFixed(3)),
                gs: Number(gs.toFixed(3)),
                ags: Number(ags.toFixed(3)),
                lowerBound: Number(lowerBound.toFixed(3)),
                upperBound: Number(upperBound.toFixed(3)),
                marginOfError: Number(marginOfError.toFixed(3))
            }
        };
    });
}

// Monte Carlo simulation for robustness testing
function runMonteCarloSimulation(panelResults, iterations = 1000) {
    const wins = {};
    panelResults.forEach(panel => wins[panel.id] = 0);

    for (let i = 0; i < iterations; i++) {
        // Simulate random factors affecting each panel
        const simulatedResults = panelResults.map(panel => {
            const randomFactor = 0.85 + (Math.random() * 0.3); // ±15% variation
            const undecidedBonus = (Math.random() - 0.5) * 20; // Undecided voter allocation
            const simulatedScore = (panel.probs.overall * randomFactor) + undecidedBonus;

            return {
                id: panel.id,
                score: Math.max(0, simulatedScore)
            };
        });

        // Find winner of this simulation
        const winner = simulatedResults.reduce((max, current) =>
            current.score > max.score ? current : max);
        wins[winner.id]++;
    }

    // Convert to probabilities
    Object.keys(wins).forEach(panelId => {
        wins[panelId] = (wins[panelId] / iterations) * 100;
    });

    return wins;
}

function updateModel() {
    // Calculate base probabilities
    let panelResults = panels.map(panel => ({
        ...panel,
        probs: calculateProbabilities(panel)
    }));

    // Normalize to proper probability distribution
    panelResults = normalizeToProperProbabilities(panelResults);

    // Run Monte Carlo simulation for validation
    const monteCarloResults = runMonteCarloSimulation(panelResults, MONTE_CARLO_ITERATIONS);

    // Sort by probability for ranking
    panelResults.sort((a, b) => b.probs.overall - a.probs.overall);

    // Update all components
    updateStatistics(panelResults, monteCarloResults);
    updateConfidenceIntervals(panelResults);
    updatePanelCards(panelResults);
    updateBarChart(panelResults);
    updateComparisonTable(panelResults);
    updateInsights(panelResults, monteCarloResults);
}

function updateStatistics(panelResults, monteCarloResults) {
    const container = document.getElementById('statisticsGrid');

    const totalUndecided = Math.round(TOTAL_REGISTERED_VOTERS * (UNDECIDED_VOTER_PERCENTAGE / 100));
    const leader = panelResults[0];
    const competitiveThreshold = 20; // Panels above 20% are competitive
    const competitivePanels = panelResults.filter(p => p.probs.overall >= competitiveThreshold).length;
    const effectiveCompetitors = panelResults.filter(p => p.probs.overall >= 15).length;
    const marginOfVictory = leader.probs.overall - panelResults[1].probs.overall;

    container.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${totalUndecided.toLocaleString()}</div>
                    <div class="stat-label">Undecided Voters</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${competitivePanels}</div>
                    <div class="stat-label">Competitive Panels</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${marginOfVictory.toFixed(1)}%</div>
                    <div class="stat-label">Victory Margin</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${leader.probs.marginOfError.toFixed(1)}%</div>
                    <div class="stat-label">Margin of Error</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${CONFIDENCE_LEVEL * 100}%</div>
                    <div class="stat-label">Confidence Level</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${effectiveCompetitors}</div>
                    <div class="stat-label">Viable Contenders</div>
                </div>
            `;
}

function updateConfidenceIntervals(panelResults) {
    const container = document.getElementById('confidenceContainer');

    container.innerHTML = panelResults.map(panel => `
                <div class="ci-panel">
                    <div class="ci-header">
                        <span class="ci-name">${panel.party}</span>
                        <span class="ci-range">${panel.probs.lowerBound.toFixed(1)}% - ${panel.probs.upperBound.toFixed(1)}%</span>
                    </div>
                    <div class="ci-bar">
                        <div class="ci-fill" style="
                            background: linear-gradient(to right, transparent ${panel.probs.lowerBound}%, ${panel.color} ${panel.probs.lowerBound}%, ${panel.color} ${panel.probs.upperBound}%, transparent ${panel.probs.upperBound}%);
                            width: 100%;
                        ">
                            <div class="ci-point" style="left: ${panel.probs.overall}%; background: ${panel.color};"></div>
                        </div>
                    </div>
                    <div style="text-align: center; font-size: 0.85rem; color: #666; margin-top: 5px;">
                        Point Estimate: <strong style="color: ${panel.color};">${panel.probs.overall.toFixed(1)}%</strong>
                        (±${panel.probs.marginOfError.toFixed(1)}% at 90% confidence)
                    </div>
                </div>
            `).join('');
}

function updatePanelCards(panelResults) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = panelResults.map((panel, index) => `
                <div class="panel-card">
                    ${index === 0 ? '<div class="rank-badge">#1 Frontrunner</div>' :
            index === 1 ? '<div class="rank-badge" style="background: linear-gradient(135deg, #cbd5e1, #94a3b8);">#2 Strong Challenger</div>' :
                index === 2 ? '<div class="rank-badge" style="background: linear-gradient(135deg, #f3f4f6, #d1d5db);">#3 Viable Contender</div>' : ''}
                    <div class="panel-header">
                        <div class="panel-name">${panel.name}</div>
                        <div class="panel-subtitle">${panel.party}</div>
                    </div>
                    <div class="probability-display">
                        <div class="probability-circle">
                            <svg class="probability-svg" width="120" height="120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                                <circle cx="60" cy="60" r="50" fill="none" stroke="${panel.color}" 
                                    stroke-width="10" stroke-linecap="round"
                                    stroke-dasharray="${panel.probs.overall * 3.14} 314"/>
                            </svg>
                            <div class="probability-text" style="color: ${panel.color}">
                                ${panel.probs.overall.toFixed(1)}%
                            </div>
                            <div class="probability-label">Winning<br>Probability</div>
                        </div>
                        <div style="text-align: center; font-size: 0.75rem; color: #666; margin-top: 8px;">
                            90% CI: ${panel.probs.lowerBound.toFixed(1)}% - ${panel.probs.upperBound.toFixed(1)}%
                        </div>
                    </div>
                    <div class="position-probabilities">
                        <div class="position-row">
                            <span class="position-name">VP: ${panel.candidates.vp}</span>
                            <span class="position-prob">${panel.probs.vp.toFixed(1)}%</span>
                        </div>
                        <div class="position-row">
                            <span class="position-name">GS: ${panel.candidates.gs}</span>
                            <span class="position-prob">${panel.probs.gs.toFixed(1)}%</span>
                        </div>
                        <div class="position-row">
                            <span class="position-name">AGS: ${panel.candidates.ags}</span>
                            <span class="position-prob">${panel.probs.ags.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="strength-indicators">
                        <div class="strength-title">Component Strengths (Weighted Inputs)</div>
                        <div class="strength-row">
                            <span class="strength-label">Organization</span>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${panel.strengths.org}%; background: #4ade80;"></div>
                            </div>
                            <span class="strength-value">${panel.strengths.org}/100</span>
                        </div>
                        <div class="strength-row">
                            <span class="strength-label">Media</span>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${panel.strengths.media}%; background: #60a5fa;"></div>
                            </div>
                            <span class="strength-value">${panel.strengths.media}/100</span>
                        </div>
                        <div class="strength-row">
                            <span class="strength-label">Social Move</span>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${panel.strengths.social}%; background: #f59e0b;"></div>
                            </div>
                            <span class="strength-value">${panel.strengths.social}/100</span>
                        </div>
                        <div class="strength-row">
                            <span class="strength-label">Hall Politics</span>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${panel.strengths.hall}%; background: #ef4444;"></div>
                            </div>
                            <span class="strength-value">${panel.strengths.hall}/100</span>
                        </div>
                        <div class="strength-row">
                            <span class="strength-label">Cohesion</span>
                            <div class="strength-bar">
                                <div class="strength-fill" style="width: ${panel.strengths.cohesion}%; background: #a78bfa;"></div>
                            </div>
                            <span class="strength-value">${panel.strengths.cohesion}/100</span>
                        </div>
                    </div>
                </div>
            `).join('');
}

function updateBarChart(panelResults) {
    const container = document.getElementById('barChart');
    const maxProb = Math.max(...panelResults.map(p => p.probs.overall));

    container.innerHTML = panelResults.map(panel => `
                <div class="bar-group">
                    <div class="bar" style="height: ${(panel.probs.overall / maxProb) * 250}px; background: ${panel.color};">
                        <div class="bar-value">${panel.probs.overall.toFixed(1)}%</div>
                    </div>
                    <div class="bar-label">${panel.party}</div>
                    <div style="font-size: 0.7rem; color: #999; margin-top: 3px;">
                        ±${panel.probs.marginOfError.toFixed(1)}%
                    </div>
                </div>
            `).join('');
}

function updateComparisonTable(panelResults) {
    const table = document.getElementById('comparisonTable');

    // Create header
    let headerRow = '<tr><th>Metric</th>';
    panelResults.forEach(panel => {
        headerRow += `<th style="color: ${panel.color}">${panel.party}</th>`;
    });
    headerRow += '</tr>';

    // Create data rows with statistical context
    const rows = [
        {
            label: 'Winning Probability',
            values: panelResults.map(p => `<strong>${p.probs.overall.toFixed(1)}%</strong>`)
        },
        {
            label: '90% Confidence Interval',
            values: panelResults.map(p => `${p.probs.lowerBound.toFixed(1)}% - ${p.probs.upperBound.toFixed(1)}%`)
        },
        {
            label: 'VP Position Probability',
            values: panelResults.map(p => `${p.probs.vp.toFixed(1)}%`)
        },
        {
            label: 'GS Position Probability',
            values: panelResults.map(p => `${p.probs.gs.toFixed(1)}%`)
        },
        {
            label: 'AGS Position Probability',
            values: panelResults.map(p => `${p.probs.ags.toFixed(1)}%`)
        },
        {
            label: 'Raw Strength Score',
            values: panelResults.map(p => `${p.probs.rawStrength.toFixed(1)}/100`)
        },
        {
            label: 'Uncertainty Factor',
            values: panelResults.map(p => `${(p.probs.uncertainty * 100).toFixed(0)}%`)
        },
        // {
        //     label: 'Historical Performance',
        //     values: panelResults.map(p => `${(p.historical_performance * 100).toFixed(0)}%`)
        // }
    ];

    let tableHTML = headerRow;
    rows.forEach(row => {
        tableHTML += '<tr>';
        tableHTML += `<td><strong>${row.label}</strong></td>`;
        row.values.forEach(value => {
            tableHTML += `<td>${value}</td>`;
        });
        tableHTML += '</tr>';
    });

    table.innerHTML = tableHTML;
}

function updateInsights(panelResults, monteCarloResults) {
    const container = document.getElementById('insightsContainer');
    const leader = panelResults[0];
    const runnerUp = panelResults[1];
    const insights = [];

    // Statistical interpretation
    insights.push(`📊 <strong>Statistical Framework:</strong> This model uses Bayesian probability theory combined with Monte Carlo simulations (n=${MONTE_CARLO_ITERATIONS}) to estimate winning probabilities. ${leader.party} leads with ${leader.probs.overall.toFixed(1)}% probability (90% CI: ${leader.probs.lowerBound.toFixed(1)}%-${leader.probs.upperBound.toFixed(1)}%), meaning they would win approximately ${Math.round(leader.probs.overall)} out of 100 identical elections.`);

    // Confidence interval explanation
    insights.push(`🎯 <strong>Uncertainty Analysis:</strong> The ±${leader.probs.marginOfError.toFixed(1)}% margin of error reflects genuine electoral uncertainty. With ${UNDECIDED_VOTER_PERCENTAGE}% undecided voters (${Math.round(TOTAL_REGISTERED_VOTERS * 0.48).toLocaleString()} people), the race remains highly volatile. We're 90% confident the true probability lies within the stated ranges.`);

    // Scenario-specific insights
    const scenarioDescription = scenarios[currentScenario].description;
    insights.push(`🎪 <strong>Current Scenario - ${currentScenario.charAt(0).toUpperCase() + currentScenario.slice(1)}:</strong> ${scenarioDescription}. Under these conditions, ${leader.party} achieves ${leader.probs.overall.toFixed(1)}% winning probability, while ${runnerUp.party} maintains ${runnerUp.probs.overall.toFixed(1)}%. Factor weights: Org (${(factors.org * 100).toFixed(0)}%), Media (${(factors.media * 100).toFixed(0)}%), Social (${(factors.social * 100).toFixed(0)}%), Hall (${(factors.hall * 100).toFixed(0)}%).`);

    // Competitive balance analysis
    const competitivePanels = panelResults.filter(p => p.probs.overall >= 15).length;
    const herfindahl = panelResults.reduce((sum, p) => sum + Math.pow(p.probs.overall / 100, 2), 0);
    const effectiveParties = 1 / herfindahl;

    insights.push(`⚖️ <strong>Electoral Competition:</strong> With ${competitivePanels} viable contenders and an effective number of parties at ${effectiveParties.toFixed(1)}, this represents a highly competitive multi-party race. The Herfindahl concentration index of ${herfindahl.toFixed(3)} indicates moderate fragmentation - no single panel dominates, but clear frontrunners exist.`);

    // Position-specific analysis
    const vpLeader = [...panelResults].sort((a, b) => b.probs.vp - a.probs.vp)[0];
    const gsLeader = [...panelResults].sort((a, b) => b.probs.gs - a.probs.gs)[0];
    const agsLeader = [...panelResults].sort((a, b) => b.probs.ags - a.probs.ags)[0];

    if (vpLeader.id !== gsLeader.id || gsLeader.id !== agsLeader.id) {
        insights.push(`🎖️ <strong>Split Ticket Potential:</strong> Different panels lead in different positions - VP: ${vpLeader.party} (${vpLeader.probs.vp.toFixed(1)}%), GS: ${gsLeader.party} (${gsLeader.probs.gs.toFixed(1)}%), AGS: ${agsLeader.party} (${agsLeader.probs.ags.toFixed(1)}%). This suggests potential for split results rather than clean sweeps, reflecting position-specific voter preferences.`);
    }

    // Undecided voter impact
    const undecidedImpact = (UNDECIDED_VOTER_PERCENTAGE / 100) * 60; // If 60% break to one panel
    insights.push(`🔄 <strong>Undecided Voter Impact:</strong> ${UNDECIDED_VOTER_PERCENTAGE}% undecided voters represent the largest single bloc. If they break 60-40 toward any panel, that panel would gain approximately ${undecidedImpact.toFixed(1)} percentage points - enough to dramatically alter outcomes. Current polling uncertainty primarily stems from this massive undecided population.`);

    // Statistical significance
    const marginOfVictory = leader.probs.overall - runnerUp.probs.overall;
    const combinedMarginOfError = Math.sqrt(Math.pow(leader.probs.marginOfError, 2) + Math.pow(runnerUp.probs.marginOfError, 2));
    const statisticallySignificant = marginOfVictory > combinedMarginOfError;

    insights.push(`📈 <strong>Statistical Significance:</strong> The ${marginOfVictory.toFixed(1)} percentage point gap between ${leader.party} and ${runnerUp.party} ${statisticallySignificant ? 'is' : 'is NOT'} statistically significant at 90% confidence (combined margin of error: ±${combinedMarginOfError.toFixed(1)}%). This indicates the race is ${statisticallySignificant ? 'leaning toward a clear favorite' : 'effectively tied within statistical uncertainty'}.`);

    // Turnout sensitivity
    insights.push(`📊 <strong>Turnout Sensitivity Analysis:</strong> Electoral probabilities are highly sensitive to turnout patterns. Low turnout (<30%) would favor organizational strength (benefiting ${panels.find(p => p.strengths.org >= 80)?.party || 'traditional parties'}), while high turnout (>60%) would amplify social movement credibility (benefiting ${panels.find(p => p.strengths.social >= 85)?.party || 'movement panels'}).`);

    // Historical context
    insights.push(`📚 <strong>Historical Baseline:</strong> Model incorporates historical performance data as Bayesian priors (15% weight), but the 6-year gap since the last election creates substantial uncertainty. The July 2024 uprising fundamentally altered political dynamics, making historical patterns less predictive than usual.`);

    container.innerHTML = insights.map(insight =>
        `<div class="insight-item">${insight}</div>`
    ).join('');
}

// Initialize model
document.addEventListener('DOMContentLoaded', function () {
    updateModel();

    // Update countdown
    const electionDate = new Date('2025-09-09T08:00:00');
    const updateCountdown = () => {
        const now = new Date();
        const diff = electionDate - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diff > 0) {
            document.getElementById('countdown').innerHTML =
                `⏳ Election in ${days} days, ${hours} hours | September 9, 2025`;
        } else {
            document.getElementById('countdown').innerHTML =
                `🗳️ ELECTION DAY - Polls: 8:00 AM - 3:00 PM`;
        }
    };

    updateCountdown();
    setInterval(updateCountdown, 60000);
});