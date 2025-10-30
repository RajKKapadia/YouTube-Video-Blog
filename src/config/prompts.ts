/**
 * AI Prompts Configuration
 * Centralized location for all AI prompts used in the application
 * Edit these prompts to customize the AI-generated content
 */

export const prompts = {
  /**
   * Main blog content generation prompt
   * Used to convert YouTube video transcripts into blog posts
   */
  blogGeneration: {
    system:
      "You are a professional content writer specializing in converting video content into engaging blog posts.",

    getUserPrompt: (
      transcript: string,
      videoTitle: string,
      channelName: string,
    ) =>
      `
Convert this YouTube video transcript into an engaging, well-structured blog post.

Video Title: ${videoTitle}
Channel: ${channelName}

Transcript:
${transcript}

Instructions:
1. Create an engaging, SEO-friendly title that captures the essence of the content

2. Write a comprehensive blog post with excellent structure and readability:
   - Start with a compelling introduction paragraph that hooks the reader and sets context
   - Use clear markdown headings to organize content:
     * ## for main sections
     * ### for subsections
     * #### for sub-subsections if needed
   - Write paragraphs that are 2-4 sentences each for better readability
   - Add blank lines between paragraphs for proper spacing
   - Use bullet points (- or *) for lists of items or key points
   - Use numbered lists (1., 2., 3.) for sequential steps or ranked items
   - Include relevant examples, explanations, or analogies to clarify concepts
   - End with a strong conclusion that summarizes key takeaways and provides value

3. Content guidelines:
   - Use a professional yet conversational and engaging tone
   - Make it scannable with clear sections and whitespace
   - Highlight important concepts with **bold text**
   - Keep sentences clear and concise
   - Ensure smooth transitions between sections
   - Make the content informative and valuable to readers

4. Formatting requirements:
   - Use proper markdown syntax
   - Add spacing between all major sections
   - Ensure headings are descriptive and informative
   - Format code snippets with \`inline code\` or \`\`\`code blocks\`\`\` if technical content
   - Use > for blockquotes when emphasizing important points

5. Create a detailed thumbnail prompt for DALL-E 3:
   - Describe the visual scene, main subject, and composition
   - Specify colors, style, and mood
   - Keep it under 1000 characters
   - Focus on visual elements (no text in the image)
   - Make it eye-catching and professional

Make the blog post informative, easy to read, well-structured, and valuable to readers.
`.trim(),

    schema: {
      title:
        "An engaging, SEO-friendly blog post title based on the video content",
      content:
        "A well-structured blog post with introduction, main points with headings, and conclusion. Use markdown formatting.",
      thumbnailPrompt:
        "A detailed, visual prompt for DALL-E 3 to generate a professional blog thumbnail. Describe the main subject, composition, colors, style, and mood. Keep it under 1000 characters. Focus on visual elements, not text.",
    },
  },

  /**
   * Summary generation prompt
   * Used to create concise summaries of blog content
   */
  summary: {
    getUserPrompt: (content: string) =>
      `
Summarize the following blog post in 2-3 sentences:

${content}
`.trim(),
  },

  /**
   * Title improvement prompt (optional, for future use)
   */
  titleImprovement: {
    getUserPrompt: (originalTitle: string) =>
      `
Improve this blog post title to make it more engaging and SEO-friendly:

Original Title: ${originalTitle}

Requirements:
- Keep it under 60 characters
- Make it click-worthy but not clickbait
- Include relevant keywords
- Clear and descriptive
`.trim(),
  },

  /**
   * Content enhancement prompt (optional, for future use)
   */
  contentEnhancement: {
    getUserPrompt: (content: string, focus: string) =>
      `
Enhance this blog post section focusing on: ${focus}

Content:
${content}

Make it more:
- Engaging and reader-friendly
- Informative with actionable insights
- Well-structured with clear headings
- Include examples or analogies where helpful
`.trim(),
  },
};

export default prompts;
