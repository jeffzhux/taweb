module.exports = class QuestionAnswerModel {
  static pipe = null;
  static env = null;
  static question_prompts = [
    "Write a question about the following article",
    "Ask a question about this article",
    "Generate a question about the context",
    "What question would one ask from this paragraph?",
    "Do you have any questions?",
    "Can you generate a question with a factual answer?"
  ];
  static distractor_prompts = [
    'Create semantically similar incorrect answers.',
    'Make distractors roughly the same length and detail.',
    'Use common errors or misconceptions.',
    'Modify the correct answer.',
    'Use synonyms, antonyms, or related terms.',
    'Use partial or incomplete information.'
  ];
  static async _init(){
    if((this.pipe == null || this.env == null)){
      const {pipeline, env} = await import('@xenova/transformers');
      env.cacheDir = 'F:\\NLP\\taweb\\public\\.cache';
      this.env = env;
      // this.q_pipe = await pipeline('text2text-generation', 'open_question_generation_model');
      this.q_pipe = await pipeline('text2text-generation', 't5-large-question-generator');
    }
    
  }
  static async open_question_generation(content) {
    const q_prom = this.question_prompts[Math.floor(Math.random()*this.question_prompts.length)];
    console.log('------------')
    const q_input = `${q_prom}\n${content}`;
    console.log(q_input);
    await this._init();
    
    let question_answer = await this.q_pipe(content);
    console.log(question_answer)
    // const qw = question_answer[0].split('?');
    // const question = qw[0].trim()
    // const answer = qw[1].trim()
    // const d_prom = this.distractor_prompts[Math.floor(Math.random()*this.distractor_prompts.length)];
    // const d_input = `${d_prom}\n\nQuestion:\n${question}\n\Answer:\n${answer}\n\\Article:\n${content}`;
    // let distractor = await this.q_pipe(d_input);
    // console.log(distractor);
    if (qw.length > 1){
      return {question: qw[0].trim() + '?', answer: qw[1].trim()};
    }
    else{
      return {question: '', answer: ''};
    }
    
  }
//   static async open_question_generation(content) {
//       await this._init();
//       let question_answer = await this.pipe(content);
//       const qw = question_answer[0].split('?');
//       console.log(question_answer);
//       if (qw.length > 1){
//         return {question: qw[0].trim() + '?', answer: qw[1].trim()};
//       }
//       else{
//         return {question: '', answer: ''};
//       }
//     }
}