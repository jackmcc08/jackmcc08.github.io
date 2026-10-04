---
layout: post
title: Jev and TypeSafe
description: A little research into Jev. 
date: 2026-10-03 09:00 +0100
categories: [AI]
tags: [AI, TypeSafe, Jev, Automation, LLM, Quick-Read]
comments: true
---

### What is Jev?

Spent about an hour looking at Jev yesterday, a new frontier AI model from [TypeSafe](https://typesafe.ai/). It has burst onto the scene and is being touted as faster and cheaper because of the way it works. Its designed as a System One model (read Daniel Kahneman's book - Thinking Fast & Slow) used for **quick, intuitive judgements** instead of deliberate reasoning.

You send it a question and the options you want it to choose from. It then returns a probablistic judgement on one or more of the pre-defined outcomes. It does not output generated prose.

There are 3 [Primitives](https://docs.typesafe.ai/primitives) you can ask - `choice`, `noul` or `score`. In one request you can combine 1+ primitives.

- `Noul` : A bool type - assigns a probabilitiy to the question being True or False (e.g. is the customer asking for a human agent?)
- `Choice` : You define a selection of options and it judges the most likely one based on the criteria. (e.g. what type of meeting is this?)
- `Score` : You define a series of levels and it tells you the probability it has reached that level (e.g. what is the bug severity?)

It was trained using RLCD (Reinforcement Learning for Calibrated Decisions) instead of RLHF (Reinforcement Learning with Human Feedback) - check out this [blog on the difference to LLMs](https://typesafe.ai/blog/introducing-system-one-models-and-jev).

### How you could use it:

- Deciding on model routing
- Deciding which team should respond to a query or service desk ticket
- Action decision making (Human and LLMs)
- [TypeSafe List](https://docs.typesafe.ai/concepts/use-case-map)

### Useful Website:

- [Playground](https://console.typesafe.ai/playground)
- [What is Jev Engineering?](https://madewithjev.com/what-is-jev-engineering)
- [TypeSafe docs](https://docs.typesafe.ai/)
- [Free - AI Writing Checker tool](https://madewithjev.com/free-tools/ai-writing-checker)
- [Good video explanation from IBM](https://www.youtube.com/watch?v=YGgNBcIgI4s)

### Quickstart:

- You will need an API key (can get one directly from TypeSafe) - check out the playground.
- Install it as a skill in your project to start building with it: `npx skills add typesafe-ai/skills`
- You can call Jev directly from an API call - no agent framework needed - check out the quickstart documentation.