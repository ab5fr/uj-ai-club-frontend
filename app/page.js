import LeaderboardCarousel from "./components/LeaderboardCarousel";
import ContactSection from "./components/ContactSection";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      {/* First screen - 75vh on mobile, original height on desktop */}
      <div className="relative h-[75vh] md:h-screen">
        {/* Hero Background */}
        <div
          className="absolute inset-x-0 top-0 h-full md:h-[calc(100%-15.5rem)]"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Hero Section */}
        <section className="absolute inset-x-0 top-0 pt-28 px-4 md:pl-24 md:pr-8 h-full md:h-[calc(100%-15.5rem)]">
          <div className="relative h-full w-full">
            {/* Text Block */}
            <div className="flex flex-col max-w-5xl md:pr-[22rem] h-full justify-start pt-12 md:pt-24">
              <h1 className="text-5xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 leading-tight tracking-tight font-extrabold md:whitespace-nowrap">
                Choose Your Path
              </h1>
              <p className="text-3xl md:text-lg lg:text-3xl mt-4 md:mt-6 font-light text-gray-200/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] max-w-4xl">
                Learn the difference between AI types we will help you whatever
                you choose
              </p>
            </div>
            {/* Call To Action Button on the right */}
            <Link
              href="/ai-specializations"
              className="hidden md:block font-extrabold absolute top-1/2 -translate-y-1/2 right-4 md:right-10 lg:right-16 xl:right-24 2xl:right-32 bg-blue-600 text-white px-12 py-5 rounded-full text-2xl hover:bg-blue-500 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition shadow-xl shadow-blue-800/30 tracking-wide"
            >
              Click Here
            </Link>
          </div>
        </section>
        {/* Large Curly Brace */}
        <div
          className="hidden md:block absolute left-24 z-10 text-[12rem] leading-none"
          style={{
            top: "calc(100% - 23rem)", // Position to overlap panorama
            color: "#0087d3",
          }}
        >
          {"}"}
        </div>

        {/* Panorama Banner with blue line */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0">
          <div
            className="w-full h-[15rem] relative overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.6)), url('/panorama.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Optional: caption or overlay content can go here */}
          </div>
          <div className="w-full h-2 bg-blue-600" />
        </div>

        {/* Blue line for mobile (no panorama) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-20">
          <div className="w-full h-2 bg-blue-600" />
        </div>
      </div>
      {/* Leaderboard Section */}
      <LeaderboardCarousel />
      {/* Contact Section */}
      <ContactSection />
    </main>
  );
}
