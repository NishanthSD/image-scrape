const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// Function to get Google Image URLs
async function getGoogleImageUrls(query, numImages = 5) {
    try {
        // Replace spaces with '+' for the search query
        const searchQuery = query.replace(/ /g, '+');

        // Google Image Search URL
        const url = `https://www.google.com/search?hl=en&tbm=isch&q=${searchQuery}`;

        // Set headers to mimic a browser
        const headers = {
            'User-Agent': 'Chrome/114.0.0.0'
        };

        // Fetch the HTML content
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract image URLs
        const imageUrls = [];
        $('img').each((_, img) => {
            const imgUrl = $(img).attr('src');
            if (imgUrl && imgUrl.startsWith('http')) {
                imageUrls.push(imgUrl);
            }
            if (imageUrls.length >= numImages) return false; // Stop when enough images are collected
        });

        return imageUrls;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        return [];
    }
}

// API Endpoint
app.get('/get-images', async (req, res) => {
    const query = req.query.query;
    const numImages = parseInt(req.query.num_images) || 5;

    if (!query) {
        return res.status(400).json({ error: "Query parameter 'query' is required." });
    }

    const imageUrls = await getGoogleImageUrls(query, numImages);

    if (imageUrls.length > 0) {
        res.json({ query, image_urls: imageUrls });
    } else {
        res.status(404).json({ error: 'No images found.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
