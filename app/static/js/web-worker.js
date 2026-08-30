importScripts("/node_modules/@tensorflow/tfjs/dist/tf.js");


console.log("this is web worker");
console.log("TensorFlow version:", tf.version.tfjs);

let model = null;
let loadingModelProcess = null;




export async function loadModel() {

    try{
        
        console.log("loadModel called");

        // if model is exist , just return the model
        if(model) 
        {
            return model;
        }

        // if this variable is none then no model has been uploaded yet , so upload it
        if (!loadingModelProcess) { 
            loadingModelProcess =  tf.loadGraphModel("/static/models/web_model/model.json");
        }

        //this will let the model load once and wait until it loaded successfully
        model = await loadingModelProcess; 
        console.log("The model has been loaded successfully !");

        
        //warmup 
        tf.tidy(() => {
        const dummy = tf.zeros([1, 260, 260, 3]);
        const output = model.predict(dummy);

        
        if (Array.isArray(output)) {
            output.forEach(t => t.dispose());
        } else {
            output.dispose();
        }
        });

        console.log("Model warm-up finished!");


        return model;
}
catch(error){
    loadingModelProcess=null;
}

}

self.onmessage =async(event)=>{
    try{
        if(event.data.type == "loadModel"){
            await loadModel();

            //when model upload then send msg to main thread[scan] that model is ready
            self.postMessage({
                type: "modelReady"
            });
        }

        if(event.data.type == "predict"){
            

        }
    }
    catch(error){

        self.postMessage({
            type: "modelError",
            message: error.message
        });

    }

};