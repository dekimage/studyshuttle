"use client";
import Image from "next/image";
import coinImg from "../../assets/coin.png";
import blueCoinImg from "../../assets/bluecoin.png";
import logoImg from "../../assets/logo.png";
import { Button } from "@/components/ui/button";
import MobxStore from "../mobx";
import { observer } from "mobx-react-lite";
import { useRef, useState, useEffect } from "react";
import Loader from "../_components/Loader";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import withAuth from "@/src/Components/AuthHoc";
import withComingSoon from "@/src/Components/hoc/withComingSoon";

const CheckmarkIcon = ({ isBlack = false }) => {
  return isBlack ? (
    <svg
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.0707 2.17822C7.06538 2.17822 2.17969 7.06391 2.17969 13.0692C2.17969 19.0745 7.06538 23.9602 13.0707 23.9602C19.0759 23.9602 23.9616 19.0745 23.9616 13.0692C23.9616 7.06391 19.0759 2.17822 13.0707 2.17822ZM10.8936 17.8754L6.84974 13.8403L8.38754 12.2981L10.8914 14.7976L16.6571 9.03191L18.197 10.5719L10.8936 17.8754Z"
        fill="black"
      />
    </svg>
  ) : (
    <svg
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.0707 2.17828C7.06538 2.17828 2.17969 7.06398 2.17969 13.0693C2.17969 19.0745 7.06538 23.9602 13.0707 23.9602C19.0759 23.9602 23.9616 19.0745 23.9616 13.0693C23.9616 7.06398 19.0759 2.17828 13.0707 2.17828ZM10.8936 17.8754L6.84974 13.8403L8.38754 12.2982L10.8914 14.7977L16.6571 9.03197L18.197 10.572L10.8936 17.8754Z"
        fill="white"
      />
    </svg>
  );
};

const BalanceBox = ({ amount, label, color, isBluecoin }) => {
  let className = "bg-chili";
  if (color === "sky") className = "bg-sky";
  if (color === "sun") className = "bg-sun";
  return (
    <div
      className={`h-[130px] w-[190px] rounded-xl ${className} px-6 pt-2 text-white`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="w-fit text-[45px] font-bold">{amount}</div>
        <div className="rounded-full bg-slate-600 p-2">
          <Image
            src={isBluecoin ? blueCoinImg : coinImg}
            alt="coin"
            width={40}
            height={40}
            className="h-[45px] w-[45px]"
          />
        </div>
      </div>
      <div>
        <div className="text-[19px]">Токени</div>
        <div className="text-[9px]">{label}</div>
      </div>
    </div>
  );
};

async function generateHashVersion3({
  amount,
  clientid,
  currency,
  failUrl,
  hashAlgorithm,
  lang,
  oid,
  okUrl,
  rnd,
  storetype, // Changed from storeType to storetype
  trantype,
  storeKey,
  refreshtime,
}) {
  const plaintext = `${amount}|${clientid}|${currency}|${failUrl}|${hashAlgorithm}|${lang}|${oid}|${okUrl}|${refreshtime}|${rnd}|${storetype}|${trantype}|${storeKey}`;

  // Use Web Crypto API for client-side hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert to base64 - handle large arrays by chunking
  let binary = '';
  const len = hashArray.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  const hash = btoa(binary);

  console.log("Generated hash (frontend):", hash);

  return hash;
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const PaymentDialog = observer(({ selectedPlan }) => {
  const formRef = useRef(null);
  const [rnd, setRnd] = useState("");
  const [oid, setOid] = useState("");
  const [hash, setHash] = useState("");
  const { user } = MobxStore;

  const clientId = "180000166";
  const okUrl = "http://localhost:3000/api/payment-success";
  const failUrl = "http://localhost:3000/api/payment-fail";
  const trantype = "Auth";
  const currency = "807";
  const storeKey = "TEST1777";
  const storeType = "3d_pay_hosting";
  const refreshtime = "3";

  useEffect(() => {
    setRnd(generateRandomString(10));
    setOid(generateUUID());
  }, []);

  useEffect(() => {
    if (!rnd || !oid) return;
    
    let amount;
    switch (selectedPlan) {
      case "red":
        amount = "1250";
        break;
      case "blue":
        amount = "36000";
        break;
      case "yellow":
        amount = "72000";
        break;
      default:
        amount = "0";
    }

    generateHashVersion3({
      clientid: clientId,
      oid,
      amount,
      okUrl,
      failUrl,
      trantype,
      rnd,
      currency,
      storeType,
      hashAlgorithm: "ver3",
      lang: "en",
      storeKey,
      refreshtime,
      storetype: storeType,
    }).then(setHash);
  }, [rnd, oid, selectedPlan]);

  console.log("User object:", user);

  let amount;
  switch (selectedPlan) {
    case "red":
      amount = "1250";
      break;
    case "blue":
      amount = "36000";
      break;
    case "yellow":
      amount = "72000";
      break;
    default:
      amount = "0";
  }

  const handleSubmit = async (event) => {
    console.log("handleSubmit called");
    event.preventDefault();

    if (!user || !user.uid) {
      console.log("User ID is not available");
      alert("User ID is not available. Please try logging in again.");
      return;
    }

    try {
      // Store oid and rnd
      const response = await fetch("/api/store-rnd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oid, rnd, userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Payment info stored successfully");

      // Update the form data to use the generated oid and rnd
      if (formRef.current) {
        formRef.current.oid.value = oid;
        formRef.current.rnd.value = rnd;
        formRef.current.submit();
      } else {
        console.log("Form reference is null");
      }
    } catch (error) {
      console.log("Error preparing payment:", error);
      alert(
        "An error occurred while processing your payment. Please try again.",
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-sky hover:bg-sky">Избери план</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          ref={formRef}
          method="POST"
          action="https://torus-stage-halkbankmacedonia.asseco-see.com.tr/fim/est3Dgate"
        >
          <input type="hidden" name="clientid" value={clientId} />
          <input type="hidden" name="storetype" value={storeType} />
          <input type="hidden" name="currency" value={currency} />
          <input type="hidden" name="refreshtime" value={refreshtime} />
          <input
            type="hidden"
            name="hash"
            value={hash}
          />
          <input type="hidden" name="trantype" value={trantype} />
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="oid" value={oid} />
          <input type="hidden" name="encoding" value="utf-8" />
          <input type="hidden" name="hashAlgorithm" value="ver3" />
          <input type="hidden" name="okUrl" value={okUrl} />
          <input type="hidden" name="failUrl" value={failUrl} />
          <input type="hidden" name="lang" value="en" />
          <input type="hidden" name="rnd" value={rnd} />

          <Button
            type="button"
            className="w-full bg-sky hover:bg-sky"
            onClick={handleSubmit}
          >
            Наплата со картичка
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
});

const InitPaymentForm = ({ setSelectedPlan, selectedPlan }) => {
  return (
    <div>
      {/* <div className="mb-4 text-[25px] font-bold">
        Доколку имате ваучер, можете да го искористите тука:
      </div>
      <div className="mb-4 flex gap-4">
        <input
          className="w-full border border-black p-2"
          type="text"
          placeholder="Внесете го вашиот ваучер"
        />
        <Button className="bg-chili hover:bg-chili">Искористи ваучер</Button>
      </div> */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setSelectedPlan(null)}
          className="bg-grey hover:bg-grey"
        >
          Врати се назад
        </Button>
        <PaymentDialog selectedPlan={selectedPlan} />
      </div>
    </div>
  );
};

const ProfilePage = observer(() => {
  const { user } = MobxStore;

  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!user) return <Loader />;
  const { yellowTokens, blueTokens, redTokens } = user;

  return (
    <div className="">
      <div className="bg-grey  p-4 sm:p-8">
        <div className="border-l-4 border-black pl-4">
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap gap-4">
              <BalanceBox
                amount={yellowTokens || 0}
                color="sun"
                label="Индивидуални часови"
              />

              <BalanceBox
                amount={blueTokens || 0}
                color="sky"
                label="Академски групи"
                isBluecoin
              />
            </div>
            <div>
              <Image
                src={logoImg}
                alt="logo"
                height={100}
                width="100"
                className="ml-2 mt-2 w-[150px]"
              />
            </div>
          </div>
          <div className="mt-16">
            <div className="text-[45px] font-bold">Надополнете токени</div>
            <div className="max-w-[600px] text-[25px] font-bold">
              Доколку сакате да закажете час, одберете еден од нашите платежни
              планови
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-16">
        <div className="mb-4 text-[45px] font-bold">
          Нашите платежни планови{" "}
        </div>
        <div className="text-[25px] font-bold">
          Купете си Study Shuttle токени и ајде да учиме заедно!
        </div>
        <div className="text-[25px] font-bold">
          Трансакцијата на часовите се врши со токени:
        </div>
        <div className="text-[25px] font-bold text-sky">
          <span className="text-sun">1 жолт токен = 1 час,</span> 1 син токен =
          1 програма од 12 месеци.
        </div>
      </div>
      {/* RED BIG */}
      <div className=" my-16 flex  justify-center px-6 sm:px-16">
        {selectedPlan && selectedPlan == "red" && (
          <div className="flex flex-col gap-8">
            <div className="relative flex h-[640px] w-full max-w-[760px] flex-col items-center rounded-xl bg-chili p-8 text-white">
              <Image
                src={coinImg}
                alt="coin"
                width={40}
                height={40}
                className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
              />
              <div className="text-[29px] font-semibold ">Индивидуален час</div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon />
                </div>
                <div>1 токен - 1 час</div>
              </div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon />
                </div>
                <div>Право на користење од еден месец</div>
              </div>

              <div className="b-white my-6 w-full  border border-dashed"></div>

              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-8 text-[35px] font-bold">1250 МКД</div>
                <ul className="flex flex-col items-center">
                  <li className="my-8 text-[19px] font-bold">
                    ● 1 токен - 1 час
                  </li>
                  <li className="my-8 text-[19px] font-bold">
                    ● Право на користење од еден месец
                  </li>
                </ul>
              </div>
            </div>
            <InitPaymentForm
              setSelectedPlan={setSelectedPlan}
              selectedPlan={selectedPlan}
            />
          </div>
        )}
        {/* BLUE BIG */}
        {selectedPlan && selectedPlan == "blue" && (
          <div className="flex flex-col gap-8">
            <div className="relative flex h-[640px] w-full max-w-[760px] flex-col items-center rounded-xl bg-sky p-8 text-white">
              <Image
                src={coinImg}
                alt="coin"
                width={40}
                height={40}
                className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
              />
              <div className="text-[29px] font-semibold ">Годишен план</div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon />
                </div>
                <div>48 токени</div>
              </div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon />
                </div>
                <div>Целосен пристап до алатките за учење</div>
              </div>

              <div className="b-white my-6 w-full  border border-dashed"></div>

              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-8 text-[35px] font-bold">
                  3000 МКД / месечно
                </div>
                <ul className="flex flex-col items-center">
                  <li className="my-8 text-[19px] font-bold">● 48 токени</li>
                  <li className="my-8 text-[19px] font-bold">● Годишен план</li>
                </ul>
              </div>
            </div>
            <InitPaymentForm
              setSelectedPlan={setSelectedPlan}
              selectedPlan={selectedPlan}
            />
          </div>
        )}
        {/* YELLOW BIG */}
        {selectedPlan && selectedPlan == "yellow" && (
          <div className="flex flex-col gap-8">
            <div className="relative flex h-[640px] w-full max-w-[760px] flex-col items-center rounded-xl bg-sun p-8 text-black">
              <Image
                src={blueCoinImg}
                alt="coin"
                width={40}
                height={40}
                className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
              />
              <div className="text-[29px] font-semibold ">Академски групи</div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon isBlack />
                </div>
                <div>4 токени</div>
              </div>
              <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
                <div className="h-[24px]">
                  <CheckmarkIcon isBlack />
                </div>
                <div>Програма од 12 месеци</div>
              </div>

              <div className="b-white my-6 w-full  border border-dashed"></div>

              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-8 text-[35px] font-bold">
                  6000 МКД / месечно
                </div>
                <ul className="flex flex-col items-center">
                  <li className="my-8 text-[19px] font-bold">● 4 токени</li>
                  <li className="my-8 text-[19px] font-bold">
                    ● Програма од 12 месеци
                  </li>
                  <li className="my-8 text-[19px] font-bold">● Годишен план</li>
                </ul>
              </div>
            </div>
            <InitPaymentForm
              setSelectedPlan={setSelectedPlan}
              selectedPlan={selectedPlan}
            />
          </div>
        )}
      </div>

      {!selectedPlan && (
        <div className="lg:flex-no-wrap my-16 flex flex-wrap justify-center gap-8 px-6 sm:px-16">
          {/* RED SMALL */}
          <div className="relative flex h-[640px] w-full flex-col rounded-xl bg-chili p-8 text-white sm:w-[300px]">
            <Image
              src={coinImg}
              alt="coin"
              width={40}
              height={40}
              className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
            />
            <div className="text-[29px] font-semibold ">Индивидуален час</div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>1 токен - 1 час</div>
            </div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>Право на користење од еден месец</div>
            </div>

            <div className="b-white my-6 w-full  border border-dashed"></div>

            <div className="flex h-full flex-col justify-between">
              <div className="mb-24 text-[35px] font-bold">1250 МКД</div>

              <Button
                onClick={() => setSelectedPlan("red")}
                className="w-full bg-white text-[24px] text-chili hover:bg-white"
              >
                Види детали
              </Button>
            </div>
          </div>
          {/* BLUE SMALL */}
          <div className="relative flex h-[640px] w-full flex-col rounded-xl bg-sky p-8 text-white sm:w-[300px]">
            <Image
              src={coinImg}
              alt="coin"
              width={40}
              height={40}
              className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
            />
            <div className="text-[29px] font-semibold ">
              Годишен <br /> план
            </div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>48 токени</div>
            </div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>Целосен пристап до алатките за учење</div>
            </div>

            <div className="b-white my-6 w-full  border border-dashed"></div>

            <div>
              <div className="mb-24 text-[35px] font-bold">
                3000 МКД /Месечно
              </div>

              <div className="my-8 text-[19px] font-bold">Годишен план</div>

              <Button
                onClick={() => setSelectedPlan("blue")}
                className="w-full bg-white text-[24px] text-sky hover:bg-white"
              >
                Види детали
              </Button>
            </div>
          </div>
          {/* YELLOW SMALL */}
          <div className="relative flex h-[640px] w-full flex-col rounded-xl bg-sun p-8 text-white sm:w-[300px]">
            <Image
              src={blueCoinImg}
              alt="coin"
              width={40}
              height={40}
              className="absolute left-[-25px] top-[-25px] h-[70px] w-[70px]"
            />
            <div className="text-[29px] font-semibold ">Академски групи</div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>1 токен</div>
            </div>
            <div className="mb-2 mt-6 flex h-[48px] items-center gap-2">
              <div className="h-[24px]">
                <CheckmarkIcon />
              </div>
              <div>Целосен пристап до алатките за учење</div>
            </div>

            <div className="b-white my-6 w-full  border border-dashed"></div>
            <div>
              <div className="mb-24 text-[35px] font-bold">
                6000 МКД / месечно
              </div>

              <div className="my-8 text-[19px] font-bold">Годишен план</div>

              <Button
                onClick={() => setSelectedPlan("yellow")}
                className="w-full bg-white text-[24px] text-sun hover:bg-white"
              >
                Види детали
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Apply both HOCs
export default withComingSoon(withAuth(ProfilePage));
