const axios = require("axios");

const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL ||
    "http://127.0.0.1:8000";


const generateMedicalSummary = async (
    records
) => {

    try {

        const response =
            await axios.post(
                `${AI_SERVICE_URL}/summary`,
                {
                    records
                }
            );

        return response.data;

    } catch (error) {

        console.error(
            "AI summary service error:",
            error.message
        );

        throw new Error(
            "AI summary service unavailable."
        );
    }
};


const askMedicalQuestion = async (
    question,
    records
) => {

    try {

        const response =
            await axios.post(
                `${AI_SERVICE_URL}/ask`,
                {
                    question,
                    records
                }
            );

        return response.data;

    } catch (error) {

        console.error(
            "AI question service error:",
            error.message
        );

        throw new Error(
            "AI service unavailable."
        );
    }
};


module.exports = {
    generateMedicalSummary,
    askMedicalQuestion
};