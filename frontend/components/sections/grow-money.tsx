import React from "react";
import Image from "next/image";

const GrowMoney = () => {
  return (
    <section className="bg-[#0b0b0c] py-[80px] md:py-[160px]">
      <div className="container mx-auto px-8 max-w-[1280px]">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-[40px] md:text-[64px] font-display font-light">
            <em className="italic">Grow</em> your money
          </h2>
          <p className="text-white/60 text-[16px] leading-[1.6] max-w-[600px] mb-10">
            Monitor your portfolio in real time and dive deeper into every
            position with your AI advisor.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#161617] rounded-[24px] p-8 md:p-12 border border-white/[0.05] flex flex-col items-center">
            <h3 className="text-[28px] md:text-[32px] mb-4 text-white">
              Monitor investment performance
            </h3>
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/images/68bf62637b5f6813a3d48c56_portfolio-performance-8.png"
              width={800}
              height={600}
              alt="Performance"
              className="w-full h-auto"
            />
          </div>
          {/* TODO: add additional investing cards to fully match original design */}
        </div>
      </div>
    </section>
  );
};

export default GrowMoney;


