import updateGenerationStep from "../updateGenerationStep.js";

export const assembleKit = async (state) => {
    await updateGenerationStep(
        state.kitId,
        "assembling_kit"
    );

    const companyBrief = state.companyResearch?.brief || {};

    return {
        kit: {
            companyBrief,
            roleBreakdown: state.roleBreakdown || {},
            questions: state.questions || [],
            flashcards: state.flashcards || [],
            schedule: state.schedule || []
        }
    };
};