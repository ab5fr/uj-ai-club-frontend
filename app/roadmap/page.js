import Link from "next/link";
import { BreadcrumbJsonLd, CourseJsonLd } from "@/components/JsonLd";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "AI Learning Roadmap",
  description:
    "A step-by-step path from your first Python script to building real AI systems. Three phases designed for beginners through advanced learners.",
  path: "/roadmap",
});

export default function RoadmapPage() {
  return (
    <main className="page">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Roadmap", href: "/roadmap" },
        ]}
      />
      <CourseJsonLd
        title="UJ AI Club Learning Roadmap"
        description="A three-phase learning path from Python basics to building real AI systems."
        url="/roadmap"
      />
      <div className="page-hero">
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 350,
            background:
              "radial-gradient(ellipse, rgba(18,187,254,.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div className="container">
          <div className="page-hero__tag">Step-by-Step Plan</div>
          <h1 className="anim-1">
            AI Learning <span className="text-gradient">Roadmap</span>
          </h1>
          <p className="anim-2">
            Go from your first Python script to building real AI systems. Three
            phases, no guesswork.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="roadmap-layout">
            <aside className="roadmap-nav anim-1">
              <div
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: ".9rem",
                }}
              >
                Go to Phase
              </div>
              <ul>
                <li>
                  <a href="#beginner" className="active-phase">
                    <span className="phase-dot dot-beginner" />
                    Beginner
                  </a>
                </li>
                <li>
                  <a href="#intermediate">
                    <span className="phase-dot dot-inter" />
                    Intermediate
                  </a>
                </li>
                <li>
                  <a href="#advanced">
                    <span className="phase-dot dot-advanced" />
                    Advanced
                  </a>
                </li>
              </ul>

              <div className="card" style={{ marginTop: "2rem", padding: "1.25rem" }}>
                <div
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 700,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "1rem",
                  }}
                >
                  Your Progress
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".78rem",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span style={{ color: "#04d464" }}>Beginner</span>
                    <span style={{ color: "var(--text-muted)" }}>—%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: "0%",
                        background: "linear-gradient(90deg,#04d464,#04d464aa)",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".78rem",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span style={{ color: "var(--c-cyan)" }}>Intermediate</span>
                    <span style={{ color: "var(--text-muted)" }}>—%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: "0%" }} />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".78rem",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span style={{ color: "var(--c-orange)" }}>Advanced</span>
                    <span style={{ color: "var(--text-muted)" }}>—%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: "0%",
                        background:
                          "linear-gradient(90deg,var(--c-orange),#ff9055)",
                      }}
                    />
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: "1.25rem", fontSize: ".78rem" }}
                >
                  Track Your Progress
                </Link>
              </div>
            </aside>

            <div className="roadmap-phases">
              <div className="roadmap-phase beginner-phase" id="beginner">
                <div className="phase-marker" />
                <div className="phase-eyebrow">Phase 01 — Foundation</div>
                <h3 className="phase-title">Beginner</h3>
                <p className="phase-desc">
                  No AI experience needed. You&apos;ll learn the basic math and
                  coding skills used in every area of AI. Estimated time:{" "}
                  <strong style={{ color: "var(--c-light)" }}>4–6 weeks</strong>.
                </p>
                <div className="phase-steps">
                  {[
                    ["01", "Python Basics", "Variables, loops, functions, and classes. Work with data using NumPy and Pandas."],
                    ["02", "Math for AI", "Learn the key math: linear algebra, basic calculus, probability, and statistics."],
                    ["03", "Exploring Data", "Look at data, make charts, handle missing values, and pick useful features."],
                    ["04", "Classic ML Models", "Linear regression, decision trees, k-NN, and k-means using scikit-learn on real data."],
                    ["05", "Checking Your Model", "Split data for testing, use cross-validation, and learn accuracy scores like precision and recall."],
                    ["06", "Your First Full Project", "Build a complete pipeline: load data → clean it → train a model → check results → submit."],
                  ].map(([num, title, desc]) => (
                    <div key={num} className="step-card">
                      <div className="step-num">{num}</div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "1.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/challanges"
                    className="btn btn-primary"
                    style={{
                      borderColor: "#04d464",
                      background: "rgba(4,212,100,.1)",
                      color: "#04d464",
                      boxShadow: "none",
                    }}
                  >
                    Start Beginner Challenges →
                  </Link>
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                    6 challenges · 750 total pts
                  </span>
                </div>
              </div>

              <div className="roadmap-phase inter-phase" id="intermediate">
                <div className="phase-marker" />
                <div className="phase-eyebrow">Phase 02 — Depth</div>
                <h3 className="phase-title">Intermediate</h3>
                <p className="phase-desc">
                  Go deeper into neural networks, deep learning tools, and pick a
                  focus area: Computer Vision, NLP, or Reinforcement Learning.
                  Estimated time:{" "}
                  <strong style={{ color: "var(--c-light)" }}>8–12 weeks</strong>.
                </p>
                <div className="phase-steps">
                  {[
                    ["07", "Neural Networks In Depth", "How backpropagation works, choosing activation functions, weight setup, and batch normalization."],
                    ["08", "PyTorch Basics", "Tensors, auto-gradients, training loops, GPU speed-up, and loading data."],
                    ["09", "Computer Vision Track", "CNNs, ResNets, reusing trained models, object detection with YOLO, and image segmentation."],
                    ["10", "NLP Track", "Tokenization, word vectors, RNNs, LSTMs, attention, and fine-tuning BERT."],
                    ["11", "Reinforcement Learning", "MDPs, Q-learning, policy gradients, PPO, and DQN with Gym environments."],
                    ["12", "MLOps Basics", "Track experiments with MLflow, save model versions, and build repeatable pipelines."],
                  ].map(([num, title, desc]) => (
                    <div key={num} className="step-card">
                      <div className="step-num">{num}</div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "1.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/challanges"
                    className="btn btn-primary"
                    style={{
                      borderColor: "var(--c-cyan)",
                      background: "rgba(18,187,254,.1)",
                      color: "var(--c-cyan)",
                      boxShadow: "none",
                    }}
                  >
                    Start Intermediate Challenges →
                  </Link>
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                    8 challenges · 1,820 total pts
                  </span>
                </div>
              </div>

              <div className="roadmap-phase advanced-phase" id="advanced">
                <div className="phase-marker" />
                <div className="phase-eyebrow">Phase 03 — Mastery</div>
                <h3 className="phase-title">Advanced</h3>
                <p className="phase-desc">
                  Learn the latest AI models, recreate research papers, and build
                  real-world AI systems. This is where you go from learner to
                  expert. Estimated time:{" "}
                  <strong style={{ color: "var(--c-light)" }}>12–20 weeks</strong>.
                </p>
                <div className="phase-steps">
                  {[
                    ["13", "Transformers & Attention", "Build the \"Attention is All You Need\" model from scratch. Learn about GPT, T5, and CLIP."],
                    ["14", "Generative AI", "VAEs, GANs, and Diffusion Models. Train your own image generator and check the results."],
                    ["15", "Large Language Models", "Fine-tune LLMs, use LoRA, RLHF, prompt tricks, RAG pipelines, and LangChain."],
                    ["16", "Making Models Smaller", "Quantization (INT8/FP16), pruning, knowledge distillation, and deploying with TensorRT."],
                    ["17", "Recreate a Research Paper", "Pick a recent AI paper, build it end-to-end, and present what you learned to the club."],
                    ["18", "Final AI Project", "Design and launch a real AI app: build the API, add monitoring, and set up auto-deploy."],
                  ].map(([num, title, desc]) => (
                    <div key={num} className="step-card">
                      <div className="step-num">{num}</div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "1.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/challanges" className="btn btn-orange">
                    Start Advanced Challenges →
                  </Link>
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                    6 challenges · 2,600 total pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "5rem",
              padding: "3.5rem",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                height: 200,
                background:
                  "radial-gradient(ellipse, rgba(4,112,252,.09) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div className="section-eyebrow" style={{ marginBottom: ".9rem" }}>
              Ready to Start?
            </div>
            <h2 style={{ marginBottom: "1rem", fontSize: "2rem" }}>
              Start Your AI Journey Today
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: 480,
                marginInline: "auto",
                marginBottom: "2rem",
              }}
            >
              Make a free account, pick your level, and track your progress
              through each phase.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <Link href="/signup" className="btn btn-orange btn-lg">
                Create Free Account
              </Link>
              <Link href="/challanges" className="btn btn-outline btn-lg">
                Browse Challenges
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
