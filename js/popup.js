console.log("Secure Lens Pro: Enhanced popup loaded");

let currentAnalysis = null;

function updatePopupDisplay(analysis) {
  if (!analysis) {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
    return;
  }

  currentAnalysis = analysis;

  document.getElementById('loading').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';

  const overallScore = analysis.overallScore || 0;
  const phishingScore = analysis.phishingScore || 0;
  const reputationScore = analysis.reputation ? analysis.reputation.score : 50;

  document.getElementById('overall-score').textContent = overallScore;
  document.getElementById('overall-score').style.color = getScoreColor(overallScore);

  document.getElementById('phishing-score').textContent = phishingScore;
  document.getElementById('phishing-score').style.color = getScoreColor(phishingScore);

  document.getElementById('reputation-score').textContent = reputationScore;
  document.getElementById('reputation-score').style.color = getScoreColor(100 - reputationScore);

  const verdict = analysis.verdict || 'unknown';
  const verdictElement = document.getElementById('verdict');
  verdictElement.textContent = verdict.toUpperCase();
  verdictElement.style.color = getVerdictColor(verdict);

  document.getElementById('risk-level').textContent = analysis.riskLevel || 'Unknown';

  document.getElementById('domain').textContent = analysis.domain || 'Unknown';
}

function getScoreColor(score) {
  if (score >= 70) return '#EF4444';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#3B82F6';
  return '#10B981';
}

function getVerdictColor(verdict) {
  switch (verdict) {
    case 'secure': return '#10B981';
    case 'caution': return '#3B82F6';
    case 'suspicious': return '#F59E0B';
    case 'blacklisted': return '#EF4444';
    default: return '#6B7280';
  }
}

function analyzeCurrentTab() {
  updatePopupDisplay(null); 
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.runtime.sendMessage({
        action: 'analyzeUrl',
        url: tabs[0].url
      }, function(analysis) {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          showError('Failed to analyze page');
        } else if (analysis) {
          updatePopupDisplay(analysis);
        } else {
          showError('No analysis data received');
        }
      });
    } else {
      showError('No active tab found');
    }
  });
}

function clearDomainCookies() {
  if (!currentAnalysis || !currentAnalysis.domain) {
    alert('No domain information available');
    return;
  }

  chrome.runtime.sendMessage({
    action: 'clearCookies',
    domain: currentAnalysis.domain
  }, function(response) {
    if (response && response.success) {
      alert(`✅ Successfully cleared ${response.cleared} cookies for ${currentAnalysis.domain}`);
    } else {
      alert('❌ Error clearing cookies: ' + (response ? response.error : 'Unknown error'));
    }
  });
}

function showError(message) {
  document.getElementById('loading').innerHTML = `<div style="color: #EF4444;">❌ ${message}</div>`;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('main-content').style.display = 'none';
}

document.getElementById('analyze').onclick = analyzeCurrentTab;
document.getElementById('clear-cookies').onclick = clearDomainCookies;
document.getElementById('options').onclick = function() {
  chrome.runtime.openOptionsPage();
  window.close();
};

document.addEventListener('DOMContentLoaded', function() {
  analyzeCurrentTab();
});