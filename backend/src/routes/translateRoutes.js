const express = require('express');
const https = require('https');
const router = express.Router();

router.get('/', (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`;

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                res.json(parsedData);
            } catch (e) {
                res.status(500).json({ error: 'Failed to parse response from Google' });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ error: 'Failed to reach Google API', details: e.message });
    });
});

module.exports = router;
