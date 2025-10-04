/**
 * Bible Mention Node for Lexical Editor
 * Handles Bible verse references like "John 3:16", "Genesis 1:1", etc.
 */

import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedTextNode,
    Spread,
} from 'lexical';

import { $applyNodeReplacement, TextNode } from 'lexical';

export type SerializedBibleMentionNode = Spread<
    {
        type: 'bible-mention';
        version: 1;
        book: string;
        chapter: number;
        startVerse: number;
        endVerse?: number; // Optional for single verses
        verseText?: string;
        // Legacy support
        verse?: number;
    },
    SerializedTextNode
>;

function $convertBibleMentionElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const textContent = domNode.textContent;
    const book = domNode.getAttribute('data-book') || '';
    const chapter = parseInt(domNode.getAttribute('data-chapter') || '1');

    // Support both legacy single verse and new range format
    const legacyVerse = domNode.getAttribute('data-verse');
    const startVerse = domNode.getAttribute('data-start-verse');
    const endVerse = domNode.getAttribute('data-end-verse');
    const verseText = domNode.getAttribute('data-verse-text') || '';

    if (textContent !== null) {
        let finalStartVerse, finalEndVerse;

        if (startVerse) {
            // New range format
            finalStartVerse = parseInt(startVerse);
            finalEndVerse = endVerse ? parseInt(endVerse) : undefined;
        } else if (legacyVerse) {
            // Legacy single verse format
            finalStartVerse = parseInt(legacyVerse);
            finalEndVerse = undefined;
        } else {
            finalStartVerse = 1;
            finalEndVerse = undefined;
        }

        const node = $createBibleMentionNode(textContent, book, chapter, finalStartVerse, finalEndVerse, verseText);
        return {
            node,
        };
    }

    return null;
}

export class BibleMentionNode extends TextNode {
    __book: string;
    __chapter: number;
    __startVerse: number;
    __endVerse?: number;
    __verseText?: string;

    static getType(): string {
        return 'bible-mention';
    }

    static clone(node: BibleMentionNode): BibleMentionNode {
        return new BibleMentionNode(
            node.__text,
            node.__book,
            node.__chapter,
            node.__startVerse,
            node.__endVerse,
            node.__verseText,
            node.__key
        );
    }

    constructor(
        text: string,
        book: string,
        chapter: number,
        startVerse: number,
        endVerse?: number,
        verseText?: string,
        key?: NodeKey
    ) {
        super(text, key);
        this.__book = book;
        this.__chapter = chapter;
        this.__startVerse = startVerse;
        this.__endVerse = endVerse;
        this.__verseText = verseText;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-bible-mention-wrapper';

        // Create the main mention element
        const referenceDiv = super.createDOM(config);
        referenceDiv.className = 'editor-bible-mention dark:!text-green-300 !font-semibold';
        referenceDiv.setAttribute('data-book', this.__book);
        referenceDiv.setAttribute('data-chapter', this.__chapter.toString());
        referenceDiv.setAttribute('data-start-verse', this.__startVerse.toString());
        if (this.__endVerse) {
            referenceDiv.setAttribute('data-end-verse', this.__endVerse.toString());
        }
        // Legacy support
        referenceDiv.setAttribute('data-verse', this.__startVerse.toString());

        if (this.__verseText) {
            referenceDiv.setAttribute('data-verse-text', this.__verseText);
        }

        const verseReference = this.__endVerse
            ? `${this.__startVerse}-${this.__endVerse}`
            : this.__startVerse.toString();
        referenceDiv.title = this.__verseText || `${this.__book} ${this.__chapter}:${verseReference}`;

        wrapper.appendChild(referenceDiv);

        // Add verse text below if available (exclude placeholder messages)
        if (this.__verseText && !this.__verseText.includes('Integrar con base de datos') && !this.__verseText.includes('Error cargando')) {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'editor-bible-mention-verse dark:!text-white';
            verseDiv.textContent = this.__verseText;
            wrapper.appendChild(verseDiv);
        }

        return wrapper;
    }

    updateDOM(prevNode: BibleMentionNode, dom: HTMLElement, config: EditorConfig): boolean {
        const needsUpdate =
            prevNode.__book !== this.__book ||
            prevNode.__chapter !== this.__chapter ||
            prevNode.__startVerse !== this.__startVerse ||
            prevNode.__endVerse !== this.__endVerse ||
            prevNode.__verseText !== this.__verseText;

        if (needsUpdate) {
            // Find the mention element within the wrapper
            const mentionElement = dom.querySelector('.editor-bible-mention');
            if (mentionElement) {
                mentionElement.setAttribute('data-book', this.__book);
                mentionElement.setAttribute('data-chapter', this.__chapter.toString());
                mentionElement.setAttribute('data-start-verse', this.__startVerse.toString());
                if (this.__endVerse) {
                    mentionElement.setAttribute('data-end-verse', this.__endVerse.toString());
                } else {
                    mentionElement.removeAttribute('data-end-verse');
                }
                // Legacy support
                mentionElement.setAttribute('data-verse', this.__startVerse.toString());

                if (this.__verseText) {
                    mentionElement.setAttribute('data-verse-text', this.__verseText);
                }

                const verseReference = this.__endVerse
                    ? `${this.__startVerse}-${this.__endVerse}`
                    : this.__startVerse.toString();
                mentionElement.setAttribute('title', this.__verseText || `${this.__book} ${this.__chapter}:${verseReference}`);
            }

            // Update or create verse text display
            let verseDiv = dom.querySelector('.editor-bible-mention-verse') as HTMLElement;
            if (this.__verseText && !this.__verseText.includes('Integrar con base de datos') && !this.__verseText.includes('Error cargando')) {
                if (!verseDiv) {
                    verseDiv = document.createElement('div');
                    verseDiv.className = 'editor-bible-mention-verse';
                    dom.appendChild(verseDiv);
                }
                verseDiv.textContent = this.__verseText;
            } else if (verseDiv) {
                // Remove verse div if no verse text
                verseDiv.remove();
            }
        }

        return needsUpdate;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-lexical-bible-mention')) {
                    return null;
                }
                return {
                    conversion: $convertBibleMentionElement,
                    priority: 1,
                };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('span');
        element.setAttribute('data-lexical-bible-mention', 'true');
        element.setAttribute('data-book', this.__book);
        element.setAttribute('data-chapter', this.__chapter.toString());
        element.setAttribute('data-start-verse', this.__startVerse.toString());
        if (this.__endVerse) {
            element.setAttribute('data-end-verse', this.__endVerse.toString());
        }
        // Legacy support
        element.setAttribute('data-verse', this.__startVerse.toString());

        if (this.__verseText) {
            element.setAttribute('data-verse-text', this.__verseText);
        }
        element.textContent = this.__text;
        element.className = 'editor-bible-mention';

        const verseReference = this.__endVerse
            ? `${this.__startVerse}-${this.__endVerse}`
            : this.__startVerse.toString();
        element.title = this.__verseText || `${this.__book} ${this.__chapter}:${verseReference}`;

        return { element };
    }

    static importJSON(serializedNode: SerializedBibleMentionNode): BibleMentionNode {
        // Support both new format and legacy format
        let startVerse, endVerse;

        if (serializedNode.startVerse !== undefined) {
            startVerse = serializedNode.startVerse;
            endVerse = serializedNode.endVerse;
        } else if (serializedNode.verse !== undefined) {
            // Legacy support
            startVerse = serializedNode.verse;
            endVerse = undefined;
        } else {
            startVerse = 1;
            endVerse = undefined;
        }

        const node = $createBibleMentionNode(
            serializedNode.text,
            serializedNode.book,
            serializedNode.chapter,
            startVerse,
            endVerse,
            serializedNode.verseText
        );
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    exportJSON(): SerializedBibleMentionNode {
        return {
            ...super.exportJSON(),
            type: 'bible-mention',
            version: 1,
            book: this.__book,
            chapter: this.__chapter,
            startVerse: this.__startVerse,
            endVerse: this.__endVerse,
            verseText: this.__verseText,
            // Legacy support
            verse: this.__startVerse,
        };
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return true;
    }

    isTextEntity(): true {
        return true;
    }

    getBook(): string {
        return this.__book;
    }

    getChapter(): number {
        return this.__chapter;
    }

    getStartVerse(): number {
        return this.__startVerse;
    }

    getEndVerse(): number | undefined {
        return this.__endVerse;
    }

    // Legacy support
    getVerse(): number {
        return this.__startVerse;
    }

    // Helper method to check if this is a verse range
    isRange(): boolean {
        return this.__endVerse !== undefined && this.__endVerse !== this.__startVerse;
    }

    // Get verse reference string (e.g., "5" or "1-5")
    getVerseReference(): string {
        return this.__endVerse && this.__endVerse !== this.__startVerse
            ? `${this.__startVerse}-${this.__endVerse}`
            : this.__startVerse.toString();
    }

    getVerseText(): string | undefined {
        return this.__verseText;
    }

    setVerseText(verseText: string): void {
        const self = this.getWritable() as BibleMentionNode;
        self.__verseText = verseText;
    }
}

export function $createBibleMentionNode(
    text = '',
    book = '',
    chapter = 1,
    startVerse = 1,
    endVerse?: number,
    verseText?: string
): BibleMentionNode {
    return $applyNodeReplacement(new BibleMentionNode(text, book, chapter, startVerse, endVerse, verseText));
}

export function $isBibleMentionNode(
    node: LexicalNode | null | undefined,
): node is BibleMentionNode {
    return node instanceof BibleMentionNode;
}
