---
title: Sketch to render with AI: turn a sketch or floor plan into a photoreal image
seoTitle: Sketch to Render AI: Free Gemini and ChatGPT Guide
description: How to turn a hand sketch, floor plan or SketchUp screenshot into a photoreal render with AI, using Gemini or ChatGPT. Includes 6 copy-paste prompts and fixes.
excerpt: Upload a sketch, a plan or a model screenshot and get a photoreal view in minutes. The prompt formula, 6 prompts and the common fixes.
crumb: Sketch to render with AI
slug: sketch-to-render-ai
category: ai-for-architects
date: 2026-11-17
keywords: sketch to render ai | ai render from sketch | floor plan to 3d render ai | gemini sketch to render | chatgpt architecture render prompt | sketchup to render ai
audience: Architects, interior designers and 3D visualisers
cta: aec
answer: To turn a sketch into a render with AI, upload a clean photo of the sketch to Gemini or ChatGPT and write a prompt with five parts: keep the geometry, name the materials, set the light, set the camera and describe the surroundings. Then change one thing at a time. You get a photoreal concept image in a few minutes. It is a picture, not a scaled drawing, so use it for early client approval and not for construction.
---

:::takeaways
- You need only a browser: Gemini or ChatGPT, on a free plan to start.
- The prompt formula is Keep + Materials + Light + Camera + Context.
- Always tell the AI to keep the form, openings and proportions of your image. This one line prevents most bad results.
- Change one thing per message. Asking for five changes at once makes the building drift.
- AI renders are concept visuals. They are not to scale and can invent details, so label them clearly for clients.
:::

## What do you need to turn a sketch into a render?

Three things, and none of them is rendering software or a powerful PC:

1. **An input image.** A hand sketch, a printed floor plan, or a screenshot of a SketchUp, Revit or Blender model.
2. **An AI chat tool that edits images.** Gemini and ChatGPT both do this. Gemini's image model is nicknamed Nano Banana.
3. **A clear prompt.** That is the rest of this guide.

| Input | Works well for | What to tell the AI |
| --- | --- | --- |
| Hand sketch | Early concept, elevations, perspectives | Which lines are walls, glass and roof |
| Floor plan | 3D cutaway views, furniture layout ideas | Room names and which way is north or the entry |
| Model screenshot (clay or white) | The most accurate results | Materials for each surface |
| Site photo | Showing the design on the real plot | What to keep and what to replace |

A model screenshot gives the most faithful render, because the perspective and proportions are already correct. A loose sketch gives the AI more freedom, which is good for ideas and bad for accuracy.

## How do you prepare the sketch?

The AI can only keep what it can see. Two minutes of preparation saves ten minutes of fixing.

- **Shoot it flat and straight.** Photograph or scan the sketch from directly above, in even light, with no shadow of your phone.
- **Darken the lines.** Go over the main outline in pen. Faint pencil gets ignored.
- **Crop tight.** Remove the desk, your hand and other drawings from the frame.
- **Label what is unclear.** Write "glass", "void" or "sloped roof" in small letters where the drawing could be read two ways.
- **For a model screenshot,** switch off axes, guides and section planes, and pick the camera angle you want in the final image.

## What is the prompt formula for an AI render?

Use five parts, in this order. Google's own guidance for its image model says the same thing in different words: be specific about the subject, the lighting and the camera, and say what must stay the same.

| Part | What it controls | Example words |
| --- | --- | --- |
| Keep | Stops the building from changing | "Keep the exact form, openings and proportions" |
| Materials | What every surface is made of | "Laterite walls, exposed concrete slab, teak louvres" |
| Light | Time of day and mood | "Soft morning sun from the left, light monsoon clouds" |
| Camera | Viewpoint and lens | "Eye-level view from the road, 24mm wide lens" |
| Context | What surrounds the building | "Coconut palms, compound wall, wet road after rain" |

:::prompt 1. Hand sketch to photoreal exterior | Gemini, ChatGPT
Turn this hand sketch into a photorealistic architectural photograph.

Keep: the exact building form, roof shape, window and door positions and proportions from the sketch. Do not add or remove floors, windows or balconies.
Materials: [FOR EXAMPLE laterite stone walls, white plaster, exposed concrete slab edges, teak wood louvres, clay roof tiles].
Light: [soft morning sunlight from the left, a few clouds].
Camera: [eye-level view from the road, 24mm lens, vertical lines straight].
Context: [tropical garden with coconut palms, stone paving, low compound wall, quiet residential street in Kerala].

Style: real photograph for an architecture magazine. No people, no cars, no text.
:::

:::prompt 2. Clay model screenshot to render | Gemini, ChatGPT
This is a screenshot of my 3D model in plain white. Turn it into a photorealistic render.

Keep the camera angle, the geometry and every opening exactly as in the screenshot. Only add materials, light and surroundings.

Materials by surface:
- Walls: [MATERIAL AND COLOUR]
- Roof: [MATERIAL]
- Windows: [FRAME COLOUR, CLEAR OR TINTED GLASS]
- Floor or paving: [MATERIAL]
- Feature element: [FOR EXAMPLE vertical timber fins on the first floor]

Light: [TIME OF DAY AND WEATHER].
Surroundings: [LANDSCAPE, NEIGHBOURS, ROAD].
Photographic, natural colours, no people, no text.
:::

## How do you turn a floor plan into a 3D view?

A plan has no heights, so tell the AI what kind of 3D view you want. A cutaway view from above is the most reliable. Treat the result as a way to explain the layout to a client, not as a measured model.

:::prompt 3. Floor plan to 3D cutaway view | Gemini, ChatGPT
This is a 2D floor plan. Create a 3D cutaway view of it, seen from above at a 45-degree angle, with the roof removed.

Keep the room layout, wall positions, doors and windows exactly as drawn. Do not add or remove rooms.

Rooms: [LIST THE ROOMS AS LABELLED, FOR EXAMPLE living, dining, kitchen, 3 bedrooms, 2 toilets, sit-out].
Walls: 3 metres high, white plaster.
Floors: [FOR EXAMPLE vitrified tile in living areas, wood-look tile in bedrooms].
Furniture: simple modern furniture that fits each room. Keep walking space clear.
Light: bright even daylight, soft shadows.

Clean architectural model style, plain light background, no text or labels.
:::

:::cta
:::

## How do you fix a render that looks wrong?

Do not start again. Reply in the same chat and change one thing. The AI remembers the image it just made, so small follow-up edits stay consistent.

:::prompt 4. One-change follow-up edits | Gemini, ChatGPT
Use these one at a time, as replies to the image you just got:

- Keep everything exactly the same. Only change the wall material to [MATERIAL].
- Keep everything exactly the same. Only change the time to dusk, with warm lights on inside.
- Keep the building exactly the same. Only replace the sky with heavy monsoon clouds and make the ground wet.
- Keep everything exactly the same. Remove the [OBJECT] on the [LEFT / RIGHT].
- The window on the first floor, left side, has changed. Restore it to match my original image.
:::

| Problem | Why it happens | Fix |
| --- | --- | --- |
| The building shape changed | No "keep" line, or too many changes at once | Add the keep line and make one change per message |
| Extra windows or floors appeared | The sketch lines were unclear | Label the sketch, or say "exactly 2 floors, 3 windows on the front" |
| Materials look plastic | Vague words like "modern" or "nice" | Name the real material and finish: "rough laterite", "matt white plaster" |
| Verticals are leaning | Wide-angle distortion | Add "vertical lines straight, two-point perspective" |
| It looks like a painting | No photo words in the prompt | Add "real photograph, natural colours, 24mm lens" |
| Text and signs are garbled | Image models are weak at small text | Add "no text" and place text later in your own software |

:::prompt 5. Same design, three moods | Gemini, ChatGPT
Using the render you just made, create 3 versions. Keep the building, camera and materials exactly the same in all three. Change only the light and weather:

1. Bright morning, clear sky
2. Golden hour, long warm shadows
3. Dusk after rain, interior lights on, wet reflections on the paving

Show them as 3 separate images.
:::

:::prompt 6. Place the design on the real site photo | Gemini, ChatGPT
Image 1 is a photo of the empty plot. Image 2 is my building design.

Place the building from image 2 onto the plot in image 1. Keep the real road, neighbouring buildings, trees and sky from image 1. Match the sunlight direction and shadows to the site photo. Keep the building's form and materials exactly as in image 2.

Photorealistic. No people, no text.
:::

## What are the limits of AI renders?

- **They are not to scale.** Proportions are approximate. Never take a dimension from an AI image.
- **They can invent things.** Check every opening, level and railing against your drawing before you show a client.
- **Fine detail and text are weak.** Google notes that small text and fine details may not come out right.
- **Images may carry an AI watermark.** Read each tool's terms if you plan to use the image in paid advertising.
- **Tell the client it is a concept.** A line such as "AI concept visual, not final design" avoids arguments later.

Once a still is approved, the next step is motion. See [how to make an AI walkthrough video from a render](/blog/ai-walkthrough-video-from-render/). For the writing side of a project, use our [ChatGPT prompts for architects](/blog/chatgpt-prompts-for-architects/).

:::faq
### Can AI turn a sketch into a realistic render for free?
Yes. Gemini and ChatGPT both accept an uploaded sketch and return a photoreal image on their free plans. Free plans limit how many images and uploads you get each day, so plan your prompts before you start.

### Which AI is best for sketch to render: Gemini or ChatGPT?
Both work with the prompts in this guide. Gemini's image model is designed to edit an uploaded image while keeping the rest unchanged, which helps a building stay true to the sketch. Run the same sketch and prompt in both and compare.

### Can AI convert a 2D floor plan into a 3D model?
It can create a 3D-looking image of the plan, such as a cutaway view, which is useful for explaining a layout to a client. It does not create a real, measurable 3D model. For that you still need SketchUp, Revit, Blender or similar software.

### Will AI replace V-Ray, Lumion or Enscape?
Not for final, accurate visuals. Rendering software works from your real model, so every dimension is right. AI is faster for early concepts, mood options and quick client approvals. The two work well together: AI first, rendering software for the final set.

### Do I need a powerful computer for AI rendering?
No. The image is generated on the tool's servers, so a normal laptop or even a phone is enough. This is the main reason small studios pick it up quickly.
:::

:::sources
- [4 tips for image editing in the Gemini app](https://blog.google/products-and-platforms/products/gemini/nano-banana-tips/) - Google's guidance on direct, one-step edits.
- [Image generation with Gemini](https://ai.google.dev/gemini-api/docs/image-generation) - Google's developer guide, including how to edit an image while keeping the rest unchanged, and known limits.
- [Gemini image generation overview](https://gemini.google/overview/image-generation/) - what the Gemini app's image model can do and who can use it.
- [Uploading files to ChatGPT](https://help.openai.com/en/articles/8555545-file-uploads-faq) - upload limits on the free and paid ChatGPT plans.
:::
