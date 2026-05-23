const gameboard = (() => {
    const board = [];
    const rows = 3;
    const cols = 3;

    for (let i = 0; i < (rows * cols); i++) {
        board[i] = createCell(i);
    }

    const getBoard = () => board;

    const addMark = (player, cell) => {
        if (board[cell].getCellData().playerNum === 0) {
            board[cell].updateCellPlayer(player);
            return true;
        }
        else {
            console.log('invalid cell');
            return false;
        }
    };

    const logBoard = () => {
        let colCount = 0;
        let logAr = [];
        for (let i = 0; i < board.length; i++) {
            logAr.push(board[i].getCellData().playerNum);
            colCount++;
            if (colCount === cols) {
                console.log(logAr);
                colCount = 0;
                logAr = [];
            }
        }
    }

    function createCell(index) {
        const rowNum = Math.trunc(index / cols);
        const colNum = index % cols;
        const diagonal1 = colNum === rowNum;
        const diagonal2 = colNum === (cols - 1) - rowNum;
        let playerNum = 0;

        const updateCellPlayer = (playerNumIn) => {
            playerNum = playerNumIn;
        };

        const getCellData = () => {
            return { rowNum, colNum, diagonal1, diagonal2, playerNum };
        };

        return { updateCellPlayer, getCellData };
    }

    return { getBoard, addMark, logBoard }
})();

const gameController = (() => {
    gameboard.logBoard();

    let curPlayer = 1;

    const playRound = (cell) => {
        if (gameboard.addMark(curPlayer, cell)) {

            checkResult();
            changeTurn();
            gameboard.logBoard();
        }

    };

    //track who's turn it is
    function changeTurn() {
        curPlayer = curPlayer === 1 ? 2 : 1;
    }

    //check for a win or tie
    function checkResult() {
        const board = gameboard.getBoard();

        const rowsArr = [];
        const colsArr = [];
        const diagsArr = [];

        //let isBoardFull = true;
        let winner = 0;
        let winningCellsArr = [];

        board.forEach(function (boardCell, i) {
            const cellData = boardCell.getCellData();
            //console.log(cellData);
            /*if (isBoardFull && cellData.playerNum === 0) {
                isBoardFull = false;
            }*/

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

        if (rowStatus !== -1) {
            const colData = checkArrayForWin(colsArr);
            const colStatus = colData[0].playerNum;
            const diagData = checkArrayForWin(diagsArr);
            const diagStatus = diagData[0].playerNum;

            if (rowStatus === 1 || colStatus === 1 || diagStatus === 1) {
                console.log('1 Won!');
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
                console.log(winningCellsArr);
            }
            else if (rowStatus === 2 || colStatus === 2 || diagStatus === 2) {
                console.log('2 Won!');
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
                console.log(winningCellsArr);
            }
            else {
                console.log('No winner yet, keep playing.');
            }
        }
        else {
            console.log('Tie, no winner');
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


            /*if (!innerAr.includes(0)) {
                if (innerAr.includes(1) && !innerAr.includes(2)) {
                    return 1;
                }
                if (innerAr.includes(2) && !innerAr.includes(1)) {
                    return 2;
                }
            }
            else {
                boardFull = false;
            }*/
        }

        return boardFull ? [{ playerNum: -1 }] : [{ playerNum: 0 }];
    }

    //restart the game

    return { playRound };
})();