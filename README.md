NetSentinel is a web-based real-time threat intelligence and IP reputation dashboard. Engineered to bridge active threat hunting with interactive geospatial telemetry, NetSentinel aggregates live attack logs, queries reputation scoring engines, and geolocates malicious IP addresses across global networks.

---

## ⚡ Core Features & Intelligence Capabilities

- **Live IP Abuse Telemetry:** Integrates directly with the **AbuseIPDB API** to fetch confidence-of-abuse scores, ISP information, country origin, and historical incident reporting.
- **Geospatial Threat Mapping:** Visualizes active malicious IP nodes on an interactive map interface for instant geographic threat detection.
- **Dynamic Threat Score Meter:** Color-coded risk indicators quantifying IP safety from low-risk clean nodes to critical-level malicious actors.
- **Search & Query Console:** Real-time search engine allowing analysts to input domain names or IPv4/IPv6 addresses for rapid triage during security incident response.
- **Cyber-Dark Terminal Interface:** High-contrast dashboard aesthetic (`#090D16` charcoal, `#00F0FF` electric cyan, `#F7931A` warning orange) designed for SOC environments.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React.js
- **Styling & UI Components:** Tailwind CSS, Lucide React Icons
- **Threat Telemetry APIs:** AbuseIPDB API v2, IP Geolocation APIs
- **Mapping Engine:** Leaflet.js / Mapbox integration
- **Deployment Platform:** Vercel / Lovable Edge Network

---

## 📡 API Telemetry Architecture

NetSentinel handles external threat queries through asynchronous REST integrations with rate-limiting guardrails:

```javascript
/**
 * Fetches IP reputation score and abuse confidence metrics.
 * @param {string} ipAddress - Target IPv4/IPv6 address.
 * @returns {Promise<Object>} Threat telemetry payload.
 */
export async function queryIpReputation(ipAddress) {
  const response = await fetch(`[https://api.abuseipdb.com/api/v2/check?ipAddress=$](https://api.abuseipdb.com/api/v2/check?ipAddress=$){ipAddress}&maxAgeInDays=90`, {
    method: 'GET',
    headers: {
      'Key': import.meta.env.VITE_ABUSEIPDB_API_KEY,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Threat telemetry fetch failed: ${response.statusText}`);
  }

  const { data } = await response.json();
  return {
    ip: data.ipAddress,
    abuseScore: data.abuseConfidenceScore,
    country: data.countryCode,
    isp: data.isp,
    totalReports: data.totalReports,
    isPublic: data.isPublic
  };
}
```
🚀 Local Development Setup
Prerequisites
Ensure you have the following installed on your machine:

Node.js (v18.0.0 or higher)

npm or pnpm

An active AbuseIPDB API Key (Free Developer Tier or Enterprise)

1. Clone the Repository
Bash
git clone [https://github.com/embeywa1/netsentinel.git](https://github.com/embeywa1/netsentinel.git)
cd netsentinel
2. Install Dependencies
Bash
npm install
3. Configure Environment Variables
Create a .env.local file in the project root:

Code snippet
VITE_ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
4. Launch Development Server
Bash
npm run dev
Open http://localhost:5173 in your browser to launch the dashboard console locally.

📂 Project Structure
Plaintext
netsentinel/
├── src/
│   ├── components/      # Threat map, IP search bar, and telemetry gauges
│   ├── services/        # AbuseIPDB API & Geolocation query handlers
│   ├── hooks/           # Custom telemetry caching & search state hooks
│   ├── App.jsx          # Dashboard layout & routing
│   └── index.css        # Cyber-Dark custom styling and terminal borders
├── public/              # Icons and static telemetry assets
├── package.json         # Manifest and dependencies
└── README.md            # Technical documentation
