let model; //to store model after upload
let loadingModelProcess; //the promise of loading , this for make one process to loading


console.log("the model file is here");






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

        await new Promise(resolve => requestAnimationFrame(resolve));
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






export async function initModel(convertedImage){

    //this will make a delay if the model is not uploaded before , while if it uploaded then no delay
    await loadModel();  

    const processedImg = preprocessTheImage(convertedImage);
    const result = model.predict(processedImg);
    console.log("the Result of model is : ", result);
    // const prob = await result.data();
    const maxPercentage = result.argMax(1);
    const classIndex = maxPercentage.dataSync()[0];


    //for confidence percentage
    const probabilities = await result.data();

    let confidence = probabilities[classIndex];
    confidence = (confidence * 100).toFixed(2);

    console.log("the confidence is : ", confidence);

    //dispose is for clear the memory from tensor 
    maxPercentage.dispose();
    result.dispose();
    processedImg.dispose();
    return {classIndex, confidence};

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


