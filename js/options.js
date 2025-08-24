console.log("Secure Lens Pro: Enhanced options page loaded");

const DEFAULT_SETTINGS = {
  autoBanner: true,
  phishingWarnings: true,
  trackerHeuristics: true,
  blacklistBlocking: true,
  advancedAnalysis: true,
  realTimeScoring: true,
  typosquattingDetection: true
};

// Load settings
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(settings) {
    document.getElementById('autoBanner').checked = settings.autoBanner;
    document.getElementById('phishingWarnings').checked = settings.phishingWarnings;
    document.getElementById('trackerHeuristics').checked = settings.trackerHeuristics;
    document.getElementById('blacklistBlocking').checked = settings.blacklistBlocking;
    document.getElementById('realTimeScoring').checked = settings.realTimeScoring;
    document.getElementById('typosquattingDetection').checked = settings.typosquattingDetection;

    console.log('Settings loaded:', settings);
  });
}

// Save settings
function saveSettings() {
  const settings = {
    autoBanner: document.getElementById('autoBanner').checked,
    phishingWarnings: document.getElementById('phishingWarnings').checked,
    trackerHeuristics: document.getElementById('trackerHeuristics').checked,
    blacklistBlocking: document.getElementById('blacklistBlocking').checked,
    realTimeScoring: document.getElementById('realTimeScoring').checked,
    typosquattingDetection: document.getElementById('typosquattingDetection').checked
  };

  chrome.storage.sync.set(settings, function() {
    console.log('Settings saved:', settings);
    showNotification('Settings saved successfully!');
  });
}

// Load stats
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getDomainStats' }, function(stats) {
    if (stats) {
      document.getElementById('total-analyses').textContent = stats.totalAnalyses || 0;
      document.getElementById('threats-blocked').textContent = stats.threatsBlocked || 0;
      document.getElementById('suspicious-detected').textContent = stats.suspiciousDetected || 0;
      document.getElementById('domains-tracked').textContent = stats.totalDomains || 0;
    }
  });
}

// Clear all stored data
function clearAllData() {
  if (confirm('Are you sure you want to clear all analysis data and statistics? This cannot be undone.')) {
    chrome.storage.local.clear(function() {
      chrome.storage.local.set({
        blacklist: [],
        threatDatabase: {},
        domainReputation: {},
        analysisHistory: []
      }, function() {
        showNotification('All data cleared successfully!');
        loadStats();
      });
    });
  }
}

// Show notification (stackable)
function showNotification(message) {
  const containerId = "secure-lens-notifications";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 10000;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  notification.style.cssText = `
    background: #10B981;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    animation: fadeIn 0.3s ease-out;
  `;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = "opacity 0.3s ease";
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 300);
  }, 3000);
}

// Modal close function with fade out
function closeModal() {
  const modal = document.getElementById('analysis-modal');
  if (modal) {
    modal.style.transition = "opacity 0.3s ease";
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
  }
}

// Example modal injection (you can call this function where needed)
function showAnalysisModal() {
  const modalWrapper = document.createElement('div');
  modalWrapper.id = "analysis-modal";
  modalWrapper.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1F2937;
    color: white;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    opacity: 1;
    transition: opacity 0.3s ease;
    z-index: 9999;
  `;

  modalWrapper.innerHTML = `
    <div style="background: linear-gradient(135deg, #374151, #1F2937); padding: 20px; border-radius: 12px 12px 0 0; border-bottom: 1px solid #4B5563;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #F9FAFB; font-size: 20px; font-weight: 700;">
          🔍 Advanced Security Analysis
        </h3>
        <button onclick="closeModal()" 
                style="background: none; border: none; color: #9CA3AF; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
                onmouseover="this.style.background='#374151'; this.style.color='#F9FAFB'"
                onmouseout="this.style.background='none'; this.style.color='#9CA3AF'">
          ✕
        </button>
      </div>
    </div>
    <div style="padding: 20px;">
      <p>This is where your analysis details will go.</p>
    </div>
  `;

  document.body.appendChild(modalWrapper);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  loadStats();

  ['autoBanner', 'phishingWarnings', 'trackerHeuristics', 'blacklistBlocking', 'realTimeScoring', 'typosquattingDetection'].forEach(id => {
    document.getElementById(id).addEventListener('change', saveSettings);
  });
});
