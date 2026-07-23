# 🛡️ NetSentinel v1.0
> **Real-time IP threat scoring and network intelligence proxy.**

NetSentinel is a lightweight, high-performance security telemetry proxy and interface that aggregates real-time IP geolocation, ISP metadata, and threat intelligence. Built with an architecture designed for high-tech cyber operations, NetSentinel provides instant risk assessment and confidence scoring for IPv4 addresses.

---

## 🚀 Live Demo

* **Live Deployment:** [NetSentinel Preview](https://netsentinelbyembeywa.netlify.app/)
* **GitHub Repository:** [https://github.com/embeywa1/netsentinel](https://github.com/embeywa1/netsentinel)

---

## ✨ Features

* **Real-time Threat Scoring:** Integrates with AbuseIPDB telemetry to calculate abuse confidence percentages and report metrics.
* **Network & Geolocation Intelligence:** Retrieves ISP, ASN, Country, and City details for queried IP addresses.
* **Smart RFC 1918 Handling:** Automatically detects private/local network ranges (`127.0.0.1`, `192.168.x.x`, `10.x.x.x`) to prevent API errors and return clean internal diagnostics.
* **In-Memory Caching:** Implements TTL-based memory caching on backend lookups to reduce external API dependency latency and optimize rate limits.
* **Serverless Architecture:** Express backend modularized with `serverless-http` for zero-maintenance deployment on Netlify Functions.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Cyber-Dark Theme), Modern JavaScript ES6+
* **Backend:** Node.js, Express.js, `serverless-http`, Axios
* **APIs & Telemetry:** AbuseIPDB API v2, `ipapi.co`
* **Deployment:** Netlify (Functions & Edge Hosting), GitHub CI/CD

---

## 📦 Local Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [npm](https://www.npmjs.com/)
* An active API key from [AbuseIPDB](https://www.abuseipdb.com/)

### 1. Clone the Repository
```bash
git clone [https://github.com/embeywa1/netsentinel.git](https://github.com/embeywa1/netsentinel.git)
cd netsentinel
```

### 2. Install Dependencies
```bash
npm install
```

###3. Environment Variables
Create a .env file in the root directory and add your AbuseIPDB API key:

Code snippet
``` bash
ABUSEIPDB_KEY=your_abuseipdb_api_key_here
PORT=3000
``` 
###4. Run Locally
```bash
npm start
```
Open http://localhost:3000 in your browser.

###⚙️ Deployment (Netlify)
This project is pre-configured with netlify.toml for seamless deployment.

Push your changes to GitHub:

``` bash
git add .
git commit -m "Add README and final docs"
git push
 ```  

###Connect your repository to Netlify.

Set the following Build Settings in the Netlify Dashboard:

Publish directory: public

Functions directory: functions

Add the environment variable ABUSEIPDB_KEY in Site Configuration > Environment variables.

###📝 License
Distributed under the MIT License. See LICENSE for more information.
