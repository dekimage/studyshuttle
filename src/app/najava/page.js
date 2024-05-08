import { Mail, Phone } from "lucide-react";

const NajavaPage = () => {
  return (
    <div className="my-16 flex items-center justify-center p-8 text-center lg:my-48">
      <div className="flex flex-col justify-center gap-4">
        <div className="text-[24px] font-bold">
          За закажување на час, контактирајте не на:
        </div>
        <div className="flex gap-2">
          <Phone />

          <a href="tel:+38971620370" className="text-blue-500 hover:underline">
            +389 71 620 370
          </a>
        </div>
        <div className="flex gap-2">
          <Mail />

          <a
            href="mailto:andrej.ilievski@studyshuttle.mk"
            className="text-blue-500 hover:underline"
          >
            schedule@studyshuttle.mk
          </a>
        </div>
      </div>
    </div>
  );
};

export default NajavaPage;
