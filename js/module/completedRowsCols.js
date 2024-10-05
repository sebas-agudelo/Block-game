import { gridSize } from "../script.js";

const scoreSpan = document.getElementById('score');

let score = 0;
export const checkCompletedRows = () => {
    for (let row = 0; row < gridSize; row++) {
        let isRowComplete = true;

        for (let col = 0; col < gridSize; col++) {
            const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!slot.classList.contains('block')) {
                isRowComplete = false;
                break;
            }
        }

        if (isRowComplete) {
            score += 10; 
            scoreSpan.innerText = score;

            for (let col = 0; col < gridSize; col++) {
                const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                slot.classList.remove('block');
                slot.classList.add('block-slot');
            }
            maxScore();
        }
    }
};

export const checkCompletedColumns = () => {
    for (let col = 0; col < gridSize; col++) {
        let isColComplete = true;

        for (let row = 0; row < gridSize; row++) {
            const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!slot.classList.contains('block')) {
                isColComplete = false;
                break;
            }
        }

        if (isColComplete) {
            score += 15; 
            scoreSpan.innerText = score;

            for (let row = 0; row < gridSize; row++) {
                const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                slot.classList.remove('block');
                slot.classList.add('block-slot');
            }
            maxScore();
        }
    }
};