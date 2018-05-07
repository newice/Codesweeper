import { Injectable } from '@angular/core';
import { MinesweeperConfiguration } from './minesweeper-configuration';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { CellValue } from './cell-value';
import { FlagStates } from './flag-states.enum';
import { GameStates } from './game-states.enum';



@Injectable()
export class MinesweeperService {

  private defaultConfigurations: MinesweeperConfiguration[] = [
    {
      Cols: 9,
      Rows: 9,
      Mines: 10
    },
    {
      Cols: 16,
      Rows: 16,
      Mines: 40
    },
    {
      Cols: 30,
      Rows: 16,
      Mines: 99
    },
  ];

  constructor() { }
  private conf: MinesweeperConfiguration;
  private intervalCount = 0;
  gameState: GameStates;
  remainingMines: number;
  timePassed: number;
  message: string;
  mineField: CellValue[][];
  getDefaultConfigurations(): MinesweeperConfiguration[] {
    return this.defaultConfigurations;
  }

  init(config: MinesweeperConfiguration): void {
    window.clearInterval(this.intervalCount);
    if (config.Rows * config.Cols <= config.Mines) {
      this.message = "Too many mines!";
    }
    else {
      this.conf = config;
      this.remainingMines = config.Mines;
      this.timePassed = 0;
      this.gameState = GameStates.Initialized;
      this.initMineField();
    }
  }

  initGame(x, y) {// x, y coordinates of the first click
    this.timePassed = 0;
    this.buildMineField(x, y);
    this.intervalCount = window.setInterval(() => {
      this.timePassed = this.timePassed + 1;
    }, 1000);
    this.gameState = GameStates.Runnig;
  }

  initMineField() {
    this.mineField = Array(this.conf.Rows).fill({}).map(f =>
      Array(this.conf.Cols).fill({}).map(f =>
        Object.assign(new CellValue(), {
          flagState: FlagStates.None,
          isMine: false,
          isClosed: true,
          neighbourMines: 0
        })
      ));
  }

  buildMineField(x: number, y: number) {
    this.initMineField();
    for (var i = 0; i < this.conf.Mines; i++) {
      var tempX = x;
      var tempY = y;
      while (tempX == x && tempY == y || this.mineField[tempX][tempY].isMine) {
        tempX = Math.floor(Math.random() * this.conf.Rows);
        tempY = Math.floor(Math.random() * this.conf.Cols);
      }

      this.mineField[tempX][tempY].isMine = true;
      this.mineField[tempX][tempY].neighbourMines = 0;
      this.setHints(tempX, tempY);
    }
  }

  setHints(x, y) {
    if (x > 0) {
      if (!this.mineField[x - 1][y].isMine) this.mineField[x - 1][y].neighbourMines++;
    }
    if (y > 0) {
      if (!this.mineField[x][y - 1].isMine) this.mineField[x][y - 1].neighbourMines++;
    }
    if (x < this.conf.Rows - 1) {
      if (!this.mineField[x + 1][y].isMine) this.mineField[x + 1][y].neighbourMines++;
    }
    if (y < this.conf.Cols - 1) {
      if (!this.mineField[x][y + 1].isMine) this.mineField[x][y + 1].neighbourMines++;
    }
    if ((x > 0) && (y > 0)) {
      if (!this.mineField[x - 1][y - 1].isMine) this.mineField[x - 1][y - 1].neighbourMines++;
    }
    if ((x > 0) && (y < this.conf.Cols - 1)) {
      if (!this.mineField[x - 1][y + 1].isMine) this.mineField[x - 1][y + 1].neighbourMines++;
    }
    if ((x < this.conf.Rows - 1) && (y > 0)) {
      if (!this.mineField[x + 1][y - 1].isMine) this.mineField[x + 1][y - 1].neighbourMines++;
    }
    if ((x < this.conf.Rows - 1) && (y < this.conf.Cols - 1)) {
      if (!this.mineField[x + 1][y + 1].isMine) this.mineField[x + 1][y + 1].neighbourMines++;
    }
  }


  makeClicks(x, y) {
    x = parseInt(x);
    y = parseInt(y);

    var temp;
    if ((x > 0) && this.mineField[x - 1][y].isClosed) {
      this.handleLeftMouseClick(x - 1, y);
    }
    if ((y > 0) && this.mineField[x][y - 1].isClosed) {
      this.handleLeftMouseClick(x, y - 1);
    }
    if ((x < this.conf.Rows - 1) && this.mineField[x + 1][y].isClosed) {
      this.handleLeftMouseClick(x + 1, y);
    }
    if ((y < this.conf.Cols - 1) && this.mineField[x][y + 1].isClosed) {
      this.handleLeftMouseClick(x, y + 1);
    }
    if ((x > 0) && (y > 0) && this.mineField[x - 1][y - 1].isClosed) {
      this.handleLeftMouseClick(x - 1, y - 1);
    }
    if ((x > 0) && (y < this.conf.Cols - 1) && this.mineField[x - 1][y + 1].isClosed) {
      this.handleLeftMouseClick(x - 1, y + 1);
    }
    if ((x < this.conf.Rows - 1) && (y > 0) && this.mineField[x + 1][y - 1].isClosed) {
      this.handleLeftMouseClick(x + 1, y - 1);
    }
    if ((x < this.conf.Rows - 1) && (y < this.conf.Cols - 1) && this.mineField[x + 1][y + 1].isClosed) {
      this.handleLeftMouseClick(x + 1, y + 1);
    }
  }

  handleLeftMouseClick(x, y) {
    if (this.gameState == GameStates.Initialized) {
      this.initGame(x, y);
    }

    var cell = this.mineField[x][y];
    // var obj = objFeld[x][y];
    if (cell.isClosed && !(cell.flagState == FlagStates.Flag)) {
      if (!cell.isMine) {
        cell.isClosed = false;
        if (cell.neighbourMines == 0) {
          this.makeClicks(x, y);
        }

        if (this.gameState != GameStates.Win && this.conf.Mines >= this.filteredCells(cell => cell.isClosed).length) {
          this.endGame(GameStates.Win);
        }
      } else {
        this.endGame(GameStates.Loose);
      }
    }
  }

  handleRightMouseClick(x: number, y: number): any {
    var cell = this.mineField[x][y];
    if (this.gameState == GameStates.Runnig && cell.isClosed) {
      cell.flagState = (cell.flagState + 1) % 3;

      if (cell.flagState == FlagStates.Flag) {
        this.remainingMines = this.remainingMines - 1;
      }
      if (cell.flagState == FlagStates.Unsure) {
        this.remainingMines = this.remainingMines + 1;
      }
    }
  }

  filteredCells(f): CellValue[] {
    return this.mineField.reduce((acc, x) => acc.concat(x.filter(f)), []);
  }

  endGame(victory: GameStates) {
    this.gameState = victory;
    window.clearInterval(this.intervalCount);
    this.filteredCells(cell => cell.isMine && cell.flagState != FlagStates.Flag).forEach(cell => cell.isClosed = false);
  }
}
