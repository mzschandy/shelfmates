export interface EpubMetadata {
  publisher?: string;
  description?: string;
  language?: string;
  creator?: {
    [key: string]: string;
    role: string;
    text: string;
  };
  title?: string;
  date?: string;
  contributer?: {
    role: string;
    text: string;
  };
  subject?: string[];
  cover?: string;
  isbn?: string;
  uuid?: string;
  coverPath?: string;
  [key: string]: any;
}