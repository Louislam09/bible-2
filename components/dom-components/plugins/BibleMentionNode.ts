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
        verse: number;
        verseText?: string;
    },
    SerializedTextNode
>;

function $convertBibleMentionElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const textContent = domNode.textContent;
    const book = domNode.getAttribute('data-book') || '';
    const chapter = parseInt(domNode.getAttribute('data-chapter') || '1');
    const verse = parseInt(domNode.getAttribute('data-verse') || '1');
    const verseText = domNode.getAttribute('data-verse-text') || '';

    if (textContent !== null) {
        const node = $createBibleMentionNode(textContent, book, chapter, verse, verseText);
        return {
            node,
        };
    }

    return null;
}

export class BibleMentionNode extends TextNode {
    __book: string;
    __chapter: number;
    __verse: number;
    __verseText?: string;

    static getType(): string {
        return 'bible-mention';
    }

    static clone(node: BibleMentionNode): BibleMentionNode {
        return new BibleMentionNode(
            node.__text,
            node.__book,
            node.__chapter,
            node.__verse,
            node.__verseText,
            node.__key
        );
    }

    constructor(
        text: string,
        book: string,
        chapter: number,
        verse: number,
        verseText?: string,
        key?: NodeKey
    ) {
        super(text, key);
        this.__book = book;
        this.__chapter = chapter;
        this.__verse = verse;
        this.__verseText = verseText;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-bible-mention-wrapper';

        // Create the main mention element
        const element = super.createDOM(config);
        element.className = 'editor-bible-mention';
        element.setAttribute('data-book', this.__book);
        element.setAttribute('data-chapter', this.__chapter.toString());
        element.setAttribute('data-verse', this.__verse.toString());
        if (this.__verseText) {
            element.setAttribute('data-verse-text', this.__verseText);
        }
        element.title = this.__verseText || `${this.__book} ${this.__chapter}:${this.__verse}`;

        wrapper.appendChild(element);

        // Add verse text below if available (exclude placeholder messages)
        if (this.__verseText && !this.__verseText.includes('Integrar con base de datos') && !this.__verseText.includes('Error cargando')) {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'editor-bible-mention-verse';
            verseDiv.textContent = this.__verseText;
            wrapper.appendChild(verseDiv);
        }

        return wrapper;
    }

    updateDOM(prevNode: BibleMentionNode, dom: HTMLElement, config: EditorConfig): boolean {
        const needsUpdate =
            prevNode.__book !== this.__book ||
            prevNode.__chapter !== this.__chapter ||
            prevNode.__verse !== this.__verse ||
            prevNode.__verseText !== this.__verseText;

        if (needsUpdate) {
            // Find the mention element within the wrapper
            const mentionElement = dom.querySelector('.editor-bible-mention');
            if (mentionElement) {
                mentionElement.setAttribute('data-book', this.__book);
                mentionElement.setAttribute('data-chapter', this.__chapter.toString());
                mentionElement.setAttribute('data-verse', this.__verse.toString());
                if (this.__verseText) {
                    mentionElement.setAttribute('data-verse-text', this.__verseText);
                }
                mentionElement.setAttribute('title', this.__verseText || `${this.__book} ${this.__chapter}:${this.__verse}`);
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
        element.setAttribute('data-verse', this.__verse.toString());
        if (this.__verseText) {
            element.setAttribute('data-verse-text', this.__verseText);
        }
        element.textContent = this.__text;
        element.className = 'editor-bible-mention';
        element.title = this.__verseText || `${this.__book} ${this.__chapter}:${this.__verse}`;
        return { element };
    }

    static importJSON(serializedNode: SerializedBibleMentionNode): BibleMentionNode {
        const node = $createBibleMentionNode(
            serializedNode.text,
            serializedNode.book,
            serializedNode.chapter,
            serializedNode.verse,
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
            verse: this.__verse,
            verseText: this.__verseText,
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

    getVerse(): number {
        return this.__verse;
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
    verse = 1,
    verseText?: string
): BibleMentionNode {
    return $applyNodeReplacement(new BibleMentionNode(text, book, chapter, verse, verseText));
}

export function $isBibleMentionNode(
    node: LexicalNode | null | undefined,
): node is BibleMentionNode {
    return node instanceof BibleMentionNode;
}
