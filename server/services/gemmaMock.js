// Mock Gemma 4 analysis service
// In real implementation, integrate with Google Gemma API

const analyzeCheckins = (checkins) => {
    // Simple mock logic: if blood sugar > 200 or < 70, alert
    const alerts = [];

    checkins.forEach(checkin => {
        if (checkin.blood_sugar > 200) {
            alerts.push({
                type: 'high_blood_sugar',
                message: `High blood sugar detected: ${checkin.blood_sugar} on ${checkin.checkin_date}`,
                severity: 'warning'
            });
        } else if (checkin.blood_sugar < 70) {
            alerts.push({
                type: 'low_blood_sugar',
                message: `Low blood sugar detected: ${checkin.blood_sugar} on ${checkin.checkin_date}`,
                severity: 'emergency'
            });
        }
    });

    return alerts;
};

module.exports = { analyzeCheckins };