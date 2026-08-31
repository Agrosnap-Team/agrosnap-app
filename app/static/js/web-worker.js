importScripts("/node_modules/@tensorflow/tfjs/dist/tf.js");


console.log("this is web worker");
console.log("TensorFlow version:", tf.version.tfjs);

let model = null;
let loadingModelProcess = null;


//recieving area from main thread
self.onmessage =async(event)=>{
    try{

        /*=====================================
           Upload model and warm up
        =======================================*/
           
        if(event.data.type == "loadModel"){
            await loadModel();

            //when model upload then send msg to main thread[scan] that model is ready
            self.postMessage({
                type: "modelReady"
            });
        }

        /*=====================================
           Predict 
        =======================================*/

        if(event.data.type == "predict"){
            let theImage = event.data.image;
            if(!theImage)return
            console.log("The bitmap image has been recieved successfully ", theImage);

            //will return a readable image which model can handle and read it
            let preparedImage = preprocessTheImage(theImage);

            console.log("The readable image is :" , preparedImage);

            const result = await analyzeTheImage(preparedImage);
            

            preparedImage.dispose();
            theImage.close();      
            
            self.postMessage({
                type:"result",
                diseaseInfo:result
            });

            
        }
    }
    catch(error){

        self.postMessage({
            type: "modelError",
            message: error.message
        });

    }

};

async function loadModel() {

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

function preprocessTheImage(image){

    return tf.tidy(() => {

        const readableImage = tf.browser.fromPixels(image)
        .resizeBilinear([260,260])
        //the image type that came from browser is int and we convert it to float32 because the weight, colors and operations in model are float
        .toFloat() 

        //if somehow the user selected group of images , just take the first selected image , index 0
        .expandDims(0);
        // console.log("the image became: " , readableImage);
        return readableImage;

    });

}

async function analyzeTheImage(convertedImage){

    //this will make a delay if the model is not uploaded before , while if it uploaded then no delay

    //predict by AI
    const result = model.predict(convertedImage);
    const maxPercentage = result.argMax(1); //Get the max number [higher probability]
    const disease_id = maxPercentage.dataSync()[0]; //Get the disease ID


    //for confidence percentage [all confidences for all diseases]
    const probabilities = await result.data();

    let confidence = probabilities[disease_id]; //get the higher confidence
    confidence = (confidence * 100).toFixed(2); // convert it to number of 100 [44%]

    console.log("the confidence is : ", confidence);

    

    //dispose is for clear the memory from tensor 
    maxPercentage.dispose();
    result.dispose();
    return {disease_id, confidence};

}

