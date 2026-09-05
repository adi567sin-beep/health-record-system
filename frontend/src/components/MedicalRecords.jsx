function MedicalRecords({ records }) {

    if (!records || records.length === 0) {
        return (
            <section className="medical-records">
                <h2>Medical Records</h2>
                <p>No medical records available.</p>
            </section>
        );
    }

    return (
        <section className="medical-records">

            <h2>Medical Records</h2>

            <div className="records-list">

                {records.map((record) => (

                    <article
                        className="record-card"
                        key={record._id}
                    >

                        <div className="record-header">

                            <h3>
                                {record.title}
                            </h3>

                            <span>
                                {record.resourceType}
                            </span>

                        </div>

                        <p>
                            {record.description ||
                                "No description available."}
                        </p>

                        <div className="record-source">

                            <strong>
                                Hospital:
                            </strong>

                            {" "}

                            {record.hospitalName}

                        </div>

                        <div>

                            <strong>
                                Date:
                            </strong>

                            {" "}

                            {new Date(
                                record.recordDate
                            ).toLocaleDateString()}

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
}

export default MedicalRecords;