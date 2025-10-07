import LeaderboardCarousel from "./components/LeaderboardCarousel";
import ContactSection from "./components/ContactSection";

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      {/* First screen - full viewport with fixed navbar overlay */}
      <div className="relative h-screen">
        {/* Hero Background (only covers area above panorama) */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "calc(100% - 15.5rem)",
            backgroundImage:
              "linear-gradient(rgba(10,10,10,0.65), rgba(10,10,10,0.8)), url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Hero Section */}
        <section
          className="absolute inset-x-0 top-0 pt-28 pl-8 md:pl-24 pr-4 md:pr-8"
          style={{ height: "calc(100% - 15.5rem)" }}
        >
          <div className="relative h-full w-full">
            {/* Text Block */}
            <div className="flex flex-col max-w-5xl pr-[22rem] h-full justify-center">
              <h1 className="text-6xl md:text-8xl font-extrabold mb-10 leading-[1.03] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-nowrap">
                Chose Your Path
              </h1>
              <p className="text-xl md:text-3xl mb-12 text-gray-200/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] max-w-4xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque euismod nisi eu consectetur, facilisis magna a
                dignissim nunc. Unlock your journey in AI today.
              </p>
            </div>
            {/* Call To Action Button on the right */}
            <button className="absolute top-1/2 -translate-y-1/2 right-4 md:right-10 lg:right-16 xl:right-24 2xl:right-32 bg-blue-600 text-white px-12 py-5 rounded-full text-2xl font-semibold hover:bg-blue-500 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition shadow-xl shadow-blue-800/30 tracking-wide">
              Click Here
            </button>
          </div>
        </section>
        {/* Panorama Banner with blue line */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="w-full h-[16rem] relative">
            <img
              src="/panorama.png"
              alt="Panorama"
              className="w-full h-full object-fill"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.6))",
                zIndex: 1,
              }}
            />
            {/* Optional: caption or overlay content can go here */}
          </div>
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
