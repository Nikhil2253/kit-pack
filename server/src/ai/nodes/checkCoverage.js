import updateGenerationStep from "../updateGenerationStep.js";

const normalize = (value) =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9+#.]+/g, " ")
        .trim();

export const checkCoverage = async (state) => {

    await updateGenerationStep(
        state.kitId,
        "checking_coverage"
    );

    const requirements = state.requirements || {};

    const requiredItems = [
        ...(requirements.skills || []),
        ...(requirements.frameworks || []),
        ...(requirements.languages || []),
        ...(requirements.databases || []),
        ...(requirements.tools || []),
        ...(requirements.cloud || []),
        ...(requirements.concepts || [])
    ];

    const questions = state.questions || [];

    const covered = [];
    const missing = [];

    for (const requirement of requiredItems) {
        const target = normalize(requirement);

        const isCovered = questions.some((question) =>
            (question.requirementTags || []).some(
                (tag) => normalize(tag) === target
            )
        );

        if (isCovered) {
            covered.push(requirement);
        } else {
            missing.push(requirement);
        }
    }

    const total = requiredItems.length;
    const attempts = (state.coverageAttempts || 0) + 1;

    return {
        coverage: {
            totalRequirements: total,
            coveredRequirements: covered.length,
            coveragePercentage: total
                ? Math.round((covered.length / total) * 100)
                : 100,
            covered,
            missing
        },
        missingRequirements: missing,
        coverageAttempts: attempts
    };
};