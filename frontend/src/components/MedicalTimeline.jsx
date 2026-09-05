function MedicalTimeline({ timeline }) {

    if (!timeline || timeline.length === 0) {

        return (
            <section className="timeline-section">

                <h2>
                    Unified Medical Timeline
                </h2>

                <p className="section-description">
                    No medical events are available.
                </p>

            </section>
        );
    }

    return (
        <section className="timeline-section">

            <h2>
                Unified Medical Timeline
            </h2>

            <p className="section-description">
                Medical events collected from authorized
                healthcare providers.
            </p>

            <div className="timeline">

                {timeline.map((event, index) => (

                    <div
                        className="timeline-item"
                        key={event.sourceId || index}
                    >

                        <div className="timeline-marker">
                        </div>

                        <div className="timeline-content">

                            <div className="timeline-header">

                                <h3>
                                    {event.title ||
                                        "Medical Event"}
                                </h3>

                                <span>
                                    {event.type ||
                                        "Record"}
                                </span>

                            </div>

                            <p>
                                {event.description ||
                                    "No description available."}
                            </p>

                            <div className="timeline-meta">

                                <strong>
                                    Hospital:
                                </strong>

                                {" "}

                                {event.hospital ||
                                    "Not available"}

                                {" • "}

                                <strong>
                                    Date:
                                </strong>

                                {" "}

                                {event.date
                                    ? new Date(
                                        event.date
                                    ).toLocaleDateString()
                                    : "Not available"}

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default MedicalTimeline;