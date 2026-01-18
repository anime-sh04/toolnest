const stopWords = [
    "the","is","in","and","to","of","a","for","on","with","as","by","an","at","from"
];

let charCountMode = 'with'; // 'with' or 'without'
let saveTimeout;

// Auto-save on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedText = localStorage.getItem('essayDraft');
    if (savedText) {
        document.getElementById("essayInput").value = savedText;
        analyzeEssay();
        showAutoSaveIndicator();
    }
});

function analyzeEssay() {
    const text = document.getElementById("essayInput").value;

    /* WORDS */
    const wordsArr = text.trim().match(/\b\w+\b/g) || [];
    const words = wordsArr.length;

    /* CHARACTERS */
    const charactersWithSpaces = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, '').length;

    /* SENTENCES */
    const sentences = (text.match(/[.!?]+/g) || []).length;

    /* PAGES (250 words per page) */
    const pages = words > 0 ? (words / 250).toFixed(1) : 0;

    /* READING TIME (200 wpm) */
    const readingTime = words > 0 ? (words / 200).toFixed(1) : 0;

    /* UPDATE UI */
    document.getElementById("wordCount").innerText = words;
    updateCharCount(charactersWithSpaces, charactersWithoutSpaces);
    document.getElementById("sentenceCount").innerText = sentences;
    document.getElementById("pageCount").innerText = pages;
    document.getElementById("readingTime").innerText = readingTime + " min";

    analyzeKeywords(wordsArr);
    detectEducationLevel(words);
    
    // Update essay type tips if an essay type is selected
    const essayType = document.getElementById("essayType").value;
    if (essayType) {
        updateEssayTypeTips();
    }
}

function updateCharCount(withSpaces, withoutSpaces) {
    const charCountEl = document.getElementById("charCount");
    const charLabelEl = document.getElementById("charLabel");
    
    if (charCountMode === 'with') {
        charCountEl.innerText = withSpaces;
        charLabelEl.innerText = "CHARACTERS (WITH SPACES)";
    } else {
        charCountEl.innerText = withoutSpaces;
        charLabelEl.innerText = "CHARACTERS (WITHOUT SPACES)";
    }
}

function toggleCharCount() {
    charCountMode = charCountMode === 'with' ? 'without' : 'with';
    const text = document.getElementById("essayInput").value;
    const charactersWithSpaces = text.length;
    const charactersWithoutSpaces = text.replace(/\s/g, '').length;
    updateCharCount(charactersWithSpaces, charactersWithoutSpaces);
    
    const toggleBtn = document.getElementById("charToggle");
    toggleBtn.innerText = charCountMode === 'with' ? 'Without spaces' : 'With spaces';
}

// Auto-save functionality
function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
        const text = document.getElementById("essayInput").value;
        localStorage.setItem('essayDraft', text);
        showAutoSaveIndicator();
    }, 1000); // Save after 1 second of inactivity
}

function showAutoSaveIndicator() {
    const indicator = document.getElementById("autoSaveIndicator");
    indicator.classList.add('show');
    setTimeout(function() {
        indicator.classList.remove('show');
    }, 2000);
}

// Essay type tips
const essayTypeInfo = {
    narrative: {
        range: "500-1,000 words",
        tips: "Focus on storytelling with a clear beginning, middle, and end. Use descriptive language and show character development."
    },
    argumentative: {
        range: "1,000-2,500 words",
        tips: "Present a clear thesis, provide evidence, address counterarguments, and use logical reasoning to persuade readers."
    },
    descriptive: {
        range: "500-1,500 words",
        tips: "Use vivid sensory details, figurative language, and specific observations to create a vivid picture for readers."
    },
    expository: {
        range: "800-2,000 words",
        tips: "Explain a topic clearly with facts, examples, and logical organization. Use a neutral, informative tone."
    }
};

function updateEssayTypeTips() {
    const essayType = document.getElementById("essayType").value;
    const tipsEl = document.getElementById("essayTypeTips");
    
    if (essayType && essayTypeInfo[essayType]) {
        const info = essayTypeInfo[essayType];
        const words = parseInt(document.getElementById("wordCount").innerText) || 0;
        
        // Parse range (e.g., "500-1,000 words")
        const rangeMatch = info.range.match(/(\d+),?(\d*)\s*-\s*(\d+),?(\d*)/);
        let statusText = '';
        
        if (rangeMatch && words > 0) {
            const min = parseInt(rangeMatch[1] + (rangeMatch[2] || ''));
            const max = parseInt(rangeMatch[3] + (rangeMatch[4] || ''));
            
            if (words < min) {
                statusText = `<span style="color: #E53E3E;">You need ${min - words} more words to meet the minimum.</span>`;
            } else if (words > max) {
                statusText = `<span style="color: #D69E2E;">You're ${words - max} words over the recommended maximum.</span>`;
            } else {
                statusText = `<span style="color: #38A169;">✓ Your word count is within the recommended range!</span>`;
            }
        }
        
        tipsEl.innerHTML = `
            <strong>Recommended word range: ${info.range}</strong>
            ${statusText ? `<div style="margin-top: 6px;">${statusText}</div>` : ''}
            <div style="margin-top: 8px;">${info.tips}</div>
        `;
        tipsEl.style.display = 'block';
    } else {
        tipsEl.style.display = 'none';
    }
}

// Education level detection
function detectEducationLevel(wordCount) {
    const levelEl = document.getElementById("educationLevel");
    
    let level = '';
    let message = '';
    
    if (wordCount === 0) {
        levelEl.classList.remove('show');
        return;
    } else if (wordCount < 300) {
        level = 'School';
        message = 'This length fits a school-level essay (elementary/middle school).';
    } else if (wordCount < 1000) {
        level = 'College';
        message = 'This length fits a college-level essay.';
    } else {
        level = 'University';
        message = 'This length fits a university-level essay.';
    }
    
    levelEl.innerHTML = `<strong>${level}</strong> - ${message}`;
    levelEl.classList.add('show');
}

function analyzeKeywords(wordsArr) {
    const freq = {};

    wordsArr.forEach(word => {
        word = word.toLowerCase();
        if (!stopWords.includes(word)) {
            freq[word] = (freq[word] || 0) + 1;
        }
    });

    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const table = document.getElementById("keywordTable");
    table.innerHTML = "";

    sorted.forEach(([word, count]) => {
        const percent = ((count / wordsArr.length) * 100).toFixed(1);
        table.innerHTML += `
            <tr>
                <td>${word}</td>
                <td>${count}</td>
                <td>${percent}%</td>
            </tr>
        `;
    });
}
