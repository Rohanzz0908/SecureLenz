console.log("Secure Lens Pro: Enhanced content script loaded on", window.location.href);

let banner = null;
let modal = null;
let currentAnalysis = null;

function showEnhancedBanner(analysis) {
  removeBanner();

  banner = document.createElement('div');
  banner.id = 'secure-lens-pro-banner';
  banner.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    z-index: 2147483647 !important;
    padding: 15px 25px !important;
    color: white !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
    font-size: 14px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
    backdrop-filter: blur(10px) !important;
    animation: slideDown 0.3s ease-out !important;
    ${getEnhancedVerdictStyle(analysis.verdict, analysis.overallScore)}
  `;

  const threatLevel = getThreatLevelText(analysis.overallScore);
  const phishingRisk = getPhishingRiskText(analysis.phishingScore);

   banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="font-size: 20px;">${getThreatIcon(analysis.verdict)}</div>
      <div>
        <div style="font-weight: 700; font-size: 16px;">
          Secure Lens Pro: ${analysis.verdict.toUpperCase()}
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">
          Overall Threat: ${analysis.overallScore}/100 (${threatLevel}) | 
          Phishing Risk: ${analysis.phishingScore}/100 (${phishingRisk})
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <button id="sl-details" style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
        🔍 Detailed Analysis
      </button>
      <button id="sl-cookies" style="padding: 8px 16px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
        🍪 Clear Cookies
      </button>
      <button id="sl-close" style="padding: 8px 12px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
        ✕
      </button>
    </div>
  `;


  document.body.appendChild(banner);
  document.body.style.marginTop = '70px';


  const detailsBtn = document.getElementById('sl-details');
  const cookiesBtn = document.getElementById('sl-cookies');
  const closeBtn = document.getElementById('sl-close');

  [detailsBtn, cookiesBtn, closeBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.3)';
      btn.style.transform = 'translateY(-1px)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(255,255,255,0.2)';
      btn.style.transform = 'translateY(0)';
    });
  });

  detailsBtn.onclick = () => showEnhancedModal(analysis);
  cookiesBtn.onclick = () => clearCookiesWithFeedback(analysis.domain);
  closeBtn.onclick = removeBanner;
}

function getEnhancedVerdictStyle(verdict, score) {
  const baseStyle = `
    background: linear-gradient(135deg, {color1}, {color2}) !important;
    border-bottom: 3px solid {accent} !important;
  `;

  switch (verdict) {
    case 'secure':
      return baseStyle.replace('{color1}', '#10B981').replace('{color2}', '#059669').replace('{accent}', '#047857');
    case 'caution':
      return baseStyle.replace('{color1}', '#3B82F6').replace('{color2}', '#1D4ED8').replace('{accent}', '#1E40AF');
    case 'suspicious':
      return baseStyle.replace('{color1}', '#F59E0B').replace('{color2}', '#D97706').replace('{accent}', '#B45309');
    case 'blacklisted':
      return baseStyle.replace('{color1}', '#EF4444').replace('{color2}', '#DC2626').replace('{accent}', '#B91C1C');
    default:
      return baseStyle.replace('{color1}', '#6B7280').replace('{color2}', '#4B5563').replace('{accent}', '#374151');
  }
}

function getThreatIcon(verdict) {
  switch (verdict) {
    case 'secure': return '🛡️';
    case 'caution': return '⚠️';
    case 'suspicious': return '🚨';
    case 'blacklisted': return '🚫';
    default: return '❓';
  }
}

function getThreatLevelText(score) {
  if (score >= 80) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

function getPhishingRiskText(score) {
  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 30) return 'Medium';
  if (score >= 15) return 'Low';
  return 'Minimal';
}

function removeBanner() {
  if (banner && banner.parentNode) {
    banner.parentNode.removeChild(banner);
    document.body.style.marginTop = '';
    banner = null;
  }
}

function showEnhancedModal(analysis) {
  removeModal();

  modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed !important;
    top: 90px !important;
    right: 25px !important;
    width: 450px !important;
    max-width: 90vw !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
    background: linear-gradient(145deg, #1F2937, #111827) !important;
    color: white !important;
    border-radius: 15px !important;
    padding: 0 !important;
    z-index: 2147483646 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
    box-shadow: 0 25px 50px rgba(0,0,0,0.4) !important;
    border: 1px solid #374151 !important;
    animation: modalSlideIn 0.3s ease-out !important;
  `;

  const pageInfo = getPageSecurityInfo();
  const threatDetails = formatThreatDetails(analysis);

  modal.innerHTML = `
  <div id="analysis-modal" style="background: linear-gradient(135deg, #374151, #1F2937); padding: 20px; border-radius: 15px 15px 0 0; border-bottom: 1px solid #4B5563;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; color: #F9FAFB; font-size: 20px; font-weight: 700;">
        🔍 Advanced Security Analysis
      </h3>
      <button onclick="document.getElementById('analysis-modal').remove()" 
              style="background: none; border: none; color: #9CA3AF; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"
              onmouseover="this.style.background='#374151'; this.style.color='#F9FAFB'"
              onmouseout="this.style.background='none'; this.style.color='#9CA3AF'">
        ✕
      </button>
    </div>
  </div>

  <div style="padding: 20px;">
    <!-- Overall Assessment -->
    <div style="background: ${getScoreBackgroundColor(analysis.overallScore)}; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">Overall Threat Score</div>
      <div style="font-size: 32px; font-weight: 800; margin-bottom: 5px;">${analysis.overallScore}/100</div>
      <div style="font-size: 12px; opacity: 0.9;">${getThreatLevelText(analysis.overallScore)} Risk Level</div>
    </div>

    <!-- Domain Information -->
    <div style="margin-bottom: 20px; padding: 15px; background: #374151; border-radius: 10px;">
      <h4 style="margin: 0 0 12px 0; color: #10B981; font-size: 16px; font-weight: 700;">Domain Information</h4>
      <div style="margin-bottom: 8px; font-size: 14px;"><strong>Domain:</strong> ${analysis.domain}</div>
      <div style="margin-bottom: 8px; font-size: 14px;"><strong>Verdict:</strong> 
        <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; ${getVerdictBadgeStyle(analysis.verdict)}">
          ${analysis.verdict.toUpperCase()}
        </span>
      </div>
      <div style="margin-bottom: 8px; font-size: 14px;"><strong>Risk Level:</strong> ${analysis.riskLevel}</div>
      <div style="font-size: 14px;"><strong>Analysis Time:</strong> ${new Date(analysis.timestamp).toLocaleString()}</div>
    </div>

    <!-- Threat Analysis Breakdown -->
    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 12px 0; color: #F59E0B; font-size: 16px; font-weight: 700;">Threat Analysis Breakdown</h4>

      <!-- Phishing Score -->
      <div style="background: #374151; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600;">Phishing Detection</span>
          <span style="font-weight: 700; color: ${getScoreColor(analysis.phishingScore)};">${analysis.phishingScore}/100</span>
        </div>
        <div style="background: #1F2937; border-radius: 10px; height: 8px; overflow: hidden;">
          <div style="background: ${getScoreColor(analysis.phishingScore)}; height: 100%; width: ${analysis.phishingScore}%; transition: width 0.5s ease;"></div>
        </div>
      </div>

      <!-- Domain Reputation -->
      <div style="background: #374151; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600;">Domain Reputation</span>
          <span style="font-weight: 700; color: ${getScoreColor(100 - analysis.reputation.score)};">${analysis.reputation.score}/100</span>
        </div>
        <div style="background: #1F2937; border-radius: 10px; height: 8px; overflow: hidden;">
          <div style="background: ${getScoreColor(100 - analysis.reputation.score)}; height: 100%; width: ${analysis.reputation.score}%; transition: width 0.5s ease;"></div>
        </div>
      </div>
    </div>

    <!-- Security Features -->
    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 12px 0; color: #3B82F6; font-size: 16px; font-weight: 700;">Security Features</h4>
      <div style="background: #374151; padding: 15px; border-radius: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
          <span>HTTPS Encryption:</span>
          <span>${pageInfo.hasHTTPS ? '✅ Secure' : '❌ Not Secure'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
          <span>JavaScript Cookies:</span>
          <span>${pageInfo.cookieCount} detected</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <span>Blacklisted:</span>
          <span>${analysis.isBlacklisted ? '❌ Yes' : '✅ No'}</span>
        </div>
      </div>
    </div>

    <!-- Extra Threat Details -->
    ${threatDetails}


</div>
`;



  document.body.appendChild(modal);
}

function getPageSecurityInfo() {
  return {
    hasHTTPS: window.location.protocol === 'https:',
    hasCSP: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
    cookieCount: document.cookie ? document.cookie.split(';').length : 0,
    hasFrames: document.querySelectorAll('iframe').length > 0,
    externalScripts: document.querySelectorAll('script[src]').length,
    externalImages: document.querySelectorAll('img[src]').length
  };
}

function formatThreatDetails(analysis) {
  if (!analysis.phishingDetails || !analysis.threatFactors) return '';

  let html = '';

  if (analysis.threatFactors && analysis.threatFactors.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; color: #EF4444; font-size: 16px; font-weight: 700;">Threat Indicators</h4>
        <div style="background: #374151; padding: 15px; border-radius: 10px;">
          ${analysis.threatFactors.map(factor => `
            <div style="margin-bottom: 6px; font-size: 13px; display: flex; align-items: center;">
              <span style="color: #EF4444; margin-right: 8px;">⚠️</span>
              ${factor}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function getScoreBackgroundColor(score) {
  if (score >= 80) return 'linear-gradient(135deg, #EF4444, #DC2626)';
  if (score >= 60) return 'linear-gradient(135deg, #F59E0B, #D97706)';
  if (score >= 30) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
  return 'linear-gradient(135deg, #10B981, #059669)';
}

function getScoreColor(score) {
  if (score >= 70) return '#EF4444';
  if (score >= 50) return '#F59E0B';
  if (score >= 30) return '#3B82F6';
  return '#10B981';
}

function getVerdictBadgeStyle(verdict) {
  switch (verdict) {
    case 'secure':
      return 'background: #10B981; color: white;';
    case 'caution':
      return 'background: #3B82F6; color: white;';
    case 'suspicious':
      return 'background: #F59E0B; color: white;';
    case 'blacklisted':
      return 'background: #EF4444; color: white;';
    default:
      return 'background: #6B7280; color: white;';
  }
}

function removeModal() {
  if (modal && modal.parentNode) {
    modal.parentNode.removeChild(modal);
    modal = null;
  }
}

function clearCookiesWithFeedback(domain) {
  chrome.runtime.sendMessage({
    action: 'clearCookies',
    domain: domain
  }, response => {
    if (response && response.success) {
      showNotification(`✅ Cleared ${response.cleared} cookies for ${domain}`, 'success');
    } else {
      showNotification('❌ Error clearing cookies', 'error');
    }
  });
}

function refreshAnalysis() {
  showNotification('🔄 Refreshing security analysis...', 'info');

  chrome.runtime.sendMessage({
    action: 'analyzeUrl',
    url: window.location.href
  }, analysis => {
    if (analysis && !analysis.error) {
      currentAnalysis = analysis;
      console.log("Secure Lens Pro: Refreshed analysis", analysis);

   
      removeBanner();
      showEnhancedBanner(analysis);

      
      if (modal) {
        removeModal();
        showEnhancedModal(analysis);
      }

      showNotification('✅ Analysis refreshed successfully', 'success');
    } else {
      showNotification('❌ Failed to refresh analysis', 'error');
    }
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'} !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    z-index: 2147483648 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    animation: slideIn 0.3s ease-out !important;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}


function initEnhanced() {
  if (window.location.protocol === 'chrome:' || 
      window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'about:') {
    return;
  }

  console.log("Secure Lens Pro: Initializing enhanced analysis for", window.location.href);


  chrome.runtime.sendMessage({
    action: 'analyzeUrl',
    url: window.location.href
  }, analysis => {
    if (analysis && !analysis.error) {
      currentAnalysis = analysis;
      console.log("Secure Lens Pro: Advanced analysis complete", analysis);

      chrome.runtime.sendMessage({ action: 'getSettings' }, settings => {
        if (settings && settings.autoBanner) {
          showEnhancedBanner(analysis);
        }
      });
    } else {
      console.error("Secure Lens Pro: Analysis failed", analysis);
    }
  });
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateX(100px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhanced);
} else {
  initEnhanced();
}

console.log("Secure Lens Pro: Enhanced content script ready with advanced threat visualization");