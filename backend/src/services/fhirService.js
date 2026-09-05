const axios = require("axios");

const getHospitalRecords = async (
    hospitalUrl,
    patientId
) => {
    try {
        const response = await axios.get(
            `${hospitalUrl}/Patient/${patientId}/$everything`
        );

        return response.data;
    } catch (error) {
        console.error(
            "FHIR request failed:",
            error.message
        );

        return null;
    }
};

module.exports = {
    getHospitalRecords
};