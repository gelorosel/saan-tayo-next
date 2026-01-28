export interface Option {
    label: string;
    value: string;
}

export interface Question {
    id: string;
    question: string;
    shuffle?: boolean;
    options?: Option[];
    type?: "text" | "select";
    placeholder?: string;
    multiSelect?: boolean;
    minSelections?: number;
    maxSelections?: number;
}
