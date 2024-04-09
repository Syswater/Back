export enum TapePreference{
    Normal = "Normal",
    Servifacil = "Servifacil"
}

export function convertTapeToEnum(tapeStrings: string): TapePreference {
    return TapePreference[tapeStrings as keyof typeof TapePreference];
};