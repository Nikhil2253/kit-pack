import updateGenerationStep from "../updateGenerationStep.js";

export const buildSchedule = async (state) => {
    await updateGenerationStep(
        state.kitId,
        "building_schedule"
    );

    const days = Math.max(1, Math.min(60, Number(state.daysUntilInterview) || 1));

    const requirements = state.requirements || {};
    const questions = state.questions || [];

    const topics = [
        ...(requirements.languages || []),
        ...(requirements.frameworks || []),
        ...(requirements.skills || []),
        ...(requirements.databases || []),
        ...(requirements.tools || []),
        ...(requirements.cloud || []),
        ...(requirements.concepts || [])
    ];

    const uniqueTopics = [...new Set(topics.map(String))];

    const questionTopics = {};

    for (const question of questions) {
        for (const tag of question.requirementTags || []) {
            const key = String(tag);

            if (!questionTopics[key]) {
                questionTopics[key] = 0;
            }

            questionTopics[key]++;
        }
    }

    const sortedTopics = [...uniqueTopics].sort(
        (a, b) => (questionTopics[b] || 0) - (questionTopics[a] || 0)
    );

    const schedule = [];

    for (let day = 1; day <= days; day++) {
        let focus = [];
        let activities = [];

        if (days === 1) {
            focus = sortedTopics;
            activities = [
                "Review core requirements",
                "Practice high-priority interview questions",
                "Review flashcards",
                "Complete a final interview simulation"
            ];
        } else if (day === 1) {
            focus = sortedTopics.slice(0, Math.max(1, Math.ceil(sortedTopics.length * 0.3)));
            activities = [
                "Understand the role requirements",
                "Study core technologies",
                "Review fundamental concepts"
            ];
        } else if (day === days) {
            focus = sortedTopics.slice(0, Math.max(1, Math.ceil(sortedTopics.length * 0.4)));
            activities = [
                "Review weak areas",
                "Practice high-priority questions",
                "Review flashcards",
                "Complete a final mock interview"
            ];
        } else {
            const topicsPerDay = Math.max(
                1,
                Math.ceil(sortedTopics.length / Math.max(1, days - 2))
            );

            const start = ((day - 2) * topicsPerDay) % Math.max(1, sortedTopics.length);

            focus = sortedTopics.slice(start, start + topicsPerDay);

            if (!focus.length) {
                focus = sortedTopics.slice(0, 3);
            }

            activities = [
                "Study the day's focus areas",
                "Practice related interview questions",
                "Review flashcards"
            ];

            if (day % 3 === 0) {
                activities.push("Practice behavioral and technical interview questions");
            }
        }

        schedule.push({
            day,
            focus,
            activities
        });
    }

    return {
        schedule
    };
};
