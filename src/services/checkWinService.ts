import { move } from "../interfaces";

export function checkWin(moves: move[], winSpaces: number): boolean {
  return (
    checkHorizontal(moves, winSpaces) ||
    checkVertical(moves, winSpaces) ||
    checkDiagonal(moves, winSpaces)
  );
}

function checkHorizontal(moves: move[], winSpaces: number): boolean {
  const horizontalMoves: number[] = moves.map((move: move) => move.row);

  return checkInLineMatches(horizontalMoves, winSpaces);
}

function checkVertical(moves: move[], winSpaces: number): boolean {
  const verticalMoves = moves.map((move: move) => move.column);

  return checkInLineMatches(verticalMoves, winSpaces);
}

function checkInLineMatches(moveArr: number[], winSpaces: number) {
  const matches = {};
  moveArr.forEach((element) => {
    matches[element] = matches[element] ? matches[element] + 1 : 1;
  });

  return Object.values(matches).includes(winSpaces);
}

function checkDiagonal(moves: move[], winSpaces: number): boolean {
  const rowColArr: [number, number][] = moves.map((move: move) => [
    move.column,
    move.row,
  ]);
  for (let i = 0; i < rowColArr.length; i++) {
    const [col, row] = rowColArr[i];
    if (
      consecutive(winSpaces, 0, rowColArr, col, row, 1) ||
      consecutive(winSpaces, 0, rowColArr, col, row, -1)
    ) {
      return true;
    }
  }

  return false;
}

function consecutive(
  winNum: number,
  currNum: number,
  moves: [number, number][],
  col: number,
  row: number,
  rowDirection: number
) {
  if (winNum === currNum) {
    return true;
  }

  if (moves.some((move) => move[0] === col && move[1] === row)) {
    return consecutive(
      winNum,
      currNum + 1,
      moves,
      col + 1,
      row + rowDirection,
      rowDirection
    );
  }
  return false;
}
