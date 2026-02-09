
// import { supabase } from '../config/supabase.js';
import { GoogleGenAI } from '@google/genai';
import mongoose from "mongoose";
import Analysis from "../model/Analysis.js";


const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Generate problem name from code
const generateProblemName = async (code, language) => {
  try {
    const prompt = `Analyze this ${language} code and generate a concise, descriptive problem name (3-6 words maximum). 
    
The problem name should describe what the code does, like a coding problem title.

Examples:
- "Two Sum Problem"
- "Binary Search Implementation"
- "Fibonacci Sequence Generator"
- "Reverse Linked List"

Code:
\`\`\`${language}
${code.substring(0, 500)}
\`\`\`

Return ONLY the problem name, nothing else.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 50
      }
    });

    return response.text.trim().replace(/['"]/g, '');
  } catch (error) {
    console.error('Problem name generation error:', error);
    return 'Code Analysis';
  }
};

export const analyzeCode = async (req, res) => {
  try {
    const { code, language, analysisType } = req.body;
    // const userId = req.user.id;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    let prompt = '';

    switch (analysisType) {
      case 'syntaxErrors':
        prompt = `Analyze this ${language} code for syntax errors, bugs, and potential issues.

Provide analysis in this format:

**Syntax Errors**: [List any syntax errors found, or "None detected ✓"]

**Potential Bugs**: [Identify logical errors or edge cases, or "None found ✓"]

**Warnings**: [Note any bad practices or potential issues, or "Code looks good ✓"]

Be specific and helpful. If the code is perfect, say so.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;

      case 'timeComplexity':
        prompt = `Analyze the time complexity of this ${language} code. Provide ONLY:

**Time Complexity**: [State the Big O notation (e.g., O(n), O(log n), O(n²))]

**Reasoning**: [Brief 2-3 sentence explanation of why this is the complexity]

Be concise and direct. No introductions or conclusions.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;

      case 'spaceComplexity':
        prompt = `Analyze the space complexity of this ${language} code. Provide ONLY:

**Space Complexity**: [State the Big O notation (e.g., O(1), O(n), O(n²))]

**Reasoning**: [Brief 2-3 sentence explanation covering auxiliary space and input space]

Be concise and direct. No introductions or conclusions.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;

      case 'understanding':
        prompt = `Explain this ${language} code clearly and concisely.

Provide:

**Overview**: [What the code does in 1-2 sentences]

**Logic**: [Step-by-step explanation of key parts]

**Output**: [What the code returns/produces]

Be direct and focused. No unnecessary details.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;

      case 'improvements':
        prompt = `Suggest improvements for this ${language} code.

Provide:

**Performance**: [Optimization opportunities]

**Readability**: [Code clarity improvements]

**Best Practices**: [Modern ${language} patterns to use]

List 3-5 specific, actionable improvements. Be concise.

Code:
\`\`\`${language}
${code}
\`\`\``;
        break;

      default:
        return res.status(400).json({ error: 'Invalid analysis type' });
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });

    const result = response.text;

    res.json({
      analysisType,
      result,
      model: 'gemini-2.5-flash'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Code analysis failed',
      details: error.message
    });
  }
};

export const analyzeAllAtOnce = async (req, res) => {
  try {
    const { code, language } = req.body;
    const userId = req.user.id;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Generate problem name first
    const problemName = await generateProblemName(code, language);

    // Comprehensive analysis
    const prompt = `Analyze this ${language} code comprehensively but concisely.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide analysis in this exact format:

## SYNTAX ERRORS
**Syntax Errors**: [List any syntax errors, or "None detected ✓"]
**Potential Bugs**: [Identify logical errors, or "None found ✓"]
**Warnings**: [Note bad practices, or "Code looks good ✓"]

## TIME COMPLEXITY
**Complexity**: [Big O notation]
**Reasoning**: [2-3 sentences explaining why]

## SPACE COMPLEXITY
**Complexity**: [Big O notation]
**Reasoning**: [2-3 sentences covering auxiliary and input space]

## EXPLANATION
**Overview**: [What the code does in 1-2 sentences]
**Logic**: [Step-by-step breakdown of key parts]
**Output**: [What it returns]

## IMPROVEMENTS
1. **Performance**: [Specific optimization]
2. **Readability**: [Code clarity improvement]
3. **Best Practices**: [Modern pattern to use]

Be direct and focused. No introductions, conclusions, or fluff.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    });

    const fullResult = response.text;

    // Parse sections
    const syntaxMatch = fullResult.match(/##\s*SYNTAX\s*ERRORS\s*([\s\S]*?)(?=##|$)/i);
    const timeMatch = fullResult.match(/##\s*TIME\s*COMPLEXITY\s*([\s\S]*?)(?=##|$)/i);
    const spaceMatch = fullResult.match(/##\s*SPACE\s*COMPLEXITY\s*([\s\S]*?)(?=##|$)/i);
    const explainMatch = fullResult.match(/##\s*EXPLANATION\s*([\s\S]*?)(?=##|$)/i);
    const improvementsMatch = fullResult.match(/##\s*IMPROVEMENTS\s*([\s\S]*?)(?=##|$)/i);

    const results = {
      problemName,
      syntaxErrors: syntaxMatch ? syntaxMatch[1].trim() : '',
      timeComplexity: timeMatch ? timeMatch[1].trim() : '',
      spaceComplexity: spaceMatch ? spaceMatch[1].trim() : '',
      explanation: explainMatch ? explainMatch[1].trim() : '',
      improvements: improvementsMatch ? improvementsMatch[1].trim() : ''
    };

    // Save to database with syntax_errors column
    // await connectDB();

    const saved = await Analysis.create({
      userId,
      problemName,
      code: code.substring(0, 5000),
      language,
      syntaxErrors: results.syntaxErrors,
      timeComplexity: results.timeComplexity,
      spaceComplexity: results.spaceComplexity,
      explanation: results.explanation,
      improvements: results.improvements,
    });

    // if (error) {
    //   console.error('Database insert error:', error);
    // }

    res.json({
      results,
      savedId: saved._id,
      model: "gemini-2.5-flash",
    });

  } catch (error) {
    console.error('Analyze all error:', error);
    res.status(500).json({
      error: 'Code analysis failed',
      details: error.message
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // await connectDB();

    const history = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};


export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // await connectDB();
    
    const deleted = await Analysis.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Analysis deleted successfully" });


    // if (error) {
    //   return res.status(400).json({ error: error.message });
    // }

    // res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
};

export const getAnalysisStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // await connectDB();

    const total = await Analysis.countDocuments({ userId });
    const last = await Analysis.findOne({ userId }).sort({ createdAt: -1 });

    res.json({
      stats: {
        total,
        lastAnalysis: last?.createdAt || null,
      },
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
