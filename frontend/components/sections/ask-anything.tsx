import React from "react";
import Image from "next/image";

const AskAnything = () => {
  return (
    <section className="ai-section bg-[#0b0b0c] py-[80px] md:py-[160px] overflow-hidden relative">
      <div className="container mx-auto max-w-[1280px] px-8">
        <div className="hero__wrapper flex flex-col items-center text-center">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/svgs/68addfe5b5ebdbf6f5d59eaa_Union-5.svg"
            alt="Star"
            width={32}
            height={32}
            className="star animate-pulse mb-6"
          />
          <h2 className="large-heading font-display text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.2] mb-8 tracking-[-0.02em]">
            <span className="text-white">
              <em className="font-serif-italic">Ask</em> anything
            </span>
          </h2>
          <p className="max-w-[640px] text-secondary-foreground/60 font-sans text-[1.125rem] leading-[1.6]">
            Origin AI turns your questions into answers you can trust—with
            personalized advice, grounded in your data.
          </p>
        </div>
      </div>
      {/* TODO: add chat simulation UI to fully match original design */}
    </section>
  );
};

export default AskAnything;


