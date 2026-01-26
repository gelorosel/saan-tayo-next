export interface Option {
    label: string;
    value: string;
}

export interface Question {
    id: string;
    question: string;
    options?: Option[];
}
