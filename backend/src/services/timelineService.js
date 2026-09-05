const createTimeline = (records) => {
    return records
        .sort(
            (a, b) =>
                new Date(a.recordDate) -
                new Date(b.recordDate)
        )
        .map(record => ({
            date: record.recordDate,
            hospital: record.hospitalName,
            type: record.resourceType,
            title: record.title,
            description: record.description,
            sourceId: record._id
        }));
};

module.exports = {
    createTimeline
};