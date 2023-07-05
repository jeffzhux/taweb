module.exports = class CorrectionsModel {
    static env = null;
    static pipe = null;
    static is_initializing = false;

    static async _init(){
        if((this.env == null || this.pipe == null) && this.is_initializing == false)
        {
            this.is_initializing = true;
            const {pipeline, env} = await import('@xenova/transformers');
            env.cacheDir = 'F:\\NLP\\taweb\\public\\.cache';
            this.env = env;
            this.pipe = await pipeline('text2text-generation', 'correction_model');
            this.is_initializing = false;
        }
    }
    static async garmmar_correction(text){
        await this._init();
        if(this.is_initializing == false){
            let correct_text = await this.pipe(text);
            return {text: correct_text[0]};
        }
        return {text:""};
    }
}