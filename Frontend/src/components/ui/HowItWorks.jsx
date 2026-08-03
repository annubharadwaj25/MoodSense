import Icon from "./Icon";

function HowItWorks() {
    return (
        <section className="how-it-works">

            <div className="section">
                <span className="section-eyebrow">How it works</span>
                <h2 className="section-heading">
                    Four quiet steps to <em>understand</em> yourself
                </h2>
                <p className="section-subtitle">
                    A simple, guided process to notice, name, and nurture your emotions.
                </p>

                <div className="steps">

                    <div className="step-card">
                        <div className="step-icon">
                            <Icon name="spark" size={28} />
                        </div>
                        <h3>Reflect</h3>
                        <p>Share how you're feeling — in your own words.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <Icon name="brain" size={28} />
                        </div>
                        <h3>Understand</h3>
                        <p>Our AI gently understands your emotional state.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <Icon name="lightbulb" size={28} />
                        </div>
                        <h3>Guide</h3>
                        <p>Receive thoughtful, personalized wellness guidance.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <Icon name="chart" size={28} />
                        </div>
                        <h3>Track</h3>
                        <p>Watch your emotional patterns unfold over time.</p>
                    </div>

                </div>
            </div>

        </section>
    );
}

export default HowItWorks;
