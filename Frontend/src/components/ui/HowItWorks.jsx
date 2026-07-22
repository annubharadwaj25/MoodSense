function HowItWorks() {
    return (
        <section className="how-it-works">

            <div className="section-header">
                <h2>How MoodSense Works</h2>

                <p>
                    Just four simple steps to understand and improve your emotional well-being.
                </p>
            </div>

            <div className="steps">

                {/* Step 1 */}
                <div className="step-card">
                    <div className="step-icon">😊</div>

                    <h3>Detect</h3>

                    <p>Analyze your facial expression or mood.</p>
                </div>

                <div className="step-arrow">→</div>

                {/* Step 2 */}
                <div className="step-card">
                    <div className="step-icon">🧠</div>

                    <h3>Analyze</h3>

                    <p>AI understands your emotional state.</p>
                </div>

                <div className="step-arrow">→</div>

                {/* Step 3 */}
                <div className="step-card">
                    <div className="step-icon">💡</div>

                    <h3>Suggest</h3>

                    <p>Receive personalized wellness tips.</p>
                </div>

                <div className="step-arrow">→</div>

                {/* Step 4 */}
                <div className="step-card">
                    <div className="step-icon">📊</div>

                    <h3>Track</h3>

                    <p>Monitor your mood and progress over time.</p>
                </div>

            </div>

        </section>
    );
}

export default HowItWorks;