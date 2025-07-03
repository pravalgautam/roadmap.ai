import axios from "axios";

export const generateRoadmap = async (topic, isPremium) => {
const prompt = isPremium
  ? `Create a comprehensive roadmap to become a ${topic} formatted with clear headings and structured content. Each section must include relevant YouTube video links or video course suggestions for that sub-topic.

Organize the roadmap as follows:

# ${topic} Roadmap: 3-Month Mastery Plan

## Stage 1: Foundation Building (Weeks 1–4)
**Objective:** Establish core fundamentals

### Key Concepts:
- List 3–5 fundamental concepts
- Explain each in one sentence
- Provide a YouTube video or course link for each concept

### Tools & Technologies:
- List primary tools with short descriptions  
  Example: "VS Code – Industry-standard code editor"
- Provide video tutorials or walkthrough links for each tool

### Learning Resources:
- [Resource Name](URL) – Indicate if it's a video, course, or article and why it's useful

### Weekly Breakdown:
**Week 1: [Specific Focus Area]**
- Daily learning goals
- Practical exercises
- Video resources for the week
- Weekly milestone to be achieved

## Stage 2: Skill Deepening (Weeks 5–8)
**Objective:** Apply knowledge through hands-on practice
- Repeat the same structure with detailed learning goals, tools, resources, and videos

## Final Stage: Portfolio Development (Weeks 9–12)
**Objective:** Build real-world projects to showcase skills

### Project Examples:
1. Project Name – Short description of the project
   - Technologies used
   - Relevant video tutorials
   - Key skills and outcomes gained

## Continuous Learning Path
- Recommended certifications with links
- Advanced video tutorials
- Online communities to join (e.g., Discord, Reddit)
- Suggested blogs, newsletters, or GitHub repositories to follow

Use proper Markdown headings (##, ###). Include real-world examples and at least one video resource per major concept or tool.`

  : `Provide a structured overview to become a ${topic} with clearly divided sections. Each section should include at least one YouTube video or free online course.

# ${topic} Learning Path: Essential Steps

## Step 1: Core Fundamentals
- List 3–5 key concepts
- Provide a one-line explanation for each
- Add a YouTube video or course link for each concept

## Step 2: Essential Tools
- List main tools and their purpose  
  Example: "React – JavaScript library for building user interfaces"
- Include beginner tutorials or video walkthroughs

## Step 3: Learning Resources
- List video-based resources (e.g., freeCodeCamp, Coursera, YouTube)
- Mention whether each is free or paid

## Step 4: Practice Projects
- List 2–3 project ideas of increasing complexity
- Include a video tutorial for each project

## Step 5: Next Steps
- Suggest specialization paths or advanced topics
- Recommend online communities or open-source platforms
- Link to expert advice videos

Use standard Markdown (##, ###, -, 1.) for formatting. Ensure all links are real and provide practical value.`;



  try {
    const apiKey = process.env.REACT_APP_GEMINI_PUBLIC_API_KEY;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_PUBLIC_API_KEY}`;
    
    console.log("Calling Gemini API at:", API_URL);
    console.log("Prompt:", prompt);

    const res = await axios.post(
      API_URL,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      }
    );

    const responseText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("Empty response structure:", JSON.stringify(res.data, null, 2));
      throw new Error("Received empty content from Gemini API");
    }

    return responseText;
  } catch (error) {
    let errorDetails = "Unknown error";
    
    if (axios.isAxiosError(error)) {
      errorDetails = JSON.stringify({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      }, null, 2);
    } else {
      errorDetails = error.message;
    }

    console.error(`Roadmap generation failed for "${topic}":`, errorDetails);
    throw new Error(`Roadmap generation failed: ${errorDetails}`);
  }
};