import {showScanButton} from "./dynamic_pages.js";

export async function slideAnimation(){

        showScanButton();
        // Find all question containers inside your hints wrapper
        const questions = document.querySelectorAll('.hints-container .question-container');

        questions.forEach(question => {
            question.addEventListener('click', () => {
                // Find the parent .qa-container and toggle the 'active' class
                const qaBlock = question.parentElement;
                qaBlock.classList.toggle('active');
            });
        });

}




