/**
 * Question Loader for Voice Analysis
 * Loads and parses questions from questions.md file
 */

class QuestionLoader {
  constructor() {
    this.questions = [];
    this.loaded = false;
  }

  /**
   * Load questions from the Markdown file
   */
  async loadQuestions() {
    try {
      console.log("📚 Loading questions from questions.md...");
      
      const response = await fetch('/questions.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const markdownText = await response.text();
      this.parseMarkdown(markdownText);
      this.loaded = true;
      
      console.log("✅ Questions loaded successfully");
      console.log(`📝 Total questions: ${this.questions.length}`);
      
      return this.questions;
    } catch (error) {
      console.error("❌ Error loading questions:", error);
      this.loadFallbackQuestions();
      return this.questions;
    }
  }

  /**
   * Parse the simple Markdown content - just one question per line
   */
  parseMarkdown(markdownText) {
    const lines = markdownText.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Add the line as a question
      this.questions.push(line);
    }
    
    console.log(`📚 Parsed ${this.questions.length} questions`);
  }

  /**
   * Load fallback questions if file loading fails
   */
  loadFallbackQuestions() {
    console.log("🔄 Loading fallback questions...");
    
    this.questions = [
      "How are you feeling today?",
      "What's your energy level like right now?",
      "Describe your current emotional state.",
      "Tell me about something you accomplished today.",
      "What's the most interesting thing that happened to you today?",
      "What are you looking forward to doing today?",
      "How would you describe yourself today in three words?",
      "What's something you're grateful for today?",
      "Tell me about a goal you're working towards."
    ];
    
    this.loaded = true;
  }

  /**
   * Get a random question
   */
  getRandomQuestion() {
    if (!this.loaded) {
      console.warn("⚠️ Questions not loaded yet. Loading fallback...");
      this.loadFallbackQuestions();
    }

    if (this.questions.length === 0) {
      console.warn("⚠️ No questions available");
      return "Tell me about yourself today."; // Ultimate fallback
    }

    const selectedQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
    
    console.log(`🎯 Selected question: ${selectedQuestion}`);
    
    return selectedQuestion;
  }

  /**
   * Get all questions
   */
  getAllQuestions() {
    return this.questions;
  }

  /**
   * Get total number of questions
   */
  getTotalQuestionCount() {
    return this.questions.length;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionLoader;
} else {
  window.QuestionLoader = QuestionLoader;
}