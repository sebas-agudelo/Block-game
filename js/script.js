const gameContainer = document.getElementById('game-container');
const progressBar = document.getElementById('progress-done');
const blockPool = document.getElementById('block-pool');
const scoreSpan = document.getElementById('score');
const livesWrapper = document.getElementById('lives');

const restartBtn = document.getElementById('restart-btn');
const playBtn = document.getElementById('play-btn');

const gridSize = 10;
const blockSize = 32; 
let maxScore = false;
let score = 0;
let moves = 15;

const shapeImages  = {
    Z: "images/gottochblandat.png",
    T: "images/gottochblandat2.png",
    O: "images/kex.jpg",
    U: "images/gottochblandat4.png"
    // Lägg till fler bilder vid behov
};


const shapes = {
    Z: [[0, 0], [0, 1], [1, 1], [1, 2]], 
    T: [[0, 1], [1, 0], [1, 1], [1, 2]], 
    O: [[0, 0], [0, 1], [1, 0], [1, 1]], 
    U: [[0, 0]],
    // L: [[0, 0], [1, 0], [1, 1]], 
    // I: [[0, 0], [1, 0]], 
    // M: [[0, 0], [0, 1], [0, 2]],
    // N: [[0, 0], [0, 1]]
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
    const blockImage = shapeImages[shapeKey];

    // Debugging statements
    console.log('Generating block for shape:', shapeKey);
    console.log('Block Image:', blockImage); // Check if the image path is correct

    const blockContainer = document.createElement('div');
    blockContainer.classList.add('block-container');
    blockContainer.dataset.id = id;
    blockContainer.dataset.shape = shapeKey;
    blockContainer.draggable = true;

    blockContainer.addEventListener('dragstart', handleDragStart);
    blockContainer.addEventListener('dragend', handleDragEnd); 

    blockContainer.addEventListener('touchstart', handleTouchStart);
    blockContainer.addEventListener('touchmove', handleTouchMove);
    blockContainer.addEventListener('touchend', handleTouchEnd);

    shape.forEach(([row, col]) => {
        const block = document.createElement('div');
        block.classList.add('block');
        block.style.gridRowStart = row + 1;
        block.style.gridColumnStart = col + 1;

        // Check for valid image before assigning it
        if (blockImage) {
            block.style.backgroundImage = `url(${blockImage})`;
            block.style.backgroundSize = 'contain';
            block.style.backgroundRepeat = 'no-repeat';
            console.log(`Setting background image for block: ${blockImage}`); // Log the image being set
        } else {
            console.error(`Image not found for shape: ${shapeKey}`); // Error message
        }

        blockContainer.appendChild(block);
    });

    return blockContainer;
};




const getRandomShapeKey = () => {
    const shapeKeys = Object.keys(shapes);
    return shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
};

/* Skapar drag funktionalitet för webbläsaren */
const handleDragStart = (event) => {
    const blockContainer = event.target.closest('.block-container');
    blockContainer.style.opacity = '0.01';

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
    // const blockColor = event.dataTransfer.getData('block-color');
    const offsetX = parseInt(event.dataTransfer.getData('offset-x'));
    const offsetY = parseInt(event.dataTransfer.getData('offset-y'));
    const shape = shapes[blockShapeKey];
    
    const targetRow = parseInt(event.target.dataset.row);
    const targetCol = parseInt(event.target.dataset.col);
    
    const startRow = targetRow - offsetY;
    const startCol = targetCol - offsetX;

    let blockPlaced = false;

    if (canPlaceShape(startRow, startCol, shape)) {
        placeShape(startRow, startCol, shape, blockShapeKey);
        document.querySelector(`[data-id="${blockId}"]`).remove();
        blockPlaced = true
        createBlockPool();
    }

    if(!blockPlaced){
        alert('Placera blocken inuti ruterna')
        
    } else{
        pointsFuction();
        blockScore(blockShapeKey);
    }
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

const placeShape = (row, col, shape, shapeKey) => {
    const blockImage = shapeImages[shapeKey];  // Get the image for the current shape

    // Debugging
    console.log('Placing image for shape:', shapeKey, 'with URL:', blockImage); // Debugging

    shape.forEach(([r, c]) => {
        const targetRow = row + r;
        const targetCol = col + c;
        const slot = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

        // Check if the slot exists before setting the background image
        if (slot) {
            slot.classList.remove(...Array.from(slot.classList).filter(cls => cls !== 'block-slot'));
            slot.classList.remove('block-slot');
            slot.classList.add('block', shapeKey);

            // Set the background image for the slots
            if (blockImage) {
                slot.style.backgroundImage = `url(${blockImage})`;
                slot.style.backgroundSize = 'cover';
                slot.style.backgroundPosition = 'center';
            } else {
                console.error(`Image not found for shape: ${shapeKey}`); // Log an error if the image URL is undefined
            }
        }
    });

    checkCompletedRows();
    checkCompletedColumns();
};





let activeBlock = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

/* Skapar touch funktionalitet */
const handleTouchStart = (event) => {
    event.preventDefault();
    const touch = event.touches[0]; 
    const blockContainer = event.target.closest('.block-container'); 

    if (!blockContainer) return; 

    activeBlock = blockContainer; 

    const blockRect = blockContainer.getBoundingClientRect();
    touchOffsetX = Math.floor((touch.clientX - blockRect.left)); 
    touchOffsetY = Math.floor((touch.clientY - blockRect.top)); 

 
    const placeholder = document.createElement('div');
    placeholder.classList.add('block-container-placeholder');
    blockContainer.parentNode.insertBefore(placeholder, blockContainer);

    blockContainer.style.left = `${blockRect.left}px`;
    blockContainer.style.top = `${blockRect.top}px`;

    blockContainer.style.position = 'absolute';
    blockContainer.style.zIndex = '1000';
};

const handleTouchMove = (event) => {
    if (!activeBlock) return; // Om inget block är valt, returnera.

    const touch = event.touches[0];
    const gameRect = gameContainer.getBoundingClientRect();

    // Flytta blocket baserat på fingerposition
    activeBlock.style.left = `${touch.clientX - touchOffsetX}px`;
    activeBlock.style.top = `${touch.clientY - touchOffsetY}px`;
    
    // Se till att blocket hålls inom spelområdet
    if (touch.clientX - touchOffsetX < gameRect.left) {
        activeBlock.style.left = `${gameRect.left}px`;
    }
    if (touch.clientY - touchOffsetY < gameRect.top) {
        activeBlock.style.top = `${gameRect.top}px`;
    }
};

const handleTouchEnd = (event) => {
    if (!activeBlock) return;

    const touch = event.changedTouches[0];
    const gameRect = gameContainer.getBoundingClientRect();

    const dropX = touch.clientX - gameRect.left;
    const dropY = touch.clientY - gameRect.top;

    const targetCol = Math.floor(dropX / blockSize);
    const targetRow = Math.floor(dropY / blockSize);

    if (targetRow >= 0 && targetRow < gridSize && targetCol >= 0 && targetCol < gridSize) {
        const nearestSlot = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
        
        if (nearestSlot && nearestSlot.classList.contains('block-slot')) {
            const blockShapeKey = activeBlock.dataset.shape;
            // const blockColor = activeBlock.firstChild.classList[1];
            const offsetX = Math.floor(touchOffsetX / blockSize);
            const offsetY = Math.floor(touchOffsetY / blockSize);
            const shape = shapes[blockShapeKey];
            
            const startRow = targetRow - offsetY;
            const startCol = targetCol - offsetX;

            let blockPlaced = false;

            if (canPlaceShape(startRow, startCol, shape)) {
                placeShape(startRow, startCol, shape, blockShapeKey);
                blockPlaced = true
                activeBlock.remove();
                createBlockPool();
            }
            
    if(!blockPlaced){
        activeBlock.style.position = 'static';
        activeBlock.style.zIndex = '1';
        activeBlock = null;
        
    } else{
        pointsFuction();
        blockScore(blockShapeKey);
    }

        }
        
    } 
    // Remove placeholder
    const placeholder = document.querySelector('.block-container-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    // Reset block's position and z-index
    activeBlock.style.position = 'static';
    activeBlock.style.zIndex = '1';
    activeBlock = null;
};

    /* Skapar funktionalitet för poäng när man får en hel rad */
    const checkCompletedRows = () => {
        for (let row = 0; row < gridSize; row++) {
            let isRowComplete = true;
    
            // Kontrollera om hela raden är komplett
            for (let col = 0; col < gridSize; col++) {
                const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (!slot.classList.contains('block')) {
                    isRowComplete = false;
                    break;
                }
            }
    
            // Återställ blockslotarna om raden är komplett
            if (isRowComplete) {
                score += 10; 
                scoreSpan.innerText = score;
                progressBar.style.width = `${Math.min((score / 25) * 100, 100)}%`;
    
                for (let col = 0; col < gridSize; col++) {
                    const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    
                    // Ta bort alla klasser och inline-stilar
                    slot.className = ''; // Rensa alla klasser
                    slot.style.cssText = ''; // Ta bort alla inline-stilar
                    
                    // Lägg tillbaka block-slot klassen
                    slot.classList.add('block-slot'); // Återställ klassnamn till block-slot
                }
            }
        }
    };
    

/* Skapar funktionalitet för poäng när man får en hel kolum */
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
            progressBar.style.width = `${Math.min((score / 25) * 100, 100)}%`

            const allShapeColors = Object.values(shapeImages);
            
            allShapeColors.forEach((shapeColor) => {
                for (let row = 0; row < gridSize; row++) {
                    const slot = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    slot.classList.remove('block');
                    slot.classList.remove(shapeColor)
                    slot.classList.add('block-slot');
                }
            })
            
        }
        pointsFuction();
    }
};

const pointsFuction = () => {
   if(score >= 25 ){
        maxScore = true;
        blockPool.classList.add('block-pool-hidde')
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
    
    score = Math.min(score, 25)
    scoreSpan.innerHTML = score;
    progressBar.style.width = `${Math.min((score / 25) * 100, 100)}%`

    if(score >= 25 ){
        pointsFuction(); 
        
    }
};

createGrid();
createBlockPool();