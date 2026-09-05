const normalizeName = (name = "") => {
    return name
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

const normalizePhone = (phone = "") => {
    return phone.replace(/\D/g, "").slice(-10);
};

const calculateNameSimilarity = (first, second) => {
    const a = normalizeName(first);
    const b = normalizeName(second);

    if (!a || !b) {
        return 0;
    }

    if (a === b) {
        return 1;
    }

    const firstParts = new Set(a.split(" "));
    const secondParts = new Set(b.split(" "));

    const intersection = [...firstParts].filter(word =>
        secondParts.has(word)
    );

    const union = new Set([
        ...firstParts,
        ...secondParts
    ]);

    return intersection.length / union.size;
};

const calculateDobSimilarity = (dobA, dobB) => {
    if (!dobA || !dobB) {
        return null;
    }

    return dobA === dobB ? 1 : 0;
};

const calculatePhoneSimilarity = (phoneA, phoneB) => {
    if (!phoneA || !phoneB) {
        return null;
    }

    return normalizePhone(phoneA) === normalizePhone(phoneB)
        ? 1
        : 0;
};

const matchPatients = (patientA, patientB) => {

    const nameScore = calculateNameSimilarity(
        patientA.name,
        patientB.name
    );

    const dobScore = calculateDobSimilarity(
        patientA.dateOfBirth,
        patientB.dateOfBirth
    );

    const phoneScore = calculatePhoneSimilarity(
        patientA.phone,
        patientB.phone
    );

    let totalWeight = 0;
    let weightedScore = 0;

    // Name
    weightedScore += nameScore * 0.5;
    totalWeight += 0.5;

    // DOB
    if (dobScore !== null) {
        weightedScore += dobScore * 0.3;
        totalWeight += 0.3;
    }

    // Phone
    if (phoneScore !== null) {
        weightedScore += phoneScore * 0.2;
        totalWeight += 0.2;
    }

    const totalScore =
        totalWeight > 0
            ? weightedScore / totalWeight
            : 0;

    let status;

    if (totalScore >= 0.85) {
        status = "MATCH";
    } else if (totalScore >= 0.65) {
        status = "POSSIBLE_MATCH";
    } else {
        status = "NO_MATCH";
    }

    return {
        matched: status === "MATCH",
        status,
        score: Number(totalScore.toFixed(2)),
        confidence: `${Math.round(totalScore * 100)}%`,

        details: {
            nameScore: Number(nameScore.toFixed(2)),
            dobScore,
            phoneScore
        }
    };
};

module.exports = {
    matchPatients
};