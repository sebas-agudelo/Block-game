const gameContainer = document.getElementById('game-container');
const blockPool = document.getElementById('block-pool');
const scoreSpan = document.getElementById('score');
const livesWrapper = document.getElementById('lives');

const restartBtn = document.getElementById('restart-btn');
const playBtn = document.getElementById('play-btn');
const gridSize = 10;
const blockSize = 32; 
let score = 0;
let lifes = 15;

const shapeColors = {
    Z: 'e000ff',
    T: 'blue', 
    O: 'green',
    U: 'ff7000',
    L: 'yellow',
    I: 'black',
    M: 'white',
    N: 'nnn'
};

const shapes = {
    Z: [[0, 0], [0, 1], [1, 1], [1, 2]], 
    T: [[0, 1], [1, 0], [1, 1], [1, 2]], 
    O: [[0, 0], [0, 1], [1, 0], [1, 1]], 
    U: [[0, 0]],
    L: [[0, 0], [1, 0], [1, 1]], 
    I: [[0, 0], [1, 0]], 
    M: [[0, 0], [0, 1], [0, 2]],
    N: [[0, 0], [0, 1]]
};

const createGrid = () => {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const blockSlot = document.createElement('div');
            blockSlot.classList.add('block-slot');
            blockSlot.dataset.row = row;
            blockSlot.dataset.col = col;
            blockSlot.addEventListener('dragover', handleDragOver);
            blockSlot.addEventListener('drop', handleDrop);
            gameContainer.appendChild(blockSlot);
        }
    }
};

const createBlockPool = () => {
    blockPool.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        const newBlock = generateBlock(i); 
        blockPool.appendChild(newBlock); 
    } 
};

const generateBlock = (id) => {
    const shapeKey = getRandomShapeKey();
    const shape = shapes[shapeKey];

    const blockColor = shapeColors[shapeKey];

    const blockContainer = document.createElement('div');
    blockContainer.classList.add('block-container');
    blockContainer.dataset.id = id;
    blockContainer.dataset.shape = shapeKey;
    blockContainer.draggable = true;
    blockContainer.addEventListener('dragstart', handleDragStart);
    blockContainer.addEventListener('dragend', handleDragEnd); 

    shape.forEach(([row, col]) => {
        const block = document.createElement('div');
        block.classList.add('block', blockColor);
        block.style.gridRowStart = row + 1;
        block.style.gridColumnStart = col + 1;
        blockContainer.appendChild(block);
    });

    return blockContainer;
};

const getRandomShapeKey = () => {
    const shapeKeys = Object.keys(shapes);
    return shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
};

const handleDragStart = (event) => {
    const blockContainer = event.target.closest('.block-container');
    blockContainer.style.opacity = '0.5';

    const blockId = blockContainer.dataset.id;
    const blockShape = blockContainer.dataset.shape;
    const blockColor = blockContainer.firstChild.classList[1];

    const blockRect = blockContainer.getBoundingClientRect();
    const offsetX = Math.floor((event.clientX - blockRect.left) / blockSize);
    const offsetY = Math.floor((event.clientY - blockRect.top) / blockSize);

    event.dataTransfer.setData('block-id', blockId);
    event.dataTransfer.setData('block-shape', blockShape);
    event.dataTransfer.setData('block-color', blockColor);
    event.dataTransfer.setData('offset-x', offsetX);
    event.dataTransfer.setData('offset-y', offsetY);
};

const handleDragEnd = (event) => {
    const blockContainer = event.target.closest('.block-container');
    blockContainer.style.opacity = '1';
};

const handleDrop = (event) => {
    event.preventDefault();
    
    const blockId = event.dataTransfer.getData('block-id');
    const blockShapeKey = event.dataTransfer.getData('block-shape');
    const blockColor = event.dataTransfer.getData('block-color');
    const offsetX = parseInt(event.dataTransfer.getData('offset-x'));
    const offsetY = parseInt(event.dataTransfer.getData('offset-y'));
    const shape = shapes[blockShapeKey];
    
    const targetRow = parseInt(event.target.dataset.row);
    const targetCol = parseInt(event.target.dataset.col);
    
    const startRow = targetRow - offsetY;
    const startCol = targetCol - offsetX;

    if (canPlaceShape(startRow, startCol, shape)) {
        placeShape(startRow, startCol, shape, blockColor);
        document.querySelector(`[data-id="${blockId}"]`).remove();
        createBlockPool();
    }

    lifesScore();
    blockScore(blockShapeKey);
};

const handleDragOver = (event) => {
    event.preventDefault(); 
};

const canPlaceShape = (row, col, shape) => {
    return shape.every(([r, c]) => {
        const targetRow = row + r;
        const targetCol = col + c;
        const slot = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
        return slot && !slot.classList.contains('block');
    });
};

const placeShape = (row, col, shape, color) => {
    shape.forEach(([r, c]) => {
        const targetRow = row + r;
        const targetCol = col + c;
        const slot = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

        slot.classList.remove(...Array.from(slot.classList).filter(cls => cls !== 'block-slot'));
        slot.classList.remove('block-slot');
        slot.classList.add('block', color); 
    });

    checkCompletedRows();
    checkCompletedColumns();
};

const checkCompletedRows = () => {
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
            // maxScore();
            lifesScore()
    
        }
    }
};

const checkCompletedColumns = () => {
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
            score += 10; 
            scoreSpan.innerText = score;

            for (let row = 0; row < gridSize; row++) {
                const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                slot.classList.remove('block');
                slot.classList.add('block-slot');
            }

            lifesScore()
  
        }
    }
};

createGrid();

const maxLifes = () => {
    let oneLifeGone = true;

    if(oneLifeGone){

        lifes --; 
        livesWrapper.innerText = lifes;
    }

    if(lifes <= 0){
        alert('DU HAR FÖRLORAT');
        location.reload();
    }
}
const lifesScore = () => {

   if(score >= 45 ){
        alert('GRATTIS DU HAR VUNNIT ')
   
        location.reload();
    } else{
        maxLifes();
    }
};

const blockScore = (blockShapeKey) => {
    
    if (blockShapeKey === 'Z' || 
        blockShapeKey === 'T' || 
        blockShapeKey === 'O') {
        score +=4;
    
    } else if(blockShapeKey === 'L' || 
        blockShapeKey === 'M'){
            score +=3

    } else if(blockShapeKey === 'N' || 
        blockShapeKey === 'I'){
            score +=2

    } else if(blockShapeKey === 'U'){
            score +=1

    }

    scoreSpan.innerHTML = score;

    if(score >= 45 ){
        lifesScore(); 
        
    }
};


playBtn.addEventListener('click', () => {
    playBtn.style.display = 'none'
    restartBtn.style.display = 'block'
    createBlockPool();
});

restartBtn.addEventListener('click', () => {
    location.reload();
    playBtn.style.display = 'block'
    pauseBtn.style.display = 'none';
})




