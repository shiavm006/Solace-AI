import React from "react";
import Image from "next/image";

const DownloadCTA = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#0b0b0c]">
      <div className="relative h-[800px] w-full md:h-[960px]">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/images/68acbc076b672f730e0c77b9_2F68bb73e8d95f81619ab0f10-15.jpg"
          alt="Flowers"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex h-full flex-col items-center pt-32 text-center text-white">
          <h2 className="mb-4 font-display text-[48px] md:text-[80px] font-light leading-[1.1]">
            Download <span className="italic">Origin</span>
          </h2>
          <p className="mb-10 text-[18px]">
            Join 100k+ users for only $1 for 1 year.
          </p>
          <a
            href="#"
            className="bg-white text-black px-8 py-4 rounded-full font-semibold uppercase tracking-wider"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
};

export default DownloadCTA;


