

console.log("the model file is here");
async function predictModel() {

    // load the model , and it converted from layerModel to graphModel because we used --input_format=tf_saved_model instead of --input_format=keras
    // const model = await tf.loadGraphModel(
    //     "/static/models/web_model/model.json"
    // );
    console.log(Object.keys(tf));
    console.log(tf);
    console.log(tf.loadGraphModel);
    // console.log(model);
    console.log("model loaded successfully");
        
}


export function initModel(){
    predictModel();

}


