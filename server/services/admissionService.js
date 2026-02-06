const { HistoricalScore } = require('../models/index');

const predictAdmission = async (userScore, majorId) => {
    const scores = await HistoricalScore.findAll({
        where: { major_id: majorId },
        order: [['year', 'DESC']],
        limit: 3
    });

    if (scores.length === 0) return { status: 'Unknown', message: 'No historical data' };

    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    const diff = userScore - avgScore;

    if (diff >= 2) return { status: 'Safe', chance: '80-95%' };
    if (diff >= 0) return { status: 'Moderate', chance: '50-70%' };
    return { status: 'Risky', chance: '10-30%' };
};

module.exports = { predictAdmission };
