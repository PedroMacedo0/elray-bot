const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // V1BETA
    console.log("Fetching v1beta models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("V1BETA MODELS:", data.models.map(m => m.name).filter(n => n.includes('flash')));
    } catch (e) { console.error(e); }

    // V1
    console.log("\nFetching v1 models...");
    try {
        const response2 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const data2 = await response2.json();
        console.log("V1 MODELS:", data2.models.map(m => m.name).filter(n => n.includes('flash')));
    } catch (e) { console.error(e); }
}
run();
