/**
 * The Atrios case study, as data rather than JSX.
 *
 * Keeping the prose in plain strings means apostrophes and quotes need no
 * entity escaping, and the running order of text, figures and empty slots can
 * be rearranged by moving one line.
 *
 * Eight sections: what it is, the product I inherited, the story, onboarding,
 * qualification, the Inbox, incentives, what I took from it. The old standalone
 * Speed section is dissolved — the deploy loop is one line in section two and
 * one in section four, where it explains the pace of the work rather than
 * standing on its own.
 *
 * The [NEEDS YOU] notes from the draft are not rendered — they are editorial
 * notes to the author, not page content. They live in page.tsx as a comment.
 */

import type { DiagramKey } from "./Diagrams";

export type ImageSpec = { src: string; alt: string; width: number; height: number };

export type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "lede"; text: string }
  | { kind: "pull"; text: string }
  /** A smaller note set to the right of the column, for context that is not the point. */
  | { kind: "aside"; text: string }
  /** A headline number, centred under the figure it belongs to. */
  | { kind: "stat"; text: string }
  | { kind: "rule" }
  /** A diagram drawn in code — see Diagrams.tsx. */
  | { kind: "figure"; name: DiagramKey; caption: string }
  /** A screenshot from public/, with its size so Next can reserve the space. */
  | { kind: "image"; src: string; alt: string; width: number; height: number; caption?: string; size?: "small" }
  /** A short screen recording, muted and looping, with a handwritten note pointing at it. */
  | { kind: "video"; src: string; poster: string; width: number; height: number; note?: string; caption?: string }
  /** A screenshot on the left and a diagram on the right, centred on each other. */
  | { kind: "imageFigure"; image: ImageSpec; figure: DiagramKey; caption?: string; stat?: string; wide?: boolean }
  /** Two screenshots side by side, one caption. */
  | { kind: "imagePair"; images: [ImageSpec, ImageSpec]; caption?: string }
  /** An empty frame to drop artwork or a screenshot into later. */
  | { kind: "slot"; label: string; hint: string; ratio?: string }
  /** Two empty frames side by side, for before/after pairs. */
  | { kind: "slotPair"; label: string; beforeHint: string; afterHint: string };

export const BLOCKS: Block[] = [
  // 1 — What it is.
  {
    kind: "lede",
    text: "Atrios pays people to make warm introductions. Someone you trust says you should meet this person, and that introduction becomes a booked meeting on a company's calendar. No cold outreach. The oldest move in business, made into a product.",
  },
  {
    kind: "video",
    src: "/atrios-hero.mp4",
    poster: "/atrios-hero-poster.jpg",
    width: 1600,
    height: 876,
  },
  {
    kind: "p",
    text: "I joined when it had around $10,000 in revenue and almost nobody using it. I was on the founding team and did the design, product, and engineering myself. The idea was right. The product was in the way of it. 5 months later, it has 8,000 users with $2M in ARR.",
  },
  {
    kind: "p",
    text: "Most of what follows is the cheap kind of change: layout, copy, flow, the things you can see. The last decision is the other kind.",
  },
  { kind: "rule" },

  // 2 — The product I inherited: the door, the loop, the pace, the numbers.
  { kind: "h2", text: "The product I inherited" },
  {
    kind: "p",
    text: "The product I inherited was not usable. Not broken, exactly: every step worked if you were patient enough. But it asked for a LinkedIn export before it showed you anything, ran every introduction through email with the CEO on cc, and paid out months after the meeting, with nothing in between tracked. The people it was built for, the ones with networks worth protecting, are exactly the people who do not put up with that.",
  },
  { kind: "p", text: "Getting in looked like this." },
  {
    kind: "imageFigure",
    image: {
      src: "/atrios-onboarding-linkedin.png",
      alt: "Step 3 of 4 of the old onboarding: instructions for requesting a LinkedIn data archive, with a button that says I've requested my archive",
      width: 1006,
      height: 704,
    },
    figure: "onboardingBeforeColumn",
  },
  {
    kind: "p",
    text: "If you got in, making an introduction and getting paid for it looked like this.",
  },
  {
    kind: "imageFigure",
    image: {
      src: "/atrios-before-intro.jpg",
      alt: "The old Propose an introduction dialog listing five steps: start the intro process, reach out, they respond, connect them by email, get rewarded $800",
      width: 1440,
      height: 860,
    },
    figure: "introFlowCompact",
    wide: true,
  },
  {
    kind: "p",
    text: "The 1% is the number that stayed with me. Payment is the end of the core loop: an intro was made, a meeting happened, the vendor confirmed it. Almost nobody who walked in reached it. We were losing people at the door and calling it something else.",
  },
  {
    kind: "p",
    text: "Behind both numbers, deploying a change to dev took half a day, which set the pace for everything below.",
  },
  { kind: "rule" },

  // 3 — The story.
  { kind: "h2", text: "The story" },
  {
    kind: "p",
    text: "The first thing I changed was the positioning. Atrios paid people to introduce their contacts, which is the plot of affiliate marketing, and nobody with a network worth protecting wants to be read that way. So we changed who the main character was: not the company looking for leads, but the person whose friends already ask them what to use. We called them tastemakers. The pitch went from \u201cintro your friends and make money\u201d to \u201cif your friends need something, send them through here.\u201d Money is still in the sentence, but it comes last, as a consequence.",
  },
  {
    kind: "video",
    src: "/atrios-landing-first.mp4",
    poster: "/atrios-landing-first-poster.jpg",
    width: 1600,
    height: 804,
    note: "my first week: the new landing page",
  },
  { kind: "rule" },

  { kind: "h2", text: "Onboarding: removing the door" },
  {
    kind: "imagePair",
    images: [
      { src: "/atrios-onboarding-about.jpg", alt: "The new Atrios application: paste a LinkedIn URL, pick a role and industry, add a phone number, with the companies marketplace visible behind the form", width: 2000, height: 1093 },
      { src: "/atrios-onboarding-sync.jpg", alt: "Step two of onboarding: connect LinkedIn or Google Calendar in one click, with a plain 'I'll do it later' link under the Continue button", width: 2000, height: 1101 },
    ],
    caption: "Screens as I designed and shipped them. The whole application, after. One pasted URL does the work the CSV used to do, and the connection step comes second, after you have seen the marketplace, with a plain link to skip it.",
  },
  {
    kind: "p",
    text: "The hypothesis was that people were leaving because of what we asked for before they got anything, not because of who they were. If that was right, removing the ask would move completion without changing who got in.",
  },
  { kind: "p", text: "2 changes, and only 1 of them was a decision." },
  {
    kind: "p",
    text: "I rebuilt the application flow. Replacing the CSV export with a pasted LinkedIn URL was obvious once it was measured. Nobody defends a 2-hour wait.",
  },
  {
    kind: "p",
    text: "Making the connection step optional was not obvious, and it is the one I would argue for again. The social graph is the most valuable thing we could hold. It is what lets us tell someone who they could introduce, and it is the reason the product can eventually do more than wait for people to think of a name. Giving it up at the door felt like giving up the product.",
  },
  {
    kind: "p",
    text: "But we were asking for it before the user had received anything. Anything you put in front of the first turn of the loop is a tax you charge people for a value they have not yet experienced. The ask does not get cheaper by being early. It gets more expensive, because there is nothing on the other side of it yet.",
  },
  {
    kind: "p",
    text: "By this point we had moved off Lambdas to Hono, with the frontend on Vercel, so a change took minutes to see rather than half a day. That is why these could be tried one at a time instead of as one large rewrite.",
  },
  {
    kind: "figure",
    name: "onboardingAfter",
    caption: "3 steps, with connect sitting outside as optional.",
  },
  {
    kind: "p",
    text: "Onboarding completion is now around 70%. The remaining 30% is deliberate: we turn away people who are not a fit rather than letting them in and failing them later.",
  },
  { kind: "rule" },

  // 6 — The Inbox.
  { kind: "h2", text: "The Inbox: one product instead of two" },
  {
    kind: "p",
    text: "Before, a tastemaker sent a friend a loose link. The friend clicked it, landed somewhere, and never learned what Atrios was or why their friend was involved. Nothing tracked. Nothing explained.",
  },
  {
    kind: "p",
    text: "I started out fixing that loop and ended up somewhere larger. The hypothesis was that the two audiences were one, and if that was right, a person who arrived as a friend would come back as a tastemaker without being asked to.",
  },
  {
    kind: "p",
    text: "Every tastemaker is also a good lead. They are exactly the sort of person our companies want to meet, which means the two roles we had been designing as separate audiences were the same people the whole time. So we stopped building for two.",
  },
  {
    kind: "p",
    text: "I designed and built the Inbox so that one account holds both sides. The friend who was referred lands there and sees which companies want to talk to them. The tastemaker sees the same thing, on the same surface, because there is no longer a difference. We learn who someone is once rather than twice.",
  },
  {
    kind: "imagePair",
    images: [
      { src: "/atrios-home-v3.jpg", alt: "The Atrios home: companies to introduce friends to, each with a reward per meeting and a target contact", width: 2000, height: 1095 },
      { src: "/atrios-inbox-v3.jpg", alt: "The Atrios Inbox: companies that want to meet you, each with a reward, a short brief, and the steps to qualify, book, and give feedback", width: 2000, height: 1093 },
    ],
    caption: "Home and Inbox, one account. On the left, companies you could introduce a friend to. On the right, companies that want to meet you. The same person uses both.",
  },
  {
    kind: "p",
    text: "That changed what brings someone back. A static list of companies on a website is something you visit when you remember it exists. An inbox where new companies show up is something you check. The reason to open the product stopped being an obligation to go make an introduction and became curiosity about who is asking for you.",
  },
  {
    kind: "figure",
    name: "loop",
    caption: "The loop closes on itself.",
  },
  {
    kind: "p",
    text: "It also closes the loop it started as. The person who received an introduction is the best possible candidate to make one, because they have felt what it is like from the receiving end.",
  },
  { kind: "rule" },

  // 5 — Qualification.
  { kind: "h2", text: "Qualification: making an answer final" },
  {
    kind: "p",
    text: "People were retrying the qualification questions until they passed. Some of them 7 times.",
  },
  {
    kind: "p",
    text: "That is not a user problem. If someone can guess their way through a filter, the filter is telling them what answer to give. We were running a check that taught people how to defeat it.",
  },
  {
    kind: "p",
    text: "The hypothesis was that the check was teaching people the answer. If that was right, making an answer final would end the rerolls without the pass rate collapsing.",
  },
  {
    kind: "figure",
    name: "qualification",
    caption: "The loop fed itself. Each attempt revealed more about the answer we wanted.",
  },
  {
    kind: "p",
    text: "2 changes. We verify answers against the open web instead of taking them at face value. And we removed the ability to reroll, so an answer is an answer. That is only enforceable because an answer now belongs to an account, the same account that receives intros and takes meetings, rather than to a link anyone could open again.",
  },
  {
    kind: "figure",
    name: "qualificationAfter",
    caption: "",
  },
  {
    kind: "p",
    text: "This is friction added to a funnel I had spent months removing friction from, which is worth being honest about. The difference is what the friction is for. The CSV wait cost the user something and gave them nothing. The qualification check costs them a second attempt and gives the vendor a real lead.",
  },
  { kind: "rule" },

  // 7 — Incentives.
  { kind: "h2", text: "Incentives: the one I could not make alone" },
  {
    kind: "p",
    text: "Every decision above was mine to make, and more importantly it was fast to read. A layout change shows up in the funnel within days. That short delay is what made me confident about them.",
  },
  {
    kind: "p",
    text: "This one is neither. I argued for it for months before it shipped, and it is 2 weeks old. Sales had to go to vendors and pitch a closed-won incentive. Users had to rethink what the product was for. After months of it, the CEO agreed to try.",
  },
  {
    kind: "p",
    text: "We paid $500 when an introduction led to a meeting, split between the referrer and the friend who took it. Around 30% of activity was gamed. People asked friends to take a vendor meeting and split the money. Nobody was doing anything the product forbade. They were doing exactly what it paid for.",
  },
  {
    kind: "pull",
    text: "Gaming is not a character problem in your users. It is an output of the design.",
  },
  {
    kind: "p",
    text: "If you reward a proxy, people optimize the proxy, and they will be better at it than you expect.",
  },
  {
    kind: "p",
    text: "The hypothesis was that gaming was an output of the reward, not of the users. If that was right, moving the reward to the outcome would remove it without any enforcement, and the people who left would be the ones the old reward had selected for. So the change was not enforcement. It was moving what we pay on. The intro and the meeting still pay, but a small amount, too small to be worth gaming. The big payout moved downstream to closed-won, when the friend becomes a customer, with product incentives for the friend on the same event. People still get an immediate reward for the act, but the number they are aiming at when they make an intro is the one at the end.",
  },
  {
    kind: "p",
    text: "Donella Meadows has a list of places you can intervene in a system, ordered by how much each one moves it. Near the bottom sit the numbers: prices, thresholds, copy, layout. Near the top sit the rules about what gets rewarded, and above those, what the system is for. Her observation is that the powerful places are rarely where people push, because the weak ones are visible and cheap and the strong ones are defended.",
  },
  {
    kind: "p",
    text: "Every decision above this section sits near the bottom of that list. This is the first one that sits near the top, and it is the only one I could not make by myself.",
  },
  {
    kind: "p",
    text: "It also finished the sentence the story section started. We had already changed what we said the product was for. This changed what it paid for, which is the version people believe.",
  },
  {
    kind: "figure",
    name: "incentives",
    caption: "The size and placement of the payouts is the whole argument.",
  },

  { kind: "h3", text: "What it cost" },
  {
    kind: "p",
    text: "Volume dropped. Activity dipped. Our heaviest users saw their earnings fall, because they had optimized for a fast cycle that no longer exists.",
  },
  {
    kind: "p",
    text: "That dip is not the change failing. It is the change working. The old system's best players were the people the old system selected for.",
  },

  { kind: "h3", text: "What changed that I did not expect" },
  {
    kind: "p",
    text: "I expected the composition of users to shift. It has started to, but not the way I planned for.",
  },
  {
    kind: "p",
    text: "When we talked to heavy users whose earnings had dropped, they agreed with the direction. And something changed in the relationship. They started wanting to help their network find the right solution rather than wanting to run volume. We did not just change what they did. We changed what the activity meant to them.",
  },
  {
    kind: "p",
    text: "The old system paid people to spend their reputation. The new one pays them for spending it well. The incentive and the reputation now point in the same direction, which is what the product always claimed to be about.",
  },

  { kind: "h3", text: "What I do not know yet" },
  {
    kind: "p",
    text: "The reward runs on the closed-won cycle, so the evidence arrives months from now. I made this decision before I could have proof, because the composition of the user base was the problem and no amount of layout work reaches it.",
  },
  {
    kind: "p",
    text: "It will have worked if dormant, highly connected users come back to the platform. That costs no acquisition spend and it tells us these are the people the product was for.",
  },
  { kind: "rule" },

  // 8 — What I took from it.
  { kind: "h2", text: "What I took from it" },
  {
    kind: "p",
    text: "Every section above is the same move run at a different speed. Start from the number that is wrong. Write down what would have to be true for it to move. Build the smallest version that tests that, ship it, and read the result before deciding anything else.",
  },
  {
    kind: "p",
    text: "Onboarding, the Inbox, and qualification each ran that loop in weeks. The incentive change is the same move with a read that takes months, and that changes the discipline. When the loop is fast you can be wrong cheaply and let the numbers argue for you. When it is slow you have to write down what worked and failed will look like before you ship, hold the position while the early numbers look worse, and be honest that you are holding it on reasoning rather than proof.",
  },
  {
    kind: "p",
    text: "The pattern I would carry forward: the thing holding a product where it is is almost never the thing you can see. Layout, copy, and flow are where attention goes because they are visible and cheap to change. What a product rewards is invisible, and it decides who shows up.",
  },
  {
    kind: "pull",
    text: "You can redesign every screen and get the same people doing the same thing on different pages.",
  },
  {
    kind: "p",
    text: "So the thing I want to keep doing is the loop itself, at whatever speed the problem allows: find the number that is wrong, write down what would have to be true for it to move, build the smallest thing that tests it, and hold the position long enough to find out. The screens are how you get there. They were never the point.",
  },
];
