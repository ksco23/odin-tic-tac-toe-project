const domControl = (() => {

    let isBoardLocked = false;
    const gameContainer = document.querySelector('.gameContainer');

    document.getElementById('restart').addEventListener('click', function () {
        gameController.restartGame();
    });

    const boardContainer = document.querySelector('.boardContainer');
    boardContainer.addEventListener('click', function (e) {
        if (!isBoardLocked) {
            if (typeof e.target.dataset.boardIndex !== 'undefined') {
                gameController.playRound(e.target.dataset.boardIndex);
            }
        }
    });

    const update = (boardArr) => {
        //console.log(boardArr);

        boardArr.forEach(function (cell) {
            //console.log(cell.getCellData());
            const data = cell.getCellData();
            const cellDiv = document.querySelector(`[data-board-index="${data.cellIndex}"]`);
            if (data.playerNum === 1) {
                cellDiv.textContent = 'X';
                cellDiv.classList.toggle('full', true);
                cellDiv.dataset.player = '1';
            }
            else if (data.playerNum === 2) {
                cellDiv.textContent = 'O';
                cellDiv.classList.toggle('full', true);
                cellDiv.dataset.player = '2';
            }
            else {
                cellDiv.textContent = '';
                cellDiv.classList.toggle('full', false);
                cellDiv.dataset.player = '0';
            }
        });
    };

    const changePlayer = (curPlayer) => {
        document.querySelectorAll('.player').forEach((el, i) => {
            if (Number(el.dataset.playerNumber) === curPlayer) {
                el.classList.toggle('active', true);
            }
            else {
                el.classList.toggle('active', false);
            }
        });

    }

    const gameComplete = (winner, winningCellsArr) => {
        isBoardLocked = true;

        gameContainer.classList.toggle('complete', true);

        document.querySelectorAll('.player').forEach((el, i) => {
            el.classList.remove('active');
            if (winner === 0) {
                el.classList.add('tie');
                el.querySelector('.status').textContent = "TIE!";
            } else {
                if (Number(el.dataset.playerNumber) === winner) {
                    el.classList.add('winner');
                    el.querySelector('.status').textContent = "WINNER!";
                }
                else {
                    el.classList.add('loser');
                }
            }
        });

        winningCellsArr.forEach((cell, i) => {
            //const data = cell.getCellData();
            const cellDiv = document.querySelector(`[data-board-index="${cell.cellIndex}"]`);
            cellDiv.classList.add('winningCell');
        });
    }

    const gameRestart = () => {
        isBoardLocked = false;

        gameContainer.classList.toggle('complete', false);

        document.querySelectorAll('.player').forEach((el, i) => {
            el.classList.remove('winner', 'loser', 'tie');
        });

        document.querySelectorAll('.cell').forEach((el, i) => {
            el.classList.remove('winningCell');
        });
    }

    return { update, changePlayer, gameComplete, gameRestart }
})();

const gameboard = (() => {
    let board = [];
    const rows = 3;
    const cols = 3;

    // for (let i = 0; i < (rows * cols); i++) {
    //     board[i] = createCell(i);
    // }

    createBoard();

    const getBoard = () => board;

    const addMark = (player, cell) => {
        if (board[cell].getCellData().playerNum === 0) {
            board[cell].updateCellPlayer(player);
            return true;
        }
        else {
            //console.log('invalid cell');
            return false;
        }
    };

    // const logBoard = () => {
    //     let colCount = 0;
    //     let logAr = [];
    //     for (let i = 0; i < board.length; i++) {
    //         logAr.push(board[i].getCellData().playerNum);
    //         colCount++;
    //         if (colCount === cols) {
    //             console.log(logAr);
    //             colCount = 0;
    //             logAr = [];
    //         }
    //     }
    // };

    const clearBoard = () => {
        board = [];
        createBoard();
    };

    function createBoard() {
        for (let i = 0; i < (rows * cols); i++) {
            board[i] = createCell(i);
        }

        domControl.update(board);
    }

    function createCell(index) {
        const cellIndex = index;
        const rowNum = Math.trunc(index / cols);
        const colNum = index % cols;
        const diagonal1 = colNum === rowNum;
        const diagonal2 = colNum === (cols - 1) - rowNum;
        let playerNum = 0;

        const updateCellPlayer = (playerNumIn) => {
            playerNum = playerNumIn;
        };

        const getCellData = () => {
            return { cellIndex, rowNum, colNum, diagonal1, diagonal2, playerNum };
        };

        return { updateCellPlayer, getCellData };
    }

    return { getBoard, addMark, clearBoard }
})();

const gameController = (() => {
    //gameboard.logBoard();

    let curPlayer = 0;
    changeTurn();

    const playRound = (cell) => {
        if (gameboard.addMark(curPlayer, cell)) {

            changeTurn();
            checkResult();

            //gameboard.logBoard();
            domControl.update(gameboard.getBoard());
        }
    };

    const restartGame = () => {
        curPlayer = 0;
        changeTurn();
        gameboard.clearBoard();
        domControl.gameRestart();
    };

    //track who's turn it is
    function changeTurn() {
        curPlayer = curPlayer === 1 ? 2 : 1;
        domControl.changePlayer(curPlayer);
    }

    //check for a win or tie
    function checkResult() {
        const board = gameboard.getBoard();

        const rowsArr = [];
        const colsArr = [];
        const diagsArr = [];

        let winner = 0;
        let winningCellsArr = [];

        board.forEach(function (boardCell, i) {
            const cellData = boardCell.getCellData();
            //console.log(cellData);

            if (rowsArr.at(cellData.rowNum) !== undefined) {
                rowsArr[cellData.rowNum][cellData.colNum] = cellData/*.playerNum*/;
            }
            else {
                rowsArr[cellData.rowNum] = [cellData/*.playerNum*/];
            }

            if (colsArr.at(cellData.colNum) !== undefined) {
                colsArr[cellData.colNum][cellData.rowNum] = cellData/*.playerNum*/;
            }
            else {
                colsArr[cellData.colNum] = [cellData/*.playerNum*/];
            }

            if (cellData.diagonal1) {
                if (diagsArr.at(0) !== undefined) {
                    diagsArr[0].push(cellData/*.playerNum*/);
                }
                else {
                    diagsArr[0] = [cellData/*.playerNum*/];
                }
            }

            if (cellData.diagonal2) {
                if (diagsArr.at(1) !== undefined) {
                    diagsArr[1].push(cellData/*.playerNum*/);
                }
                else {
                    diagsArr[1] = [cellData/*.playerNum*/];
                }
            }
        });

        const rowData = checkArrayForWin(rowsArr);
        const rowStatus = rowData[0].playerNum;
        const colData = checkArrayForWin(colsArr);
        const colStatus = colData[0].playerNum;
        const diagData = checkArrayForWin(diagsArr);
        const diagStatus = diagData[0].playerNum;

        if (rowStatus === 1 || colStatus === 1 || diagStatus === 1) {
            //console.log('1 Won!');
            winner = 1;

            if (rowStatus === 1) {
                winningCellsArr = rowData;
            }
            else if (colStatus === 1) {
                winningCellsArr = colData;
            }
            else {
                winningCellsArr = diagData;
            }

            domControl.gameComplete(winner, winningCellsArr);
            //console.log(winningCellsArr);
        }
        else if (rowStatus === 2 || colStatus === 2 || diagStatus === 2) {
            //console.log('2 Won!');
            winner = 2;

            if (rowStatus === 2) {
                winningCellsArr = rowData;
            }
            else if (colStatus === 2) {
                winningCellsArr = colData;
            }
            else {
                winningCellsArr = diagData;
            }

            domControl.gameComplete(winner, winningCellsArr);
            //console.log(winningCellsArr);
        }
        else {
            if (rowStatus === -1) {
                //console.log('Tie, no winner');
                domControl.gameComplete(0, winningCellsArr);
            }
        }
    }

    function checkArrayForWin(ar) {
        //console.log(ar);
        let boardFull = true;
        for (let i = 0; i < ar.length; i++) {
            const innerAr = ar[i];
            //console.log(innerAr);
            let found0 = false;
            let found1 = false;
            let found2 = false;

            for (let j = 0; j < innerAr.length; j++) {
                if (innerAr[j].playerNum === 0) {
                    found0 = true;
                }
                if (innerAr[j].playerNum === 1) {
                    found1 = true;
                }
                if (innerAr[j].playerNum === 2) {
                    found2 = true;
                }
            }

            if (!found0) {
                if (found1 && !found2) {
                    return innerAr;
                }
                if (found2 && !found1) {
                    return innerAr;
                }
            }
            else {
                boardFull = false;
            }
        }

        return boardFull ? [{ playerNum: -1 }] : [{ playerNum: 0 }];
    }

    return { playRound, restartGame };
})();