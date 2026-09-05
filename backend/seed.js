const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");
const Patient = require("./src/models/Patient");
const MedicalRecord = require("./src/models/MedicalRecord");
const Consent = require("./src/models/Consent");

const seedDatabase = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        /*
         * Clear existing test data
         */

        await User.deleteMany({
            email: "doctor@test.com"
        });

        await Patient.deleteMany({
            patientId: "P001"
        });

        await MedicalRecord.deleteMany({
            patientId: "P001"
        });


        /*
         * Create Doctor
         */

        const hashedPassword =
            await bcrypt.hash("Doctor@123", 10);

        const doctor = await User.create({

            name: "Dr. Rahul Sharma",

            email: "doctor@test.com",

            password: hashedPassword,

            role: "doctor",

            hospitalId: "H001"

        });

        console.log("Doctor created");


        /*
         * Create Patient
         */

        await Patient.create({

            patientId: "P001",

            name: "Ananya Sharma",

            dateOfBirth: new Date("2000-05-15"),

            gender: "female",

            phone: "9876543210",

            email: "ananya@test.com"

        });

        console.log("Patient created");


        /*
         * Hospital A - Diagnosis
         */

        await MedicalRecord.create({

            patientId: "P001",

            hospitalId: "H001",

            hospitalName: "City Care Hospital",

            resourceType: "Diagnosis",

            recordDate: new Date("2026-01-10"),

            title: "Initial Medical Diagnosis",

            description:
                "Patient reported persistent fever and fatigue. Physician performed an initial clinical evaluation.",

            fhirResource: {

                resourceType: "Condition",

                clinicalStatus: "active",

                code: {
                    text: "Viral Fever"
                }

            }

        });


        /*
         * Hospital B - Laboratory
         */

        await MedicalRecord.create({

            patientId: "P001",

            hospitalId: "H002",

            hospitalName: "Bangalore General Hospital",

            resourceType: "Laboratory",

            recordDate: new Date("2026-02-15"),

            title: "Blood Laboratory Test",

            description:
                "Complete blood count and routine blood investigation performed.",

            fhirResource: {

                resourceType: "Observation",

                status: "final",

                code: {
                    text: "Complete Blood Count"
                }

            }

        });


        /*
         * Hospital C - Prescription
         */

        await MedicalRecord.create({

            patientId: "P001",

            hospitalId: "H003",

            hospitalName: "Apollo Medical Center",

            resourceType: "Medication",

            recordDate: new Date("2026-03-20"),

            title: "Medication Prescription",

            description:
                "Medication prescribed following review of laboratory results and clinical symptoms.",

            fhirResource: {

                resourceType: "MedicationRequest",

                status: "active",

                medication: {
                    text: "Prescribed medication"
                }

            }

        });

        console.log("Medical records created");


        /*
         * Create active consent
         */

        await Consent.create({

            patientId: "P001",

            doctorId: doctor._id,

            permissions: {

                medicalHistory: true,

                medications: true,

                laboratoryResults: true,

                procedures: true,

                allergies: true

            },

            status: "active",

            expiresAt: new Date("2027-12-31")

        });

        console.log("Consent created");


        console.log("\n=================================");
        console.log("DATABASE SEED COMPLETED");
        console.log("=================================");

        console.log("\nDoctor Login:");
        console.log("Email: doctor@test.com");
        console.log("Password: Doctor@123");

        console.log("\nPatient:");
        console.log("Patient ID: P001");

        console.log("\nRecords:");
        console.log("1. City Care Hospital");
        console.log("2. Bangalore General Hospital");
        console.log("3. Apollo Medical Center");

        console.log("\nConsent: ACTIVE");

        process.exit(0);

    } catch (error) {

        console.error(
            "Seed failed:",
            error
        );

        process.exit(1);
    }
};

seedDatabase();