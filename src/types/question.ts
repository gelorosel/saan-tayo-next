export interface Option {
    label: string;
    value: string;
}

export interface Question {
    id: string;
    question: string;
    randomize?: boolean;
    options?: Option[];
}
