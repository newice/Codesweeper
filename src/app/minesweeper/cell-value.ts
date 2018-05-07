import { FlagStates } from "./flag-states.enum";

export class CellValue {
    isMine: boolean;
    isClosed: boolean;
    neighbourMines: number;
    flagState: FlagStates;
}
