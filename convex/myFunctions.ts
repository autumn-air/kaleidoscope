import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api, components } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Resend } from "@convex-dev/resend";
// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.


const resend: Resend = new Resend(components.resend, { testMode: false });

const SITE = "https://kaleidoscope-alpha.vercel.app/?";

function createParams(body: object, params?: string): string {
  const param = new URLSearchParams(params);
  Object.entries(body).forEach(([n, val]) => {
    param.set(n, val as string);
  });
  return param.toString();
}

export const sendEmail = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: args.from,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
  },
});

export const pushPerson = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (existing && args.name) {
      await ctx.db.patch(existing._id, {
        name: args.name,
      });
      return;
    }
    if (existing) {
      return;
    }

    await ctx.db.insert("people", {
      email: args.email,
      name: args.name ?? "",
      poem1: false,
      poem2: false,
      poem3: false,
      poem4: false,
    });
  },
});

export const allPeople = query({
  handler: async (ctx) => {
    return await ctx.db.query("people").collect();
  },
});

export const sendPoem = mutation({
  args: {
    number: v.number(), // 1 2 3 4
    from: v.string(),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    for (const people of await ctx.runQuery(api.myFunctions.allPeople)) {
      if (people.poem1 && args.number === 1 || 
        people.poem2 && args.number === 2 ||
        people.poem3 && args.number === 3 ||
        people.poem4 && args.number === 4
      ) {
        continue; // already sent respective poem
      }

      if (args.number === 2 && !people.poem1 || args.number === 3 && !people.poem2) {
        continue; // haven't sent the poem before it yet
      }

      const link = SITE + createParams({ page: 3, email: people.email });

      const POEMS = ["", `Hey ${people.name!}<br/><br/>I just wanted to let you know that my first post went out just now! Seems you signed up at just the right time!! :D<br/><br/>Check it out <a href="${link}">here!</a>`,
        `Hey ${people.name}!<br/><br/>${people.shared ? "Thank you so much for sharing your piece with me! I've been getting so many responses and everyone from Oberlin just seems so talented!! I feel like what I made doesn't at all compare to what you did...<br/><br/>" : "I noticed you haven't shared one of your own pieces with me :( Is it because you didn't get a chance to, or do you just not want to share anything with me? A lot of other people have been and wow! Everyone at Oberlin is so talented it's crazy.<br/><br/>"}${people.response ? (people.response.length < 20 ? "I noticed you shared some feedback on my poem!! It didn't really look like you had much to say tho... Was it just not that interesting?<br/><br/>" : "Thank you so much for giving me feedback on my poem!!! It really means a lot to me. I feel really amateur to everyone else who's been submitting pieces, but I've been trying to get better! I don't really know where to start tho...<br/><br/>") : "I noticed you didn't share any feedback on my poem that I shared with you... Do you not like it? It's okay... I just want to know.<br/><br/>"}Anyway, I was touring Oberlin today and came across this place called the Arb! Have you been there? It's really pretty. I came across this bridge, and someone had graffitied "NATURE IS QUEER!" on it. I'm not really sure I know what that means TBH, but my mom seemed really annoyed by it (she hates the fact that I'm coming here).<br/><br/>ANYway, the bridge inspired me to make another post! Check it out <a href="${link}">here!</a><br/><br/>xoxo,<br/>Shyanne`,
        `Hey ${people.name},<br/><br/>I've decided to stop working on the Kaleidoscope project. The more I hear back from each of you the more I learn I shouldn't be a writer. You've all been doing this so much longer than I have, I just can't compete.<br/><br/>Maybe it's for the better, anyway. My mom was getting anxious that I wanted to shell out so much money for a creative writing major. Computer science just seems like a better fit for me, I guess. <br/><br/>Thank you so much ${people.name} for giving the time to look at my website${people.response ? ", and for the feedback you've given me" : ""}. ${people.shared ? "I hope you continue to create! You'll go far, I'm sure." : ""}<br/><br/>I made a <a href="${link}">final post</a>, but you don't have to look at it if you don't want to. I kinda lost motivation on it anyway.<br/><br/>Goodbye, ${people.name}. <br/>Love,<br/>Shyanne Novak`
      ]

      resend.sendEmail(ctx, {
        from: args.from,
        to: people.email,
        subject: args.subject,
        html: POEMS[args.number],
      });
      await ctx.db.patch(
        people._id,
        args.number === 1
          ? { poem1: Date.now() }
          : args.number === 2
            ? { poem2: Date.now() }
            : args.number === 3
              ? { poem3: Date.now() }
              : { poem4: Date.now() },
      );
    }
  },
});

export const person = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();
  },
});

export const setResponse = mutation({
  args: {
    email: v.string(),
    response: v.string()
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.query("people").filter(q => q.eq(q.field("email"), args.email)).unique();
    await ctx.db.patch(person!._id, {response: args.response});
  }
})

export const setShared = mutation({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.query("people").filter(q => q.eq(q.field("email"), args.email)).unique();
    await ctx.db.patch(person?._id!, {shared: true});
  }
});

export const setFinish = mutation({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
   const person = await ctx.db.query("people").filter(q => q.eq(q.field("email"), args.email)).unique(); 
    await ctx.db.patch(person?._id!, {poem4: true});
  }
})

// poem 4 is going to represent if the final email was sent i.e. "I took it down, thanks anyway"
