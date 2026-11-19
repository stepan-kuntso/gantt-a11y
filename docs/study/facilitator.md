# Facilitator guide

For one session of about 75 minutes with one participant who uses a screen reader daily. Who to invite, and why, is in [ANNOUNCEMENTS.md, section 8](../ANNOUNCEMENTS.md#8-open-questions-for-user-testing). Participants are paid for their time; agree the amount before the session.

## Before the session

- Run `npm run demo` and check that `http://localhost:8080/demo/study.html` opens. For a remote session, the participant needs the page on their own machine or a shared one; agree this beforehand.
- The participant uses their own screen reader, speech rate, voice and braille display. Do not change their settings.
- Decide the order: half of the participants start **without** the extension (`study.html?a11y=off`) for tasks 1 to 6, then do them again with it; the other half the other way round. Tasks 7 to 12 are with the extension.
- Have [tasks.md](tasks.md) open for yourself, and a recording sheet with one row per task (see below).
- The study page collects nothing. Any recording (audio, screen) needs the participant's spoken consent at the start, and is stored by you, not by the page.

## Introduction (read or say in your own words)

> Thank you for taking part. We are testing a way of making project plans, shown as Gantt charts, usable with a screen reader. We are testing the software, not you: if something is hard, that is what we want to find. There are no wrong answers.
>
> I will give you twelve small tasks. Please think aloud: say what you hear, what you expect, and what you try. I will not be able to help much during a task, because I want to see what happens without help, but you can stop any task, or the whole session, at any time.
>
> May I record the audio of this session? It is only used to check my notes, and is deleted afterwards. [Wait for an answer.]

Then give one minute of free exploration: "This is a plan for a website redesign. Have a look around; tell me what you find."

## During each task

Read the task aloud exactly as written in tasks.md. Do not name keys or features unless the task is about them, and do not use words the extension uses ("depends on", "conflict") before the participant does, except where the task itself contains them.

Record for each task:

| Field | What to write |
|---|---|
| Result | success, partial, fail (definitions in tasks.md) |
| Time | from the end of your question to the answer |
| Heard | what the screen reader said that mattered, as close to verbatim as you can; note cut-offs and anything spoken twice |
| Order | was the result heard before, instead of, or after the row? |
| Keys | which keys the participant tried, including ones that did nothing |
| Help | whether a hint was given, and which |
| Quote | anything the participant said that explains their understanding |

## Hints without leading

- Wait. Silence of 20 to 30 seconds is normal while the participant listens and thinks.
- If they are stuck for about 3 minutes, ask: "What are you looking for right now?" Then: "Would you like a hint?" Only if they say yes, give the smallest hint first: "There is a key that lists the other keys." Next level: name the key. Record the level of hint.
- If they ask "Is this right?", answer with a question: "What makes you unsure?" At the end of the task you may tell them the answer.
- Do not correct their wording. If they call a predecessor "parent", note it (T16).

## After each task

Ask, in this order, and write the answers:

1. "How sure are you of your answer, from 1 (not at all) to 5 (completely)?"
2. "Was there anything you heard that you did not understand?"
3. "Was anything too long, or too fast?"
4. For tasks 6, 7 and 9: "When did you find out the result: right away, or later?"

## At the end

- "Was there a moment when you learned something too late?" (T18)
- "What would you call the relation between two tasks where one has to wait for the other?" (T16, before they hear our words again)
- "Which of the keys would you use again? Which would you change?"
- "Is there anything you expected to be able to do and could not?"
- For participants who did tasks 1 to 6 twice: "Which way was easier, and why?"

Thank the participant, pay them, and tell them how the results will be used.

## After the session

Write up within a day, while you remember. Separate what was observed (heard, done, time) from what the participant said they prefer; the two often differ. Note the screen reader and version, browser, operating system and speech rate for every session.
