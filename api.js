const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');

const app = express();
const router = express.Router();

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// Helper function to detect local / private RFC 1918 IPs
function isPrivateIP(ip) {
    return (
        ip === '127.0.0.1' ||
        ip === 'localhost' ||
        ip === '::1' ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
        ip.startsWith('169.254.')
    );
}

router.get('/lookup', async (req, res) => {
    const ip = req.query.ip ? req.query.ip.trim() : '';

    if (!ip) {
        return res.status(400).json({ error: 'Please enter a valid IP address.' });
    }

    // --- HANDLE LOCAL / PRIVATE IPs LOCALLY ---
    if (isPrivateIP(ip)) {
        return res.json({
            ip: ip,
            country: 'Internal Network',
            city: 'Local Subnet (LAN)',
            isp: 'Private / Reserved IP Range',
            asn: 'N/A (RFC 1918)',
            abuseScore: 0,
            totalReports: 0,
            cached: false,
            note: '🔒 Private IP address scanned successfully (Local Network).'
        });
    }

    // --- CACHE CHECK FOR PUBLIC IPs ---
    if (cache.has(ip)) {
        const cachedData = cache.get(ip);
        if (Date.now() - cachedData.timestamp < CACHE_TTL) {
            return res.json({ ...cachedData.data, cached: true });
        }
    }

    // --- HANDLE PUBLIC IPs ---
    try {
        // Use ipapi.co (Native HTTPS support for public IPs)
        const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
        
        if (geoRes.data.error) {
            return res.status(400).json({ error: geoRes.data.reason || 'Invalid public IP address.' });
        }

        let abuseScore = 0;
        let totalReports = 0;

        const apiKey = process.env.ABUSEIPDB_KEY || process.env.ABUSEIPDB_API_KEY;

        if (apiKey) {
            try {
                const abuseRes = await axios.get(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
                    headers: {
                        'Key': apiKey,
                        'Accept': 'application/json'
                    },
                    timeout: 5000
                });
                if (abuseRes.data && abuseRes.data.data) {
                    abuseScore = abuseRes.data.data.abuseConfidenceScore || 0;
                    totalReports = abuseRes.data.data.totalReports || 0;
                }
            } catch (e) {
                console.error("AbuseIPDB Error:", e.message);
            }
        }

        const payload = {
            ip: geoRes.data.ip || ip,
            country: geoRes.data.country_name || 'Unknown',
            city: geoRes.data.city || 'Unknown',
            isp: geoRes.data.org || geoRes.data.asn || 'Unknown',
            asn: geoRes.data.asn || 'Unknown',
            abuseScore: abuseScore,
            totalReports: totalReports,
            cached: false
        };

        cache.set(ip, { timestamp: Date.now(), data: payload });

        return res.json(payload);
    } catch (err) {
        return res.status(500).json({ 
            error: 'Lookup failed. Ensure the IP format is correct.' 
        });
    }
});

app.use('/.netlify/functions/api', router);
app.use('/api', router);

module.exports.handler = serverless(app);
