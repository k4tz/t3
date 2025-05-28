export interface ThemeProps {
    availableThemes: string[];
    selectedTheme: string;
    setSelectedTheme: React.Dispatch<React.SetStateAction<string>>;
}