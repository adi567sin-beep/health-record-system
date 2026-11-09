const MedicalRecord = require("../models/MedicalRecord");
const Consent = require("../models/Consent");

const {
    askMedicalQuestion,
    generateMedicalSummary
} = require("../services/aiService");


const checkConsent = async (patientId, doctorId) => {

    const consent = await Consent.findOne({
        patientId,
        doctorId,
        status: "active",
        expiresAt: {
            $gt: new Date()
        }
    });

    return consent;
};

const askAI = async (req, res) => {

    try {

        const {
            patientId,
            question
        } = req.body;


        if (!patientId || !question) {

            return res.status(400).json({
                message:
                    "Patient ID and question are required."
            });
        }



        const consent = await checkConsent(
            patientId,
            req.user.id
        );


        if (!consent) {

            return res.status(403).json({
                message:
                    "Valid patient consent is required for AI access."
            });
        }


        const records =
            await MedicalRecord.find({
                patientId
            }).sort({
                recordDate: 1
            });


      const result = await askMedicalQuestion(
          question,
       records.map((record, index) => ({
    sourceId: index + 1,
    date: record.recordDate,
    hospital: record.hospitalName,
    type: record.resourceType,
    title: record.title,
    description: record.description || ""
}))
    );


        res.json(result);

    } catch (error) {

        console.error(
            "AI controller error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to process AI request."
        });
    }
};

const generateSummary = async (
    req,
    res
) => {

    try {

        const {
            patientId
        } = req.params;



        const consent = await checkConsent(
            patientId,
            req.user.id
        );


        if (!consent) {

            return res.status(403).json({
                message:
                    "Valid patient consent is required for AI access."
            });
        }



        const records =
            await MedicalRecord.find({
                patientId
            }).sort({
                recordDate: 1
            });


        if (records.length === 0) {

            return res.status(404).json({
                message:
                    "No medical records found for this patient."
            });
        }


      const result =
    await generateMedicalSummary(
        records.map((record, index) => ({
            sourceId: index + 1,
            date: record.recordDate,
            hospital: record.hospitalName,
            type: record.resourceType,
            title: record.title,
            description:
                record.description || ""
        }))
    );


        res.json(result);

    } catch (error) {

        console.error(
            "AI summary controller error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to generate medical summary."
        });
    }
};


module.exports = {
    askAI,
    generateSummary
};