"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Animated from "@/components/Animated";
import Sticky from "@/components/Sticky";
import React from "react";
import Image from "next/image";

const SITE = "https://kaleidoscope-alpha.vercel.app/?";

function createParams(body: object, params?: string): string {
  const param = new URLSearchParams(params);
  Object.entries(body).forEach(([n, val]) => {
    param.set(n, val as string);
  });
  return param.toString();
}

function useParams() {
  const params = useSearchParams();
  const router = useRouter();

  return [
    params,
    (p: any) => {
      router.push("?" + createParams(p, params.toString()));
    },
  ] as const;
}

function Page0() {
  const [params, setParams] = useParams();

  return (
    <div
      className="text-8xl text-amber-600 select-none mb-30"
      onClick={() => setParams({ page: "1" })}
    >
      <Animated className="hover:text-amber-700 cursor-pointer">
        {" "}
        KALEIDOSCOPE{" "}
      </Animated>
      <div className="mx-auto w-fit mt-2">
        <div className="text-3xl text-center text-amber-600 shooting-star">
          Shyanne Novak
        </div>
      </div>
    </div>
  );
}

function Page1() {
  const [email, setEmail] = useState("");
  const [params, setParams] = useParams();
  const send = useMutation(api.myFunctions.sendEmail);
  const sendEmail = () => {
    setParams({ page: "2" });
    send({
      from: "Shyanne Novak <noreply@autumnrockwell.net>",
      to: email.trim(),
      subject: "Kaleidoscope",
      html: `Haii!<br/><br/>Thank you so much for being interested in my website :D! I haven't uploaded anything yet, but I'll always send you an email when I do!<br/><br/>Click <a href="${SITE + createParams({ page: 3, email: email.trim() })}">here</a> to check out the main page!<br/><br/>See you soon <3<br/>Shyanne`,
    });
  };
  return (
    <>
      <Sticky
        className="bg-orange-sticky -rotate-12 text-2xl absolute top-20 left-30 p-14.5"
        size="lg"
      >
        Hi! My name is Shyanne, and I made this website as a way for me to
        document my journey to Oberlin College!!
      </Sticky>
      <Sticky className="bg-red-sticky rotate-6 top-50 left-50 w-[260px] h-[260px] p-[2.9775rem]">
        I just got accepted (early decision), and I'm hoping to make some new
        Oberlin friends!
      </Sticky>
      <Sticky
        className="bg-yellow-sticky -rotate-[3deg] absolute bottom-20 right-20"
        size="lg"
      >
        Wanna be friends? What's your oberlin email?
        <div className="mt-1 mb-4">
          <hr className="w-full" />
          <input
            className="outline-none py-1 text-xl w-full"
            placeholder="Email here!"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <hr className="w-full" />
        </div>
        <button
          onClick={sendEmail}
          className="mt-5 cursor-pointer disabled:cursor-default disabled:text-gray-600 hover:underline disabled:no-underline"
          disabled={!email.trim().endsWith("@oberlin.edu")}
        >
          Click me!
        </button>
      </Sticky>
      <div className="absolute bottom-20 left-20 text-8xl text-orange-300">
        <Animated speed={1000}>{"      "}</Animated>
      </div>
      <div className="absolute top-20 right-20 text-8xl text-red-400">
        <Animated speed={1000}>{"      "}</Animated>
      </div>
    </>
  );
}

function Page2() {
  return (
    <Sticky
      className="bg-red-sticky -rotate-6 top-75 left-75 p-10.5 w-[225px] h-[225px]"
      size="md"
    >
      I sent you an email! Check it out ^_^ (it may take a bit!)
    </Sticky>
  );
}

function Page3() {
  const [params, setParams] = useParams();
  const [show, setShow] = useState(false);

  const pushPerson = useMutation(api.myFunctions.pushPerson);
  const person = useQuery(api.myFunctions.person, {
    email: params.get("email")!,
  });

  useEffect(() => {
    if (params.get("email") === null) {
      throw new Error("bruh, no email provided??? lameeee");
    }
    pushPerson({ email: params.get("email")! });
    setTimeout(() => setShow(true), 750);
  }, []);

  useEffect(() => {
    if (person && person.name) {
      setParams({ page: "4" });
    }
  }, [person]);

  const [name, setName] = useState("");

  const nextPage = () => {
    if (params.get("email") === null) {
      throw new Error("bruh, no email provided??? lameeee");
    }
    pushPerson({ email: params.get("email")!, name });
    setParams({ page: "4" });
  };

  return (
    show && (
      <>
        <Sticky className="w-[250px] h-[250px] p-10 bg-yellow-sticky rotate-[4deg]">
          What's your first name?
          <div className="mt-3 mb-4">
            <hr className="w-full" />
            <input
              className="outline-none py-1 text-xl w-full"
              placeholder="Shyanne"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <hr className="w-full" />
          </div>
          <button
            onClick={nextPage}
            className="mt-5 cursor-pointer disabled:cursor-default disabled:text-gray-600 hover:underline disabled:no-underline"
            disabled={
              name.length <= 1 ||
              name.toLowerCase().trim().startsWith("shyanne")
            }
          >
            Click me!
          </button>
        </Sticky>
      </>
    )
  );
}

function formatDate(n: number) {
  const date = new Date(n);
  return `${date.toLocaleString([], { month: "long", day: "numeric" })}, ${date.toLocaleString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

function Page4() {
  const people = (useQuery(api.myFunctions.allPeople) || []).map((p) => ({
    name: (p.name || "").replaceAll(" ", "").substring(0, 9),
    email: p.email,
  }));
  const [params, setParams] = useParams();

  const person = useQuery(
    api.myFunctions.person,
    params.get("email") ? { email: params.get("email")! } : "skip",
  );
  const additional = person?.poem4 ? "!line-through" : "";
  return (
    <>
      <Sticky className="bg-orange-sticky w-[450px] h-[450px] p-15 absolute top-10 left-10 -rotate-[10deg]">
        <div className={"underline w-fit mx-auto " + additional}>Friends</div>
        <div className={"grid-cols-2 grid " + additional}>
          {people.slice(-15).map((p, i) => (
            <React.Fragment key={i}>
              {p.email !== params.get("email") && (
                <div
                  className={
                    "mx-auto w-fit " +
                    [
                      "rotate-2",
                      "-rotate-2",
                      "rotate-3",
                      "-rotate-3",
                      "rotate-0",
                    ][i % 5]
                  }
                  style={{
                    transform: `translate(${(i % 5) * ((i % 2) - 2)}px, ${(i % 3) * ((i % 2) - 2)}px)`,
                  }}
                  key={p.email}
                >
                  {p.name}
                </div>
              )}
              {p.email === params.get("email") && (
                <div className="mx-auto w-fit">
                  <Animated> {p.name || ""} </Animated>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Sticky>
      {person?.poem1 && (
        <Sticky className="bg-red-sticky p-12 w-[250px] h-[250px] absolute top-5 right-30 rotate-3">
          <span
            onClick={() => setParams({ page: "new-beginnings" })}
            className="hover:underline cursor-pointer"
          >
            New Beginnings
          </span>
          <br />
          <Animated>{"             "}</Animated>
          <br />
          <br />
          <br />
          <span className="shooting-star text-sm text-gray-800">
            {formatDate(person.poem1 as number)}
          </span>
        </Sticky>
      )}
      {person?.poem2 && (
        <Sticky className="bg-yellow-sticky p-12 w-[250px] h-[250px] absolute top-67 right-50 -rotate-3">
          <span
            onClick={() => setParams({ page: "bridge" })}
            className="hover:underline cursor-pointer"
          >
            Bridge
          </span>
          <br />
          <Animated>{"             "}</Animated>
          <br />
          <br />
          <br />
          <span className="shooting-star text-sm text-gray-800">
            {formatDate(person.poem2 as number)}
          </span>
        </Sticky>
      )}
      {person?.poem3 && (
        <Sticky className="bg-red-sticky p-12 w-[250px] h-[250px] absolute bottom-5 right-30">
          <span 
          onClick={() => setParams({ page: "reve" })}
            className="hover:underline cursor-pointer"
          >Reve</span>
          <br />
          <Animated>{"             "}</Animated>
          <br />
          <br />
          <br />
          <span className="shooting-star text-sm text-gray-800">
            {formatDate(person.poem3 as number)}
          </span>
        </Sticky>
      )}
      {person?.poem4 && (
        <Sticky className="bg-red-sticky p-12 w-[400px] h-[250px] -rotate-2 absolute bottom-5 left-30">
          <Animated>{" "}CREDITS{" "}</Animated><br/>
          <span className="text-sm">
          story, website, photos, music by Autumn Rockwell.
          <br/>shooting star font: stefanitrirosasetiati@gmail.com
          <br/>dreamwish font: Starlight Fonts, Lauren C. Brown
          <br/>pencil font: JOEBOB graphics
          </span>
        </Sticky>
      )}
    </>
  );
}

function NewBeginnings() {
  const [params, setParams] = useParams();
  const person = useQuery(api.myFunctions.person, {
    email: params.get("email")!,
  });
  const currentPage = params.get("newBeginningsPage");
  const setResp = useMutation(api.myFunctions.setResponse);
  const set = useMutation(api.myFunctions.setShared);

  const [response, setResponse] = useState(person?.response ?? "");

  useEffect(() => {
    if (currentPage === null) {
      setParams({ newBeginningsPage: 0 });
    }
  }, [currentPage]);

  const submitResponse = () => {
    setResp({ email: person!.email, response });
    setParams({
      newBeginningsPage: "3",
    });
    set({ email: person!.email });
  };

  return (
    <>
      <div className="bg-image-2 w-full h-screen" />
      <div className="h-screen w-full overflow-clip flex z-10 absolute top-0 left-0 justify-center items-center align-middle bg-transparent">
        <Sticky className="bg-red-sticky absolute top-5 left-5 p-5 py-10 w-[100x] h-[100px] rotate-6">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => {
              if (currentPage === "0") {
                setParams({ page: "4" });
                return;
              }
              setParams({ newBeginningsPage: parseInt(currentPage!) - 1 });
            }}
          >
            &lt;-Back
          </span>
        </Sticky>
        {currentPage === "0" && (
          <>
            <Sticky className="bg-yellow-sticky w-[300px] h-[300px] p-16 absolute top-10 left-60 -rotate-6">
              Hey {person?.name}!
              <br />
              <br />
              Thank you for taking the time to look at what I made! :D
            </Sticky>

            <Sticky
              className="bg-orange-sticky absolute top-20 left-150 rotate-2"
              size="md"
            >
              I don't usually get the chance to show people what I make :(
            </Sticky>

            <Sticky className="bg-red-sticky w-[250px] h-[250px] p-10 -rotate-3 absolute top-15 left-230">
              Anyway, I wrote this poem, and wanted to know what you thought of
              it!
            </Sticky>

            <Sticky
              className="bg-red-sticky absolute top-120 rotate-2"
              size="sm"
            >
              <span
                className="hover:underline cursor-pointer"
                onClick={() => setParams({ newBeginningsPage: "1" })}
              >
                Click me to read it!
              </span>
            </Sticky>
          </>
        )}
        {currentPage === "1" && (
          <>
            <Sticky className="bg-red-sticky w-[500px] h-[500px] p-15 absolute rotate-2">
              Autumn
              <br />
              by Shyanne Novak
              <br />
              <br />
              The orange tint of autumn leaves
              <br />
              The dead, gray grass
              <br />
              Scattered sounds of a creature's flees
              <br />
              Dampening rays of the sun, so vast
              <br />
              <br />
              Dead leaves and even deader trees
              <br />
              One day, I'll let this breath by my last
              <br />
              Nature's gift, I'll get to be
              <br />
              Where present turns to past
            </Sticky>
            <Sticky
              className="bg-yellow-sticky absolute bottom-50 left-2 -rotate-4"
              size="lg"
            >
              <br />
              I made a small song to go with it!
              <br />
              <br />
              <audio controls className="w-[240px] -ml-5">
                <source src="music.mp3" type="audio/mp3" />
              </audio>
            </Sticky>

            <Sticky
              className="bg-orange-sticky absolute right-30 bottom-20 rotate-12"
              size="md"
            >
              <span
                onClick={() => setParams({ newBeginningsPage: "2" })}
                className="hover:underline cursor-pointer"
              >
                Continue! -&gt;
              </span>
            </Sticky>
          </>
        )}
        {currentPage === "2" && (
          <>
            <Sticky className="bg-orange-sticky absolute left-10" size="lg">
              What did you think of it?
              <textarea
                className="outline-none py-1 text-xl w-full resize-none"
                rows={4}
                placeholder="Write it here!!"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
              <span
                className="cursor-pointer hover:underline"
                onClick={submitResponse}
              >
                Click me!
              </span>
            </Sticky>
            <Image
              className="absolute right-10 rotate-12"
              src="/mee.png"
              width={504}
              height={378}
              alt="A photo of me!"
            />
            <Sticky
              className="bg-red-sticky absolute right-10 bottom-20"
              size="md"
            >
              A photo of me working on the poem :D!
            </Sticky>
          </>
        )}
        {currentPage === "3" && (
          <>
            <Sticky
              className="bg-red-sticky absolute left-30 rotate-3"
              size="lg"
            >
              Thank you so much for sharing your feedback with me!! Hopefully
              you thought the poem and music was okay ;-;
            </Sticky>
            <Sticky
              onClick={() => setParams({ page: "4", newBeginningsPage: "0" })}
              className="bg-orange-sticky absolute right-30 bottom-30 -rotate-6"
              size="lg"
            >
              Do you want to share some of your own work?
              <br />
              <br />
              <span className="hover:underline cursor-pointer">
                <a
                  href={`mailto:shyanne.novak07@gmail.com?subject=Kaleidoscope%20Project&body=Hey%20Shyanne!%0A%0AI%20attached%20my%20most%20wonderful%20and%20beautiful%20piece%20to%20this%20email%20%3AD.%0A%0ALove%20you%20so%20so%20much!%0A${person?.name}`}
                  target="_blank"
                >
                  Yes
                </a>
              </span>
              <br />
              <span className="hover:underline cursor-pointer">No</span>
            </Sticky>
          </>
        )}
      </div>
    </>
  );
}

function Bridge() {
  const [params, setParams] = useParams();
  const person = useQuery(api.myFunctions.person, {
    email: params.get("email")!,
  });
  const currentPage = params.get("bridgePage");

  useEffect(() => {
    if (currentPage === null) {
      setParams({ bridgePage: 0 });
    }
  }, [currentPage]);

  return (
    <>
      <div className="bg-image-3 w-full h-screen" />
      <div className="h-screen w-full overflow-clip flex z-10 absolute top-0 left-0 justify-center items-center align-middle bg-transparent">
        <Sticky className="bg-red-sticky absolute top-5 left-5 p-5 py-10 w-[100x] h-[100px] rotate-6">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => {
              if (currentPage === "0") {
                setParams({ page: "4" });
                return;
              }
              setParams({ bridgePage: parseInt(currentPage!) - 1 });
            }}
          >
            &lt;-Back
          </span>
        </Sticky>
        {currentPage === "0" && (
          <>
            <Sticky
              className="bg-red-sticky absolute left-0 top-50 flex rotate-3 z-80"
              size="md"
            >
              Buildings stand still, but we never do. One{" "}
              <div className="absolute left-40 top-24">place</div>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-61 left-40 rotate-5 z-70"
              size="md"
            >
              <br />
              &nbsp;&nbsp;to the next, we can barely{" "}
              <div className="absolute left-40.5 top-24">breathe.</div>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-74 left-80 rotate-12 z-60"
              size="md"
            >
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Is home a place? No. It's{" "}
              <div className="absolute left-41 top-24 text-nowrap">
                a feeling.
              </div>
            </Sticky>
            <Sticky
              className="bg-yellow-sticky absolute top-85 left-121 rotate-3 z-50"
              size="md"
            >
              <div className="text-nowrap absolute left-19 top-16 -rotate-18">
                Will I ever feel
              </div>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-88 left-163 -rotate-3 z-40"
              size="md"
            >
              &nbsp;&nbsp;at home? Everyone{" "}
              <div className="absolute top-16 left-29 text-nowrap">
                around me
              </div>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-90 left-205 rotate-7 z-30"
              size="md"
            >
              <div className="text-nowrap absolute top-14.5 left-9.5">
                feels so distant, like
              </div>
            </Sticky>
            <Sticky
              className="bg-yellow-sticky absolute top-103 left-244 rotate-14"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;I'm water under a bridge that's meant to be{" "}
              <span
                onClick={() => setParams({ bridgePage: 1 })}
                className="underline cursor-pointer text-gray-700 hover:text-black"
              >
                forgotten
              </span>
              .
            </Sticky>
          </>
        )}

        {currentPage === "1" && (
          <>
            <Sticky
              className="bg-yellow-sticky absolute top-103 left-0 -rotate-14 z-80"
              size="md"
            >
              I'm like a rusty bridge in an{" "}
              <div className="absolute top-11 left-35 -rotate-30 text-nowrap">
                untouched
              </div>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-90 left-40 -rotate-7 z-70"
              size="md"
            >
              &nbsp;&nbsp;forest. Made <br />
              &nbsp;in a place far away, living in{" "}
              <div className="absolute text-nowrap -rotate-30 top-16 left-39">
                a place I'm
              </div>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-88 left-80 rotate-3 z-60"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;not <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;meant to
              <br />
              &nbsp;be in. I hear{" "}
              <div className="absolute text-nowrap -rotate-45 top-13 left-35">
                a raging river
              </div>
            </Sticky>
            <Sticky
              className="bg-yellow-sticky absolute top-85 left-121 -rotate-3 z-50"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dragging
              <br />
              &nbsp;&nbsp;&nbsp; me through <br />
              &nbsp;&nbsp;jagged rocks,{" "}
              <div className="absolute text-nowrap -rotate-45 top-12 left-37">
                and it's headed
              </div>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-74 left-163 -rotate-12 z-40"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Oberlin, <br />
              &nbsp;&nbsp;Ohio. I see{" "}
              <div className="absolute text-nowrap -rotate-42 top-13 left-33">
                a dome of glass
              </div>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-61 left-205 -rotate-5 z-30"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ahead of
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;me. Who will I be inside?{" "}
              <div className="absolute text-nowrap -rotate-45 top-15 left-19">
                Who will I be outside?
              </div>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute left-244 top-50 -rotate-3 z-20"
              size="md"
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Will I<br />
              &nbsp;&nbsp;&nbsp; ever feel like me? Who even is{" "}
              <span
                onClick={() => setParams({ bridgePage: 2 })}
                className="underline cursor-pointer text-gray-700 hover:text-black"
              >
                me
              </span>
              ?
            </Sticky>
          </>
        )}

        {currentPage === "2" && (
          <>
            <Sticky
              className="bg-red-sticky absolute left-0 top-70 flex rotate-3 z-80"
              size="md"
            >
              The bridge has no place in nature. It's{" "}
              <Sticky className="bg-yellow-sticky absolute -rotate-30 left-32 z-90 top-15 text-nowrap px-3">
                brief existence
              </Sticky>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-70 left-55 rotate-5 z-70"
              size="md"
            >
              &nbsp;&nbsp;is solely to
              <br />
              &nbsp;&nbsp; benefit other people.{" "}
              <Sticky className="bg-yellow-sticky absolute rotate-15 left-35 z-90 top-28 text-nowrap px-3">
                It helps others
              </Sticky>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-101 left-115 rotate-12 z-60"
              size="md"
            >
              move from place to place, but it can't{" "}
              <Sticky className="bg-orange-sticky absolute -rotate-40 left-30 z-90 top-10 text-nowrap px-5">
                go anywhere by itself.
              </Sticky>
            </Sticky>
            <Sticky
              className="bg-yellow-sticky absolute top-100 left-190 rotate-3 z-50"
              size="md"
            >
              &nbsp;The bridge shouldn't move.{" "}
              <Sticky className="bg-red-sticky absolute -rotate-120 -left-5 z-90 -top-15 text-nowrap px-5">
                The bridge shouldn't create.
              </Sticky>
            </Sticky>
            <Sticky
              className="bg-orange-sticky absolute top-35 left-210 -rotate-40 z-40"
              size="md"
            >
              &nbsp;Its job is stability. A high paying job.{" "}
              <Sticky className="bg-yellow-sticky absolute rotate-110 -left-30 z-90 top-73 text-nowrap px-8">
                The bridge has people depending on it.
              </Sticky>
            </Sticky>
            <Sticky
              className="bg-red-sticky absolute top-140 left-260 rotate-7 z-30"
              size="md"
            >
              All it should do is stand{" "}
              <span
                onClick={() => setParams({ bridgePage: 3 })}
                className="underline cursor-pointer text-gray-700 hover:text-black"
              >
                still
              </span>
              .
            </Sticky>
          </>
        )}

        {currentPage === "3" && (
          <>
            <Sticky className="bg-orange-sticky rotate-3 w-[700px] h-[700px] px-20 py-30">
              Bridge
              <br /> By Shyanne Novak
              <div className="flex align-middle h-full w-full items-center">
              <video className="z-20 mx-auto" width="230" height="409" controls autoPlay>
                <source src="walking.MOV"/>
              </video>
              </div>
            </Sticky>
          </>
        )}
      </div>
    </>
  );
}


function Reve() {
  const [params, setParams] = useParams();
  const person = useQuery(api.myFunctions.person, {
    email: params.get("email")!,
  });

  const setFinish = useMutation(api.myFunctions.setFinish);

  const finish = () => {
    setParams({page: 4});
    setFinish({email: person!.email});
  }

  return (
    <>
      <div className="bg-image-4 w-[1600px] h-screen" />
      <div className="h-screen w-full overflow-clip flex z-10 absolute top-0 left-0 justify-center items-center align-middle bg-transparent">
        <div className="text-white absolute text-[1.4rem] pencil -rotate-1 top-135 left-188">A destination just out of reach.</div>
        <div className="text-white absolute text-[1.1rem] pencil -rotate-2 top-125 left-186">A place I dream of visiting.</div>
        <div className="text-white absolute text-[0.95rem] pencil -rotate-2 top-117 left-184">All it takes is to make the journey.</div>
        <div className="text-white absolute text-[0.7rem] pencil -rotate-1 top-103 left-180">But I skipped a step.</div>
        <div className="text-white absolute text-[0.65rem] pencil -rotate-1 top-97.5 left-176">Is it too late for me?</div>
        <div className="text-white absolute text-[0.5rem] pencil -rotate-[0.6deg] top-92.5 left-174">Will I ever get to be who I want to be?</div>
        <div className="text-white absolute text-[0.45rem] pencil -rotate-[0.8deg] top-88 left-172">I dream for a life other than my own.</div>
        <div className="text-white absolute text-[0.43rem] pencil -rotate-[0.8deg] top-84 left-171">I see a person who looks like me.</div>
        <div className="text-white absolute text-[0.41rem] pencil -rotate-[0.4deg] top-80.5 left-170">They have a beaming smile, and a warm heart.</div>
        <div className="text-white absolute text-[0.41rem] pencil -rotate-[0.4deg] top-77 left-169">And I know in my soul I can be that person.</div>
        <div className="text-white absolute text-[0.39rem] pencil -rotate-[0.35deg] top-74 left-168">A person who can tolerate themselves.</div>
        <div className="text-white absolute text-[0.36rem] pencil rotate-[0.4deg] top-71.5 left-167">But I'm too scared to make the final <span className="underline text-gray-400 hover:text-white cursor-pointer" onClick={finish}>step</span>.</div>
        <div className="text-black absolute text-[0.7rem] pencil rotate-[0.4deg] top-120 left-30">I'll never be like anyone else.<br/>On some level I find I can't relate to anyone.<br/>I feel like everyone in my life silently judges me.<br/>Because I'll never be like them.</div>
        <div className="text-black absolute text-[0.7rem] pencil rotate-[0.4deg] top-5 right-3">There's a part of me that wants to say goodbye to everything.<br/>It feels so much easier.</div>
        </div>
      </>
  );
}


const PAGES = [Page0, Page1, Page2, Page3, Page4];

const NAMED_PAGES = {
  "new-beginnings": NewBeginnings,
  bridge: Bridge,
  reve: Reve
};

export default function Home() {
  const [params, setParams] = useParams();

  useEffect(() => {
    if (params.get("page") === null) {
      setParams({ page: 0 });
    }
  }, [params.toString()]);

  if (isNaN(parseInt(params.get("page") ?? "0"))) {
    const Page = NAMED_PAGES[params.get("page") as "new-beginnings"];
    return <Page />;
  }

  const Page = PAGES[parseInt(params.get("page") ?? "0")];

  return (
    <>
      <div className="bg-image w-full h-screen" />
      <div className="h-screen w-full overflow-clip flex z-10 absolute top-0 left-0 justify-center items-center align-middle bg-transparent">
        <Page />
      </div>
    </>
  );
}
