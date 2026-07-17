"use client";
import Background from "@/components/ui/Background";
import Lypcursor from "@/components/ui/Lypcursor";
import RouteLoadingBar from "@/components/ui/RouteLoadingBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutUs() {
  return (
    <main className="relative w-full min-h-screen bg-gray-100 dark:bg-gray-900">
      <RouteLoadingBar />
      <Lypcursor />
      <Background />
      <br /><br /><br /><br /><br /><br />
      {/* Fixed Navbar */}
      <Navbar />

      {/* About Us Section */}
      <section className="relative w-3/4 mx-auto flex flex-col items-center pt-7 pb-15 bg-[#ffff00] dark:bg-gray-800 rounded-xl border-4 border-black mt-20">
        {/* Black Dots at Corners */}
        <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full top-4 right-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 left-4"></div>
        <div className="absolute w-3 h-3 bg-black rounded-full bottom-4 right-4"></div>

        {/* About Us Content */}
        <h1 className="bg-gray-100 p-4 border-3 border-black text-center text-3xl font-bold mb-6 text-black dark:text-white">
          About Us
        </h1>
        <p className="text-black text-xl mb-4 text-center max-w-2xl">
          <b>2LYP Computations</b> (LEGALLY <b>TWO-LYP COMPUTATIONS PRIVATE LIMITED</b>) is a technology company based in Vijayawada, Andhra Pradesh.<br />
          <br />
          <b>CIN:</b> U62011AP2025PTC117438<br />
          <b>GST:</b> 37AALCT5213E1ZE<br />
          <b>CEO:</b> <a href="https://www.siddhumanoj1.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">@siddhumanoj1, Siddhu Manoj Katikitala</a><br />
          <b>Website:</b> <a href="https://www.siddhumanoj1.com" target="_blank" rel="noopener noreferrer" className="underline">www.siddhumanoj1.com</a>
        </p>

        <div className="w-full flex flex-col items-center mt-8">
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Our Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* Certificate PDF viewers/links */}
            <CertificateLink name="GST Certificate" file="/about/approvs/GST.pdf" />
            <CertificateLink name="Certificate of Incorporation" file="/about/approvs/COI.pdf" />
            <CertificateLink name="MSME Certificate" file="/about/approvs/MSME.pdf" />
            <CertificateLink name="Startup Certificate" file="/about/approvs/Startup%20Certificate.pdf" />
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm">Click a certificate to view the PDF.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function CertificateLink({ name, file }) {
  return (
    <a
      href={file}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-900 border border-black rounded-lg p-4 shadow hover:bg-gray-200 dark:hover:bg-gray-800 transition text-center text-black dark:text-white font-semibold"
      style={{ minHeight: 80 }}
    >
      {name}
    </a>
  );
}