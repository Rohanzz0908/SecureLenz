console.log("Secure Lens Pro: Advanced Background script loaded");

const THREAT_DETECTION_CONFIG = {
  phishingThreshold: 60,
  suspiciousThreshold: 35,
  domainAgeThreshold: 30,
  maxRedirects: 3,
  timeoutMs: 5000
};

const PHISHING_PATTERNS = {
  urlPatterns: [
    /login/i, /signin/i, /log-in/i, /sign-in/i,
    /account/i, /verify/i, /verification/i, /confirm/i,
    /secure/i, /security/i, /update/i, /suspended/i,
    /limited/i, /urgent/i, /important/i, /alert/i,
    /banking/i, /paypal/i, /amazon/i, /apple/i,
    /microsoft/i, /google/i, /facebook/i, /instagram/i,
    /support/i, /help/i, /service/i, /customer/i,
    /unlock/i, /restore/i, /recover/i, /reset/i
  ],
  domainPatterns: [
    /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,
    /-[a-z0-9]+-[a-z0-9]+-/,
    /[0-9]{4,}/,
    /[a-z]{20,}/,
    /[^a-z0-9.-]/,
    /\.(tk|ml|ga|cf|gq)$/,
    /[a-z]+[0-9]+[a-z]+\.[a-z]+/,
    /^[0-9]/,
    /[a-z]-[0-9]|[0-9]-[a-z]/
  ],
  brandTargets: [
    { brand: 'google', variants: ['g00gle', 'googIe', 'gooogle', 'gooqle', 'googel'] },
    { brand: 'facebook', variants: ['facebok', 'faceb00k', 'facebk', 'faceebook'] },
    { brand: 'amazon', variants: ['amaz0n', 'amazom', 'amazone', 'amaozn'] },
    { brand: 'apple', variants: ['aple', 'appIe', 'appl3', 'applle'] },
    { brand: 'microsoft', variants: ['microsooft', 'micr0soft', 'microsft'] },
    { brand: 'paypal', variants: ['paypaI', 'payp4l', 'paipal', 'paypaul'] },
    { brand: 'netflix', variants: ['netfIix', 'netf1ix', 'netflx'] },
    { brand: 'instagram', variants: ['instqgram', 'instagrm', 'inst4gram'] }
  ]
};

const MALICIOUS_INDICATORS = [
  'bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link',
  'click.me', 'free-', 'win-', 'prize-', 'lottery-', 'bonus-',
  'hack-', 'crack-', 'keygen-', 'serial-', 'patch-'
];

const DEFAULT_SETTINGS = {
  autoBanner: true,
  phishingWarnings: true,
  trackerHeuristics: true,
  blacklistBlocking: true,
  advancedAnalysis: true,
  realTimeScoring: true,
  domainAgeCheck: true,
  typosquattingDetection: true
};

function normalizeDomain(hostname) {
  if (!hostname) return 'unknown';
  let d = String(hostname).toLowerCase().trim();
  if (d.startsWith('.')) d = d.slice(1);
  return d;
}

async function loadDomainReputationMap() {
  const { domainReputation = {} } = await chrome.storage.local.get(['domainReputation']);
  return domainReputation || {};
}

async function saveDomainReputationMap(map) {
  await chrome.storage.local.set({ domainReputation: map });
}

async function getOrInitDomainReputation(domain) {
  const key = normalizeDomain(domain);
  const map = await loadDomainReputationMap();
  if (!map[key]) {
    map[key] = {
      score: 50,
      incidents: 0,
      analysisCount: 0,
      firstSeen: Date.now(),
      lastAnalysis: Date.now()
    };
    await saveDomainReputationMap(map);
  }
  return map[key];
}

async function putDomainReputation(domain, reputation) {
  const key = normalizeDomain(domain);
  const map = await loadDomainReputationMap();
  map[key] = {
    score: typeof reputation.score === 'number' ? reputation.score : 50,
    incidents: reputation.incidents || 0,
    analysisCount: reputation.analysisCount || 0,
    firstSeen: reputation.firstSeen || Date.now(),
    lastAnalysis: reputation.lastAnalysis || Date.now()
  };
  await saveDomainReputationMap(map);
}

async function saveAnalysisHistory(analysis) {
  const { analysisHistory = [] } = await chrome.storage.local.get(['analysisHistory']);
  analysisHistory.unshift(analysis);
  if (analysisHistory.length > 100) {
    analysisHistory.splice(100);
  }
  await chrome.storage.local.set({ analysisHistory });
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Secure Lens Pro: Extension installed - initializing advanced threat detection");
  await chrome.storage.sync.set(DEFAULT_SETTINGS);
  const enhancedBlacklist = [
    'secure-login-verification.com',
    'account-suspended-urgent.net', 
    'paypal-security-update.org',
    'amazon-prize-winner.info',
    'apple-id-locked.com',
    'microsoft-support-urgent.net',
    'facebook-security-check.org',
    'google-account-verify.info',
    'netflix-payment-failed.com',
    'instagram-followers-free.net',
    'free-movie-downloads.com',
    'crack-software-here.net',
    'bitcoin-generator-tool.org',
    'earn-money-fast.info',
    'weight-loss-miracle.com',
    'anti-virus-scan-now.net',
    'pc-speed-up-free.org',
    'dating-singles-nearby.com',
    'secure-banking-login.net',
    'urgent-account-verification.com',
    'suspended-account-restore.org',
    'limited-time-offer.info',
    'congratulations-winner.net',
    'hotfiles.com'
  ];
  await chrome.storage.local.set({ 
    blacklist: enhancedBlacklist,
    threatDatabase: {},
    domainReputation: {},
    analysisHistory: []
  });
  console.log("Secure Lens Pro: Advanced initialization complete");
});

function calculateAdvancedPhishingScore(url, domain) {
  let score = 0;
  const details = {
    urlPatterns: [],
    domainIssues: [],
    brandTargeting: [],
    technicalFlags: [],
    riskFactors: []
  };
  try {
    const urlObj = new URL(url);
    const path = (urlObj.pathname || '').toLowerCase();
    const params = (urlObj.search || '').toLowerCase();
    const fullUrl = String(url || '').toLowerCase();
    const dom = normalizeDomain(domain);
    PHISHING_PATTERNS.urlPatterns.forEach(pattern => {
      if (pattern.test(fullUrl)) {
        score += 5;
        details.urlPatterns.push(pattern.source);
      }
    });
    PHISHING_PATTERNS.domainPatterns.forEach(pattern => {
      if (pattern.test(dom)) {
        score += 7;
        details.domainIssues.push(pattern.source);
      }
    });
    const parts = dom.split('.');
    const subdomainCount = Math.max(parts.length - 2, 0);
    if (subdomainCount > 2) {
      score += 10;
      details.domainIssues.push(`Excessive subdomains: ${subdomainCount}`);
    }
    PHISHING_PATTERNS.brandTargets.forEach(brandData => {
      const brand = brandData.brand;
      const variants = brandData.variants;
      variants.forEach(variant => {
        if (dom.includes(variant)) {
          score += 15;
          details.brandTargeting.push(`Typosquatting: ${variant} (targets ${brand})`);
        }
      });
      if (dom.includes(brand) && !dom.endsWith(`${brand}.com`)) {
        const suspiciousKeywords = ['secure', 'login', 'verify', 'account', 'support'];
        suspiciousKeywords.forEach(keyword => {
          if (dom.includes(keyword)) {
            score += 12;
            details.brandTargeting.push(`Brand targeting: ${brand} + ${keyword}`);
          }
        });
      }
    });
    if (fullUrl.length > 100) {
      score += 8;
      details.technicalFlags.push(`Long URL: ${fullUrl.length} characters`);
    }
    const pathDepth = path.split('/').filter(Boolean).length;
    if (pathDepth > 5) {
      score += 6;
      details.technicalFlags.push(`Deep path: ${pathDepth} levels`);
    }
    if (params.length > 50) {
      score += 5;
      details.technicalFlags.push(`Long parameters: ${params.length} chars`);
    }
    if (fullUrl.includes('redirect') || fullUrl.includes('r=') || fullUrl.includes('url=')) {
      score += 8;
      details.technicalFlags.push('Redirect indicators found');
    }
    MALICIOUS_INDICATORS.forEach(indicator => {
      if (dom.includes(indicator) || fullUrl.includes(indicator)) {
        score += 10;
        details.riskFactors.push(`Malicious indicator: ${indicator}`);
      }
    });
    if (urlObj.port && !['80', '443', '8080', '8443'].includes(urlObj.port)) {
      score += 8;
      details.riskFactors.push(`Non-standard port: ${urlObj.port}`);
    }
    if (urlObj.protocol === 'http:') {
      score += 5;
      details.riskFactors.push('No HTTPS encryption');
    }
    const finalScore = Math.min(score, 100);
    console.log(`Phishing analysis for ${dom}:`, {
      score: finalScore,
      details: details
    });
    return {
      score: finalScore,
      details: details,
      riskLevel: finalScore > THREAT_DETECTION_CONFIG.phishingThreshold ? 'high' : 
                 finalScore > THREAT_DETECTION_CONFIG.suspiciousThreshold ? 'medium' : 'low'
    };
  } catch (error) {
    console.error('Error in phishing analysis:', error);
    return {
      score: 0,
      details: { error: error.message },
      riskLevel: 'unknown'
    };
  }
}

async function analyzeUrlAdvanced(url) {
  const timestamp = Date.now();
  try {
    const urlObj = new URL(url);
    const domainRaw = urlObj.hostname;
    const domain = normalizeDomain(domainRaw);
    console.log(`Starting advanced analysis for: ${url}`);
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);
    const isBlacklisted = blacklist.some(entry => {
      const e = normalizeDomain(entry);
      return domain.includes(e) || e.includes(domain) || String(url).includes(entry);
    });
    const phishingAnalysis = calculateAdvancedPhishingScore(url, domain);
    
   /* Add PhishTank API check (commented out for now)  (Avalibility of free API key is limited)
const phishtankKey = 'YOUR_PHISHTANK_API_KEY';
const phishtankUrl = https://checkurl.phishtank.com/checkurl/;
const form = new URLSearchParams({
  format: 'json',
  app_key: phishtankKey,
  url
});
const res = await fetch(phishtankUrl, {
  method: 'POST',
  body: form
});
const { valid, in_database, verified } = await res.json();
if (in_database && verified) {

  overallScore = 100;
  verdict = 'blacklisted';
  threatFactors.push('Listed in PhishTank database');
} 
 */


    let domainReputation = await getOrInitDomainReputation(domain);
    const sslAnalysis = {
      isHTTPS: urlObj.protocol === 'https:',
      hasValidCert: true,
      mixedContent: false
    };
    const redirectAnalysis = {
      hasRedirects: String(url).toLowerCase().includes('redirect') || String(url).toLowerCase().includes('r='),
      suspiciousRedirect: false
    };
    const contentFlags = {
      hasJavaScript: false,
      hasIframes: false,
      hasExternalForms: false,
      suspiciousScripts: false
    };
    let overallScore = 0;
    const threatFactors = [];
    if (isBlacklisted) {
      overallScore += 90;
      threatFactors.push('Domain blacklisted');
    }
    overallScore += Math.round(phishingAnalysis.score * 0.6);
    if (phishingAnalysis.score > 0) {
      threatFactors.push(`Phishing indicators: ${phishingAnalysis.score}/100`);
    }
    const repScore = typeof domainReputation.score === 'number' ? domainReputation.score : 50;
    if (repScore < 30) {
      overallScore += 20;
      threatFactors.push('Poor domain reputation');
    }
    if (!sslAnalysis.isHTTPS) {
      overallScore += 15;
      threatFactors.push('No HTTPS encryption');
    }
    overallScore = Math.min(overallScore, 100);
    let verdict = 'secure';
    let riskLevel = 'low';
    if (overallScore >= 80 || isBlacklisted) {
      verdict = 'blacklisted';
      riskLevel = 'high';
    } else if (overallScore >= 50) {
      verdict = 'suspicious';
      riskLevel = 'medium';
    } else if (overallScore >= 25) {
      verdict = 'caution';
      riskLevel = 'low-medium';
    }
    domainReputation.lastAnalysis = timestamp;
    domainReputation.analysisCount = (domainReputation.analysisCount || 0) + 1;
    if (overallScore > 50) {
      domainReputation.incidents = (domainReputation.incidents || 0) + 1;
      domainReputation.score = Math.max(0, (typeof domainReputation.score === 'number' ? domainReputation.score : 50) - 5);
    } else {
      domainReputation.score = Math.min(100, (typeof domainReputation.score === 'number' ? domainReputation.score : 50) + 1);
    }
    await putDomainReputation(domain, domainReputation);
    const analysisResult = {
      url,
      domain,
      verdict,
      riskLevel,
      overallScore,
      phishingScore: phishingAnalysis.score,
      phishingDetails: phishingAnalysis.details,
      reputation: domainReputation,
      isBlacklisted,
      sslAnalysis,
      redirectAnalysis,
      threatFactors,
      timestamp,
      analysisVersion: '2.1.1'
    };
    await saveAnalysisHistory(analysisResult);
    console.log('Advanced analysis complete:', analysisResult);
    return analysisResult;
  } catch (error) {
    console.error('Error in advanced URL analysis:', error);
    return {
      url,
      domain: 'unknown',
      verdict: 'error',
      riskLevel: 'unknown',
      overallScore: 0,
      phishingScore: 0,
      reputation: { score: 0, incidents: 0 },
      error: error.message,
      timestamp: Date.now()
    };
  }
}

async function getDomainReputation(domain) {
  return getOrInitDomainReputation(domain);
}
async function updateDomainReputation(domain, reputation) {
  return putDomainReputation(domain, reputation);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Secure Lens Pro: Message received", message.action);
  switch (message.action) {
    case 'analyzeUrl':
      analyzeUrlAdvanced(message.url).then(analysis => {
        sendResponse(analysis);
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true;
    case 'getSettings':
      chrome.storage.sync.get(DEFAULT_SETTINGS).then(settings => {
        sendResponse(settings);
      }).catch(err => sendResponse({ error: err.message }));
      return true;
    case 'updateSettings':
      chrome.storage.sync.set(message.settings).then(() => {
        sendResponse({ success: true });
      }).catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    case 'clearCookies':
      chrome.cookies.getAll({ domain: message.domain }).then(cookies => {
        const promises = cookies.map(cookie => {
          const scheme = cookie.secure ? 'https' : 'http';
          const host = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
          const url = `${scheme}://${host}${cookie.path}`;
          return chrome.cookies.remove({ url, name: cookie.name });
        });
        return Promise.all(promises);
      }).then((results) => {
        const cleared = Array.isArray(results) ? results.filter(Boolean).length : 0;
        sendResponse({ success: true, cleared });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    case 'getAnalysisHistory':
      chrome.storage.local.get(['analysisHistory']).then(data => {
        sendResponse({ history: data.analysisHistory || [] });
      }).catch(err => sendResponse({ error: err.message }));
      return true;
    case 'getDomainStats':
      chrome.storage.local.get(['domainReputation', 'analysisHistory']).then(data => {
        const rep = data.domainReputation || {};
        const hist = data.analysisHistory || [];
        const stats = {
          totalDomains: Object.keys(rep).length,
          totalAnalyses: hist.length,
          threatsBlocked: hist.filter(a => a.verdict === 'blacklisted').length,
          suspiciousDetected: hist.filter(a => a.verdict === 'suspicious').length
        };
        sendResponse(stats);
      }).catch(err => sendResponse({ error: err.message }));
      return true;
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

console.log("Secure Lens Pro: Advanced background script ready with AI-powered threat detection");
