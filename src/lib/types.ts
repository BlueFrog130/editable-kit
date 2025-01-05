export type MaybePromise<T> = T | Promise<T>;

export type ImageState = {
	src: string;
	alt: string;
};

export type ImageEditState = {
	src: File | null;
	alt: string;
};

export type EditorData = { [key: string]: string | ImageState | ImageEditState };

type KeysWithValsOfType<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T;

export type StringKeys<T> = KeysWithValsOfType<T, string>;
export type ImageKeys<T> = KeysWithValsOfType<T, ImageState>;
