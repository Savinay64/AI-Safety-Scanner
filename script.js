const configPanel = document.getElementById('configPanel');
const scannerPanel = document.getElementById('scannerPanel');
const btnSaveConfig = document.getElementById('btnSaveConfig');
const btnEditConfig = document.getElementById('btnEditConfig');
const btnScanImage = document.getElementById('btnScanImage');
const btnScanText = document.getElementById('btnScanText');
const inpEndpoint = document.getElementById('azureEndpoint');
const inpKey = document.getElementById('azureKey');
const inpUrl = document.getElementById('imageUrl');
const textInput = document.getElementById('textInput');
const imgPreview = document.getElementById('imagePreview');
const placeholderBox = document.getElementById('placeholderBox');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loaderText');
const resultsPanel = document.getElementById('resultsPanel');
const dynamicReport = document.getElementById('dynamicReport');
const verdictBox = document.getElementById('verdictBox');

let AZURE_ENDPOINT = "";
let AZURE_KEY = "";
let currentMode = 'image'; // 'image' or 'text'

// --- EXPANDED BAD WORDS LIST ---
// Aap isme aur words add kar sakte hain zaroorat ke hisaab se
const BAD_WORDS = [
    "stupid", "idiot", "dumb", "fool",
    "hate", "kill", "murder", "die", "death", "dead",
    "attack", "bomb", "blast", "explode",
    "terrorist", "terrorism", "weapon", "gun", "knife",
    "spam", "scam", "fake", "fraud",
    "bad", "wrong", "evil", "curse", "damn", "hell",
    "suicide", "hurt", "pain", "blood", "gore"
];

// 1. Save Config
btnSaveConfig.addEventListener('click', () => {
    let endpoint = inpEndpoint.value.trim();
    const key = inpKey.value.trim();
    if (!endpoint || !key) { alert("Please enter Endpoint and Key!"); return; }
    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
    AZURE_ENDPOINT = endpoint;
    AZURE_KEY = key;
    configPanel.style.display = 'none';
    scannerPanel.style.display = 'block';
    inpKey.value = "";
});

// 2. Edit Config
btnEditConfig.addEventListener('click', () => {
    scannerPanel.style.display = 'none';
    configPanel.style.display = 'block';
    resultsPanel.style.display = 'none';
    imgPreview.style.display = 'none';
    placeholderBox.style.display = 'block';
});

// 3. Tab Switching Logic
window.switchTab = function (mode) {
    currentMode = mode;
    const imgTab = document.getElementById('imageTabContent');
    const textTab = document.getElementById('textTabContent');
    const btns = document.querySelectorAll('.tab-btn');

    if (mode === 'image') {
        imgTab.style.display = 'block';
        textTab.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        imgTab.style.display = 'none';
        textTab.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }

    resultsPanel.style.display = 'none';
    dynamicReport.innerHTML = '';
    verdictBox.className = 'verdict-box';
    verdictBox.innerHTML = '';
};

// 4. Image Scan Logic
btnScanImage.addEventListener('click', async () => {
    const imageUrl = inpUrl.value.trim();
    if (!imageUrl) { alert("Please enter an Image URL"); return; }

    startLoading("Step 1: Analyzing Image Content...");
    let isUnsafe = false;

    try {
        imgPreview.src = imageUrl;
        imgPreview.onerror = () => { throw new Error("Image URL invalid."); };
        imgPreview.onload = () => { imgPreview.style.display = 'block'; placeholderBox.style.display = 'none'; };

        // Step 1: Image Safety
        const url = `${AZURE_ENDPOINT}/vision/v3.2/analyze?visualFeatures=Categories`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl })
        });
        if (!response.ok) throw new Error(`Image Scan Failed: ${response.status}`);
        const data = await response.json();

        const imageResult = processImageResults(data);
        if (imageResult.unsafe) isUnsafe = true;

        let html = `<div class="report-section"><h4>🖼️ Image Content Safety</h4>`;
        html += renderImageMetrics(imageResult);
        html += `</div>`;

        // Step 2: OCR & Text Scan
        loaderText.innerText = "Step 2: Extracting & Analyzing Text...";
        const ocrUrl = `${AZURE_ENDPOINT}/vision/v3.2/read/analyze`;
        const ocrResponse = await fetch(ocrUrl, {
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl })
        });
        if (!ocrResponse.ok) throw new Error(`OCR Failed: ${ocrResponse.status}`);

        const operationLocation = ocrResponse.headers.get('Operation-Location');
        const ocrResult = await pollOcrResult(operationLocation);

        const textResult = processTextResults(ocrResult);
        if (textResult.unsafe) isUnsafe = true;

        html += `<div class="report-section"><h4>📝 Extracted Text Analysis</h4>`;
        html += renderTextMetrics(textResult);
        html += `</div>`;

        dynamicReport.innerHTML = html;
        showFinalVerdict(isUnsafe);

    } catch (error) {
        handleError(error);
    }
});

// 5. Text Scan Logic (FIXED)
btnScanText.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) { alert("Please enter some text"); return; }

    startLoading("Analyzing Text...");

    // Small delay for better UX
    setTimeout(() => {
        // Pass direct string to processor
        const textResult = processTextResults(text);
        const isUnsafe = textResult.unsafe;

        let html = `<div class="report-section"><h4>📝 Direct Text Analysis</h4>`;
        html += renderTextMetrics(textResult);
        html += `</div>`;

        dynamicReport.innerHTML = html;
        showFinalVerdict(isUnsafe);
    }, 600);
});

// Helpers
function startLoading(msg) {
    resultsPanel.style.display = 'none';
    loader.style.display = 'block';
    loaderText.innerText = msg;
    dynamicReport.innerHTML = '';
    verdictBox.className = 'verdict-box';
    verdictBox.innerHTML = '';
}

function handleError(error) {
    console.error(error);
    alert("Scan Failed: " + error.message);
    loader.style.display = 'none';
    if (currentMode === 'image') placeholderBox.style.display = 'block';
}

async function pollOcrResult(operationLocation) {
    while (true) {
        const response = await fetch(operationLocation, { headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY } });
        const result = await response.json();
        if (result.status === 'succeeded') return result;
        if (result.status === 'failed') throw new Error("OCR Processing Failed");
        await new Promise(r => setTimeout(r, 1000));
    }
}

function processImageResults(data) {
    let adultScore = 0, racyScore = 0;
    if (data.categories) {
        data.categories.forEach(cat => {
            if (cat.name.startsWith('adult_') && cat.score > adultScore) adultScore = cat.score;
            if (cat.name.startsWith('racy_') && cat.score > racyScore) racyScore = cat.score;
        });
    }
    return { unsafe: (adultScore > 0.5 || racyScore > 0.5), adult: adultScore, racy: racyScore };
}

function processTextResults(inputData) {
    let fullText = "";

    // Handle both OCR object and direct string input
    if (typeof inputData === 'string') {
        fullText = inputData;
    } else if (inputData.analyzeResult && inputData.analyzeResult.readResults) {
        inputData.analyzeResult.readResults[0].lines.forEach(line => {
            fullText += line.text + " ";
        });
    }

    // Convert to lowercase for case-insensitive matching
    const lowerText = fullText.toLowerCase();

    // Filter words that exist in our text
    const foundWords = BAD_WORDS.filter(word => lowerText.includes(word));

    return {
        unsafe: foundWords.length > 0,
        text: fullText.trim(),
        badWords: foundWords
    };
}

function renderImageMetrics(result) {
    let html = '';
    if (result.adult > 0 || result.racy > 0) {
        if (result.adult > 0) {
            const risk = result.adult > 0.5 ? 'level-danger' : 'level-safe';
            html += `<div class="metric-item"><span class="metric-name">Adult Content</span><span class="metric-value ${risk}">${(result.adult * 100).toFixed(1)}%</span></div>`;
        }
        if (result.racy > 0) {
            const risk = result.racy > 0.5 ? 'level-danger' : 'level-safe';
            html += `<div class="metric-item"><span class="metric-name">Racy Content</span><span class="metric-value ${risk}">${(result.racy * 100).toFixed(1)}%</span></div>`;
        }
    } else {
        html = '<p style="opacity:0.6; font-size:0.9rem;">✅ No unsafe visual content detected.</p>';
    }
    return html;
}

function renderTextMetrics(result) {
    let html = `<div class="text-preview">"${result.text}"</div>`;
    if (result.unsafe) {
        // Show unique bad words found
        const uniqueWords = [...new Set(result.badWords)];
        html += `<div class="metric-item"><span class="metric-name">⚠️ Unwanted Words Found:</span><span class="metric-value level-danger">${uniqueWords.join(', ')}</span></div>`;
    } else {
        html += `<div class="metric-item"><span class="metric-name">Text Safety</span><span class="metric-value level-safe">Clean</span></div>`;
    }
    return html;
}

function showFinalVerdict(isUnsafe) {
    loader.style.display = 'none';
    resultsPanel.style.display = 'block';
    verdictBox.className = 'verdict-box ' + (isUnsafe ? 'verdict-unsafe' : 'verdict-safe');
    verdictBox.innerHTML = isUnsafe ? "⚠️ UNSAFE CONTENT DETECTED!" : "✅ CONTENT IS SAFE";
}