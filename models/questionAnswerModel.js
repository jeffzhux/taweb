module.exports = class QuestionAnswerModel {
  static pipe = null;
  static env = null;

  static async _init(){
    if(this.pipe == null || this.env == null){
      const {pipeline, env} = await import('@xenova/transformers');
      env.cacheDir = 'F:\\NLP\\taweb\\public\\.cache';
      this.env = env;
      this.pipe = await pipeline('text2text-generation', 'open_question_generation_model');
    }
    
  }
  static async open_question_generation(content) {
      await this._init();
      let question_answer = await this.pipe(content);
      const qw = question_answer[0].split('?');
      console.log(question_answer);
      if (qw.length > 1){
        return {question: qw[0].trim() + '?', answer: qw[1].trim()};
      }
      else{
        return {question: '', answer: ''};
      }
    }
  }