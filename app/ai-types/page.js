"use client";

export default function AITypesPage() {
  return (
    <main className="min-h-screen bg-[#010617] text-white pt-32">
      {/* Machine Learning Section - Left Aligned */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#7CD0F9]">
              Machine Learning (ML)
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Often used interchangeably with AI, machine learning is a
              fundamental subfield that focuses on developing algorithms that
              allow computers to learn from and make predictions or decisions
              based on data. This is the engine that powers many AI applications
              we interact with daily.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Learning Section - Right Aligned */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="ml-auto max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#7CD0F9] text-right">
              Deep Learning (DL)
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              A subfield of machine learning, deep learning utilizes artificial
              neural networks with many layers (hence "deep") to learn from vast
              amounts of data. This approach has been particularly successful in
              complex tasks like image and speech recognition.
            </p>
          </div>
        </div>
      </section>

      {/* NLP Section - Left Aligned */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#7CD0F9]">
              Natural Language Processing (NLP)
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              This specialization is dedicated to enabling computers to
              understand, interpret, and generate human language. NLP is the
              technology behind chatbots, language translation services, and
              sentiment analysis tools.
            </p>
          </div>
        </div>
      </section>

      {/* Computer Vision Section - Right Aligned */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="ml-auto max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#7CD0F9] text-right">
              Computer Vision
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              As the name suggests, this field aims to give computers the
              ability to "see" and interpret the visual world. Computer vision
              is at the heart of facial recognition systems, self-driving cars,
              and medical imaging analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Specializations Diagram Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div
            className="rounded-3xl p-8 md:p-12 relative"
            style={{
              backgroundImage: "url('/AI-specializations-rect.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4">
                  All the specializations are connected
                </h3>
                <p className="text-lg">
                  but there are some differences of skills you need in each
                  major
                </p>
              </div>
              <div className="flex-1 relative flex justify-end">
                <img
                  src="/AI-specializations.png"
                  alt="AI Specializations Diagram"
                  className="w-4/6 h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Robotics Section - Left Aligned */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 text-[#7CD0F9]">Robotics</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              This interdisciplinary field combines AI, engineering, and
              computer science to design, build, and operate robots. AI plays a
              crucial role in enabling robots to perceive their environment,
              make decisions, and perform tasks autonomously.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
