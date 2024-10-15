const gameContainer = document.getElementById("game-container");
const progressBar = document.getElementById("progress-done");
const blockPool = document.getElementById("block-pool");
const scoreSpan = document.getElementById("score");
const movesWrapper = document.getElementById("moves");
const gameSelect = document.getElementById("game-select");

const gridSize = 10;
const blockSize = 33;
let gameMode = "moves";
let score = 0;
let gameover = 20;
let moves = gameover;

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("keydown", function (event) {
    // Check for Ctrl + '+' or Ctrl + '-' or Ctrl + '='
    if (
      event.ctrlKey &&
      (event.key === "+" || event.key === "-" || event.key === "=")
    ) {
      event.preventDefault();
    }
  });

  const shapeImages = {
    Z: "images/Haribo-Rainbow.png",
    T: "images/Haribo-Nappar.png",
    O: "images/Haribo-Stjärn-Mix.png",
    U: "images/Haribo-Fruktilurer.png",
    L: "images/Haribo-Bönar.png",
    I: "images/Haribo-Stardust.png",
    M: "images/haribo-Psiche.png",
    N: "images/Haribo-Nappar-Lakrits.png",
  };

  const shapes = {
    Z: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    T: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    O: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    U: [[0, 0]],
    L: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    I: [
      [0, 0],
      [1, 0],
    ],
    M: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    N: [
      [0, 0],
      [0, 1],
    ],
  };

  const createGrid = () => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const blockSlot = document.createElement("div");
        blockSlot.classList.add("block-slot");
        blockSlot.dataset.row = row;
        blockSlot.dataset.col = col;
        blockSlot.addEventListener("dragover", handleDragOver);
        blockSlot.addEventListener("drop", handleDrop);
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

    const blockContainer = document.createElement("div");
    blockContainer.classList.add("block-container");
    blockContainer.dataset.id = id;
    blockContainer.dataset.shape = shapeKey;
    blockContainer.draggable = true;

    blockContainer.addEventListener("dragstart", handleDragStart);
    blockContainer.addEventListener("dragend", handleDragEnd);

    blockContainer.addEventListener("touchstart", handleTouchStart);
    blockContainer.addEventListener("touchmove", handleTouchMove);
    blockContainer.addEventListener("touchend", handleTouchEnd);

    shape.forEach(([row, col]) => {
      const block = document.createElement("div");
      block.classList.add("block", "flip-in-hor-bottom");
      block.style.gridRowStart = row + 1;
      block.style.gridColumnStart = col + 1;

      if (blockImage) {
        block.style.backgroundImage = `url(${blockImage})`;
        block.style.backgroundSize = "cover";
        block.style.backgroundRepeat = "round";
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
    const blockContainer = event.target.closest(".block-container");

    blockContainer.style.opacity = "0.01";

    const blockId = blockContainer.dataset.id;
    const blockShape = blockContainer.dataset.shape;

    const blockRect = blockContainer.getBoundingClientRect();
    const offsetX = Math.floor((event.clientX - blockRect.left) / blockSize);
    const offsetY = Math.floor((event.clientY - blockRect.top) / blockSize);

    event.dataTransfer.setData("block-id", blockId);
    event.dataTransfer.setData("block-shape", blockShape);
    event.dataTransfer.setData("offset-x", offsetX);
    event.dataTransfer.setData("offset-y", offsetY);
  };

  const handleDragEnd = (event) => {
    const blockContainer = event.target.closest(".block-container");
    blockContainer.style.opacity = "1";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const blockId = event.dataTransfer.getData("block-id");
    const blockShapeKey = event.dataTransfer.getData("block-shape");

    const offsetX = parseInt(event.dataTransfer.getData("offset-x"));
    const offsetY = parseInt(event.dataTransfer.getData("offset-y"));
    const shape = shapes[blockShapeKey];

    const targetRow = parseInt(event.target.dataset.row);
    const targetCol = parseInt(event.target.dataset.col);

    const startRow = targetRow - offsetY;
    const startCol = targetCol - offsetX;

    let blockPlaced = false;

    if (canPlaceShape(startRow, startCol, shape)) {
      placeShape(startRow, startCol, shape, blockShapeKey);

      // Hitta det placerade blocket och ersätt det med ett nytt
      const placedBlock = document.querySelector(`[data-id="${blockId}"]`);
      if (placedBlock) {
        const newBlock = generateBlock(blockId);
        placedBlock.replaceWith(newBlock);
      }
      blockPlaced = true;
    }

    if (blockPlaced) {
      if (gameMode === "points" || gameMode === "moves") {
        gameOverFunction();
        blockScore(blockShapeKey);
      }
    } else {
      return;
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const canPlaceShape = (row, col, shape) => {
    return shape.every(([r, c]) => {
      const targetRow = row + r;
      const targetCol = col + c;
      const slot = document.querySelector(
        `[data-row="${targetRow}"][data-col="${targetCol}"]`
      );
      return slot && !slot.classList.contains("block");
    });
  };

  const placeShape = (row, col, shape, shapeKey) => {
    const blockImage = shapeImages[shapeKey]; // Get the image for the current shape

    shape.forEach(([r, c]) => {
      const targetRow = row + r;
      const targetCol = col + c;
      const slot = document.querySelector(
        `[data-row="${targetRow}"][data-col="${targetCol}"]`
      );

      if (slot) {
        slot.classList.remove(
          ...Array.from(slot.classList).filter((cls) => cls !== "block-slot")
        );
        slot.classList.remove("block-slot");
        slot.classList.add("block", shapeKey);

        if (blockImage) {
          slot.style.backgroundImage = `url(${blockImage})`;
          slot.style.backgroundSize = "cover";
          slot.style.backgroundPosition = "center";
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
    const blockContainer = event.target.closest(".block-container");

    if (!blockContainer) return;

    activeBlock = blockContainer;

    const blockRect = blockContainer.getBoundingClientRect();
    touchOffsetX = Math.floor(touch.clientX - blockRect.left);
    touchOffsetY = Math.floor(touch.clientY - blockRect.top);

    const placeholder = document.createElement("div");
    placeholder.classList.add("block-container-placeholder");
    blockContainer.parentNode.insertBefore(placeholder, blockContainer);

    blockContainer.style.left = `${blockRect.left}px`;
    blockContainer.style.top = `${blockRect.top}px`;

    blockContainer.style.position = "absolute";
    blockContainer.style.zIndex = "1000";
  };

  const handleTouchMove = (event) => {
    if (!activeBlock) return;

    const touch = event.touches[0];
    const gameRect = gameContainer.getBoundingClientRect();

    activeBlock.style.left = `${touch.clientX - touchOffsetX}px`;
    activeBlock.style.top = `${touch.clientY - touchOffsetY}px`;

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

    if (
      targetRow >= 0 &&
      targetRow < gridSize &&
      targetCol >= 0 &&
      targetCol < gridSize
    ) {
      const nearestSlot = document.querySelector(
        `[data-row="${targetRow}"][data-col="${targetCol}"]`
      );

      if (nearestSlot && nearestSlot.classList.contains("block-slot")) {
        const blockShapeKey = activeBlock.dataset.shape;
        const offsetX = Math.floor(touchOffsetX / blockSize);
        const offsetY = Math.floor(touchOffsetY / blockSize);
        const shape = shapes[blockShapeKey];

        const startRow = targetRow - offsetY;
        const startCol = targetCol - offsetX;

        let blockPlaced = false;

        if (canPlaceShape(startRow, startCol, shape)) {
          placeShape(startRow, startCol, shape, blockShapeKey);

          const newBlock = generateBlock(blockShapeKey);
          activeBlock.replaceWith(newBlock);
          activeBlock.remove();
          blockPlaced = true;
        }

        if (blockPlaced) {
          if (gameMode === "points" || gameMode === "moves") {
            gameOverFunction();
            blockScore(blockShapeKey);
          }
        } else {
          activeBlock.style.position = "static";
          activeBlock = null;
        }
      }
    }

    const placeholder = document.querySelector(".block-container-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    if (activeBlock) {
      activeBlock.style.position = "static";
      activeBlock.style.zIndex = "1";
      activeBlock = null;
    }
  };

  /* Skapar funktionalitet för poäng när man får en hel rad */
  const checkCompletedRows = () => {
    for (let row = 0; row < gridSize; row++) {
      let isRowComplete = true;

      // Kontrollera om hela raden är komplett
      for (let col = 0; col < gridSize; col++) {
        const slot = document.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        );
        if (!slot.classList.contains("block")) {
          isRowComplete = false;
          break;
        }
      }

      if (isRowComplete) {
        score += 10;
        if (scoreSpan) {
          scoreSpan.innerText = score;
        } else if (progressBar) {
          progressBar.style.width = `${Math.min(
            (score / gameover) * 100,
            100
          )}%`;
        }

        for (let col = 0; col < gridSize; col++) {
          const slot = document.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
          );
          slot.classList.add("slide-out-bck-center");

          slot.addEventListener("animationend", () => {
            slot.className = "";
            slot.style.cssText = "";
            slot.classList.add("block-slot");
          });
        }
      }
    }
  };

  /* Skapar funktionalitet för poäng när man får en hel kolumner */
  const checkCompletedColumns = () => {
    for (let col = 0; col < gridSize; col++) {
      let isColComplete = true;

      for (let row = 0; row < gridSize; row++) {
        const slot = document.querySelector(
          `[data-row="${row}"][data-col="${col}"]`
        );
        if (!slot.classList.contains("block")) {
          isColComplete = false;
          break;
        }
      }

      if (isColComplete) {
        score += 10;
        if (scoreSpan) {
          scoreSpan.innerText = score;
        } else if (progressBar) {
          progressBar.style.width = `${Math.min(
            (score / gameover) * 100,
            100
          )}%`;
        }

        const allShapeColors = Object.values(shapeImages);

        allShapeColors.forEach((shapeColor) => {
          for (let row = 0; row < gridSize; row++) {
            const slot = document.querySelector(
              `[data-row="${row}"][data-col="${col}"]`
            );

            slot.classList.add("slide-out-bck-center");

            slot.addEventListener("animationend", () => {
              slot.className = "";
              slot.style.cssText = "";
              slot.classList.add("block-slot");
            });
          }
        });
      }
    }
  };

  const blockScore = (blockShapeKey) => {
    if (
      blockShapeKey === "Z" ||
      blockShapeKey === "T" ||
      blockShapeKey === "O"
    ) {
      score += 4;
    } else if (blockShapeKey === "L" || blockShapeKey === "M") {
      score += 3;
    } else if (blockShapeKey === "N" || blockShapeKey === "I") {
      score += 2;
    } else if (blockShapeKey === "U") {
      score += 1;
    }
    if (gameMode === "points") {
      score = Math.min(score, gameover);

      if (scoreSpan) {
        scoreSpan.innerHTML = score;
      }
      if (progressBar) {
        progressBar.style.width = `${Math.min((score / gameover) * 100, 100)}%`;
      }

      gameOverFunction();
    } else if (gameMode === "moves") {
      if (scoreSpan) {
        scoreSpan.innerHTML = score;
      }
    }
  };

  const gameOverFunction = () => {
    if (gameMode === "points" && score >= gameover) {
      showModal();

    } else if (gameMode === "moves") {
      gameover--;

      if (movesWrapper) {
        movesWrapper.innerText = `${gameover}`;
      }
      if (progressBar) {
        progressBar.style.width = `${Math.max((gameover / moves) * 100, 0)}%`;
      }

      if (gameover <= 0) {
        blockPool.classList.add("block-pool-hidde");
        showModal();
      }
    }
  };

  const showModal = () => {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");
  };

  const closeButton = document.querySelector(".close-button");
  closeButton.addEventListener("click", () => {
    location.reload();
  });

  createBlockPool();
  createGrid();
});
