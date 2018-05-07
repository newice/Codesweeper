import { Component } from '@angular/core';
import { Modes } from './modes.enum';
import { MinesweeperConfiguration } from './minesweeper/minesweeper-configuration';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { GameStates } from './minesweeper/game-states.enum';
import { FlagStates } from './minesweeper/flag-states.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  Modes = Modes;
  back="&#x2190;";
  GameStates = GameStates;
  FlagStates = FlagStates;
  mode: Modes;
  icons: string[];
  width: number;
  customConfig: MinesweeperConfiguration = { Cols: 30, Rows: 16, Mines: 10 };
  lastState: string;

  constructor(private minesweeperService: MinesweeperService) {
    this.mode = Modes.Beginner;
    this.resetGame();
    this.icons = new Array(4);
    this.icons[GameStates.Initialized] = "&#128564;";
    this.icons[GameStates.Runnig] = "&#128521;";
    this.icons[GameStates.Win] = "&#128526;";
    this.icons[GameStates.Loose] = "&#128531;";
  }

  resetGame(mode: Modes = this.mode) {
    this.lastState = "";
    this.mode = mode;
    var config: MinesweeperConfiguration = this.customConfig;
    if (mode != Modes.Custom) {
      config = this.minesweeperService.getDefaultConfigurations()[this.mode];
    }
    config.Cols = +config.Cols;
    config.Rows = +config.Rows;
    config.Mines = +config.Mines;
    this.minesweeperService.init(config);
    this.width = (config.Cols + 1) * 24;
  }

  restoreState() {
    var state = JSON.parse(this.lastState);

    this.minesweeperService.mineField = state.mineField;
    this.minesweeperService.remainingMines = state.remainingMines;
    this.minesweeperService.gameState = state.gameState;

  }

  saveState() {
    this.lastState = (JSON.stringify({
      mineField: this.minesweeperService.mineField,
      remainingMines: this.minesweeperService.remainingMines,
      gameState: this.minesweeperService.gameState
    }));
  }

  cellClick(e: MouseEvent, x: number, y: number) {
    this.saveState();
    if (this.minesweeperService.gameState != GameStates.Loose && this.minesweeperService.gameState != GameStates.Win) {
      this.saveState();
      switch (e.which) {
        case 1:
          this.minesweeperService.handleLeftMouseClick(x, y);
          break;
        case 3:
          this.minesweeperService.handleRightMouseClick(x, y);
          break;
        default:
          alert('komische maus');
      }
    }
  }
}
