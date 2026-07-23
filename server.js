console.log("Starting server...");

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Fallback for node-fetch across Node versions
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const cache = new Map();

app.get('/api/lookup', async (req, res) => {
    const ip = req.query.ip;

    if (!ip) {
        return res.status(400).json({ error: 'Please provide an IP address' });
    }

    if (cache.has(ip)) {
        console.log(`⚡ Cache hit for ${ip}`);
        return res.json({ ...cache.get(ip), cached: true });
    }

    try {
        console.log(`🌐 Fetching live geolocation data for ${ip}...`);
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,isp,org,as,query`);
        const geoData = await geoRes.json();

        if (geoData.status === 'fail') {
            console.error(`❌ IP-API Error: ${geoData.message}`);
            return res.status(400).json({ error: geoData.message || 'Invalid IP address' });
        }

        let abuseScore = 0;
        let totalReports = 0;
        let usageType = 'Unknown';

        // Fetch AbuseIPDB
        if (process.env.ABUSEIPDB_KEY) {
            console.log(`🛡️ Fetching AbuseIPDB threat telemetry for ${ip}...`);
            try {
                const abuseRes = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
                    headers: {
                        'Key': process.env.ABUSEIPDB_KEY,
                        'Accept': 'application/json'
                    }
                });
                const abuseData = await abuseRes.json();
                
                // Print the raw response from AbuseIPDB in terminal
                console.log('--- AbuseIPDB Raw Response ---');
                console.log(JSON.stringify(abuseData, null, 2));
                console.log('------------------------------');

                if (abuseData.errors) {
                    console.error('❌ AbuseIPDB API Key/Query Error:', abuseData.errors[0].detail);
                } else if (abuseData.data) {
                    abuseScore = abuseData.data.abuseConfidenceScore || 0;
                    totalReports = abuseData.data.totalReports || 0;
                    usageType = abuseData.data.usageType || 'Unknown';
                    console.log(`✅ Threat Score Calculated: ${abuseScore}% (${totalReports} reports)`);
                }
            } catch (abuseErr) {
                console.error('❌ AbuseIPDB Fetch Failed:', abuseErr.message);
            }
        } else {
            console.warn('⚠️ ABUSEIPDB_KEY is missing in your .env file!');
        }

        const result = {
            ip: geoData.query,
            country: geoData.country,
            city: geoData.city,
            isp: geoData.isp,
            asn: geoData.as,
            abuseScore: abuseScore,
            totalReports: totalReports,
            usageType: usageType,
            cached: false
        };

        // Save in cache for 10 minutes
        cache.set(ip, result);
        setTimeout(() => cache.delete(ip), 10 * 60 * 1000);

        res.json(result);
    } catch (err) {
        console.error('❌ Server Fatal Error:', err);
        res.status(500).json({ error: 'Failed to fetch threat intelligence data: ' + err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 NetSentinel server running on port ${PORT}`));
