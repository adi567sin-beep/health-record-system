import { useState } from "react";
import API from "../services/api";

function AIChat({ patientId }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askQuestion = async (e) => {
        e.preventDefault();

        if (!question.trim()) return;

        try {
            setLoading(true);
            setError("");
            setAnswer("");
            setSources([]);

            const response = await API.post("/ai/ask", {
                patientId,
                question: question.trim()
            });

            setAnswer(
                response.data.answer ||
                response.data.message ||
                "No answer was returned."
            );

            setSources(response.data.sources || []);

        } catch (error) {
            console.error("AI question error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to process your question."
            );
        } finally {
            setLoading(false);
        }
    };

    const askSuggestedQuestion = (text) => {
        setQuestion(text);
    };

    return (
        <div className="ai-chat-card">

            <div className="ai-chat-header">
                <div>
                    <h2>💬 Ask AI About Patient</h2>

                    <p>
                        Ask questions about the patient's available
                        medical history.
                    </p>
                </div>
            </div>

            {/* Suggested Questions */}

            <div className="suggested-questions">

                <h3>Suggested Questions</h3>

                <div className="suggestion-buttons">

                    <button
                        type="button"
                        onClick={() =>
                            askSuggestedQuestion(
                                "What diagnoses does this patient have?"
                            )
                        }
                    >
                        What diagnoses does this patient have?
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            askSuggestedQuestion(
                                "What medications were prescribed?"
                            )
                        }
                    >
                        What medications were prescribed?
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            askSuggestedQuestion(
                                "Which hospitals have this patient's records?"
                            )
                        }
                    >
                        Which hospitals have the records?
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            askSuggestedQuestion(
                                "Give me an overview of this patient's history."
                            )
                        }
                    >
                        Give me an overview of the history.
                    </button>

                </div>

            </div>

            {/* Question Form */}

            <form
                className="ai-chat-form"
                onSubmit={askQuestion}
            >

                <input
                    type="text"
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                    placeholder="Ask a question about this patient..."
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={
                        loading ||
                        !question.trim()
                    }
                >
                    {loading ? "Thinking..." : "Ask AI"}
                </button>

            </form>

            {/* Loading */}

            {loading && (
                <div className="ai-chat-loading">
                    🤖 Analyzing the patient's medical records...
                </div>
            )}

            {/* Error */}

            {error && (
                <div className="ai-chat-error">
                    {error}
                </div>
            )}

            {/* AI Answer */}

            {answer && !loading && (

                <div className="ai-answer">

                    <div className="ai-answer-title">
                        🤖 AI Answer
                    </div>

                    <p className="ai-answer-text">
                        {answer}
                    </p>

                    {/* Sources */}

                    {sources.length > 0 && (

                        <div className="ai-answer-sources">

                            <h3>
                                📚 Sources Used by AI
                            </h3>

                            {sources.map((source) => (

                                <div
                                    className="ai-source-item"
                                    key={source.sourceId}
                                >

                                    <div className="source-number">
                                        {source.sourceId}
                                    </div>

                                    <div className="source-details">

                                        <strong>
                                            {source.title}
                                        </strong>

                                        <span>
                                            🏥 {source.hospital}
                                        </span>

                                        <span>
                                            📅 {source.date}
                                        </span>

                                        <span>
                                            📄 {source.type}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    <div className="ai-disclaimer">

                        AI-generated response based on the patient's
                        available medical records. Verify important
                        information against the original medical records.

                    </div>

                </div>

            )}

        </div>
    );
}

export default AIChat;