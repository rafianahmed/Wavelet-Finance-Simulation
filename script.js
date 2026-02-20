let prices = [];
let returns = [];
let priceChart, returnChart, waveletChart;

function generateMarket() {
    const sigma = parseFloat(document.getElementById("volatility").value);
    const shockIntensity = parseFloat(document.getElementById("shock").value);

    prices = [100];
    returns = [];

    for (let i = 1; i < 256; i++) {
        let shock = (Math.random() < 0.05) ? 
            shockIntensity * (Math.random() - 0.5) : 0;

        let ret = sigma * (Math.random() - 0.5) + shock;
        returns.push(ret);

        prices.push(prices[i - 1] * Math.exp(ret / 100));
    }

    plotPrice();
    plotReturns();
}

function plotPrice() {
    if (priceChart) priceChart.destroy();

    priceChart = new Chart(document.getElementById("priceChart"), {
        type: 'line',
        data: {
            labels: prices.map((_, i) => i),
            datasets: [{
                label: "Simulated Price",
                data: prices,
                borderColor: "blue",
                fill: false
            }]
        }
    });
}

function plotReturns() {
    if (returnChart) returnChart.destroy();

    returnChart = new Chart(document.getElementById("returnChart"), {
        type: 'line',
        data: {
            labels: returns.map((_, i) => i),
            datasets: [{
                label: "Log Returns",
                data: returns,
                borderColor: "red",
                fill: false
            }]
        }
    });
}

function morlet(t, scale) {
    return Math.exp(-t * t / (2 * scale * scale)) * Math.cos(5 * t / scale);
}

function analyzeWavelet() {
    let scales = [1, 2, 4, 8, 16, 32];
    let energy = [];

    for (let s of scales) {
        let total = 0;
        for (let i = 0; i < returns.length; i++) {
            total += returns[i] * morlet(i / 20, s);
        }
        energy.push(Math.abs(total));
    }

    if (waveletChart) waveletChart.destroy();

    waveletChart = new Chart(document.getElementById("waveletChart"), {
        type: 'bar',
        data: {
            labels: scales,
            datasets: [{
                label: "Wavelet Energy",
                data: energy,
                backgroundColor: "purple"
            }]
        }
    });

    interpret(scales, energy);
}

function interpret(scales, energy) {
    let maxIndex = energy.indexOf(Math.max(...energy));
    let dominant = scales[maxIndex];

    let text = `
    Dominant Time Horizon: Scale ${dominant}

    • Small scales → High-frequency trading activity / noise
    • Medium scales → Swing trading cycles
    • Large scales → Long-term trend dominance

    If small scales dominate → Market is noisy or volatile.
    If large scales dominate → Strong macro trend regime.
    Broad energy spread → High volatility clustering.
    `;

    document.getElementById("analysisText").innerText = text;
}
