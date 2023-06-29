module.exports = class dollyModel {
    static task = 'text-generation';
    static model = '../public/experiment_onnx';
    
    static async open_question_generation(content) {
      const { pipeline, env } = await import('@xenova/transformers');
      env.cacheDir = 'F:\\NLP\\taweb\\public\\.cache'
      let pipe = await pipeline('text2text-generation', 'open_question_generation_model')
      let question_answer = await pipe(content);
      const qw = question_answer[0].split('?');
      console.log(qw);
      console.log(qw[0]);
      console.log(qw[1]);
      if (qw.length > 1){
        return {question: qw[0].trim() + '?', answer: qw[1].trim()};
      }
      else{
        return {question: '', answer: ''};
      }
    }
  }