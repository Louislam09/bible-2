import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";

const HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 10px;
      overflow-y: hidden;
    }
    #editor {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 10px;
      min-height: 150px;
      max-height: 400px;
      overflow-y: auto;
    }
    .editor-placeholder {
      color: #999;
      overflow: hidden;
      position: absolute;
      text-overflow: ellipsis;
      top: 10px;
      left: 10px;
      user-select: none;
      display: inline-block;
      pointer-events: none;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      padding: 8px;
      gap: 5px;
    }
    .toolbar button {
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 10px;
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
    }
    .toolbar button.active {
      background-color: #dadada;
      border-color: #999;
      font-weight: bold;
    }
    ul, ol {
      padding-left: 20px;
      margin: 0;
    }
    blockquote {
      margin: 0;
      margin-left: 20px;
      border-left: 2px solid #ccc;
      padding-left: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="toolbar" id="toolbar">
    <button id="bold">Bold</button>
    <button id="italic">Italic</button>
    <button id="underline">Underline</button>
    <button id="heading1">H1</button>
    <button id="heading2">H2</button>
    <button id="bullet">• List</button>
    <button id="number">1. List</button>
    <button id="quote">Quote</button>
  </div>
  <div id="editor"></div>
  <div id="content-output" style="display:none;"></div>

  <script>
    // This function sends messages to React Native
    function sendToRN(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }

    // Wait for Lexical to be injected from React Native
    document.addEventListener('DOMContentLoaded', () => {
      sendToRN({ type: 'ready' });
    });

    // Initialize the editor when Lexical is loaded
    function initEditor() {
      const { lexical, createEditor, $getRoot, $getSelection, $createParagraphNode, $createTextNode, 
              $isRangeSelection, ElementFormatType, $isElementNode } = window.Lexical;
      const { RichTextPlugin, HistoryPlugin } = window.LexicalPlugins;
      const { ListNode, ListItemNode } = window.LexicalList;
      const { HeadingNode, QuoteNode } = window.LexicalRichText;
      const { $isAtNodeEnd } = window.LexicalSelection;
      const { mergeRegister } = window.LexicalUtils;

      // Define editor config
      const editorConfig = {
        namespace: 'LexicalRichTextEditor',
        theme: {
          heading: {
            h1: 'font-size: 24px; font-weight: bold;',
            h2: 'font-size: 20px; font-weight: bold;',
          },
          list: {
            ol: 'list-style-type: decimal; padding-left: 20px;', 
            ul: 'list-style-type: disc; padding-left: 20px;',
            listitem: 'margin: 0 0 0 20px;',
          },
          quote: 'border-left: 2px solid #ccc; padding-left: 10px; color: #666;'
        },
        onError: (error) => {
          console.error(error);
        },
        nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode]
      };

      // Create the editor instance
      const editor = createEditor(editorConfig);

      // Create DOM node to mount editor
      const editorDiv = document.getElementById('editor');
      
      // Register and initialize plugins
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const contentOutput = document.getElementById('content-output');
          contentOutput.textContent = JSON.stringify(root.exportJSON());
          sendToRN({ 
            type: 'contentChange',
            content: root.exportJSON() 
          });
        });
      });

      // Mount the editor
      editor.setRootElement(editorDiv);

      // Add placeholder text
      const placeholderElement = document.createElement('div');
      placeholderElement.className = 'editor-placeholder';
      placeholderElement.textContent = 'Enter some text...';
      editorDiv.appendChild(placeholderElement);

      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();
          const isEmpty = children.length === 1 && 
                       children[0].getType() === 'paragraph' && 
                       children[0].getTextContent().trim() === '';

          placeholderElement.style.display = isEmpty ? 'block' : 'none';
        });
      });

      // Toolbar functionality
      const buttons = {
        bold: document.getElementById('bold'),
        italic: document.getElementById('italic'),
        underline: document.getElementById('underline'),
        heading1: document.getElementById('heading1'),
        heading2: document.getElementById('heading2'),
        bullet: document.getElementById('bullet'),
        number: document.getElementById('number'),
        quote: document.getElementById('quote')
      };

      // Format text
      function formatText(formatType) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.formatText(formatType);
          }
        });
      }

      // Create heading node
      function formatHeading(headingSize) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const focusNode = selection.focus.getNode();
            const anchorNodeParent = anchorNode.getParent?.() || anchorNode;
            
            if ($isElementNode(anchorNodeParent)) {
              const headingNode = $createHeadingNode(headingSize);
              anchorNodeParent.replace(headingNode);
              
              const children = anchorNodeParent.getChildren();
              children.forEach(child => {
                headingNode.append(child);
              });
            }
          }
        });
      }

      // Handle list creation
      function formatList(listType) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const rootNode = anchorNode.getTopLevelElement();
            
            if (rootNode) {
              const listNode = $createListNode(listType);
              const listItemNode = $createListItemNode();
              
              listItemNode.append(...rootNode.getChildren());
              listNode.append(listItemNode);
              rootNode.replace(listNode);
            }
          }
        });
      }

      // Create quote block
      function formatQuote() {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const topLevelNode = anchorNode.getTopLevelElement();
            
            if (topLevelNode) {
              const quoteNode = $createQuoteNode();
              quoteNode.append(...topLevelNode.getChildren());
              topLevelNode.replace(quoteNode);
            }
          }
        });
      }

      // Add event listeners to buttons
      buttons.bold.addEventListener('click', () => formatText('bold'));
      buttons.italic.addEventListener('click', () => formatText('italic'));
      buttons.underline.addEventListener('click', () => formatText('underline'));
      buttons.heading1.addEventListener('click', () => formatHeading('h1'));
      buttons.heading2.addEventListener('click', () => formatHeading('h2'));
      buttons.bullet.addEventListener('click', () => formatList('bullet'));
      buttons.number.addEventListener('click', () => formatList('number'));
      buttons.quote.addEventListener('click', formatQuote);

      // Handle toolbar button active states
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Update button states based on current selection format
            buttons.bold.classList.toggle('active', selection.hasFormat('bold'));
            buttons.italic.classList.toggle('active', selection.hasFormat('italic'));
            buttons.underline.classList.toggle('active', selection.hasFormat('underline'));

            // Check for parent nodes to determine headings, lists, etc.
            const anchorNode = selection.anchor.getNode();
            const parentNode = anchorNode.getParent?.();
            
            if (parentNode) {
              const nodeType = parentNode.getType();
              buttons.heading1.classList.toggle('active', nodeType === 'heading' && parentNode.getTag() === 'h1');
              buttons.heading2.classList.toggle('active', nodeType === 'heading' && parentNode.getTag() === 'h2');
              buttons.quote.classList.toggle('active', nodeType === 'quote');
              
              // Check for list types
              const listParent = parentNode.getParent?.();
              if (listParent) {
                const listType = listParent.getListType?.();
                buttons.bullet.classList.toggle('active', listType === 'bullet');
                buttons.number.classList.toggle('active', listType === 'number');
              }
            }
          }
        });
      });

      // Export editor instance for later use
      window.editor = editor;

      // Notify React Native that editor is initialized
      sendToRN({ type: 'initialized' });
    }

    // Helper functions to create nodes - define these globally
    function $createHeadingNode(headingSize) {
      const { HeadingNode } = window.LexicalRichText;
      return new HeadingNode(headingSize);
    }

    function $createListNode(listType) {
      const { ListNode } = window.LexicalList;
      return new ListNode(listType);
    }

    function $createListItemNode() {
      const { ListItemNode } = window.LexicalList;
      return new ListItemNode();
    }

    function $createQuoteNode() {
      const { QuoteNode } = window.LexicalRichText;
      return new QuoteNode();
    }
  </script>
</body>
</html>
`;

const LexicalRichTextEditor = () => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [editorContent, setEditorContent] = useState(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = React.useRef(null);

  // Lexical and its plugins as strings to inject into the WebView
  const lexicalScript = `
    window.Lexical = {
      lexical: true,
      createEditor: function(config) {
        const editor = {
          _config: config,
          _root: null,
          _listeners: [],
          _pendingEditorState: null,

          setRootElement(element) {
            this._root = element;
            this._root.contentEditable = true;
            this._root.spellcheck = true;
            this._root.addEventListener('input', () => this._onUpdate());
            this._onUpdate();
          },

          update(callback) {
            if (callback) callback();
            this._onUpdate();
          },

          registerUpdateListener(listener) {
            this._listeners.push(listener);
          },

          _onUpdate() {
            const editorState = { read: (callback) => callback() };
            for (const listener of this._listeners) {
              listener({ editorState });
            }
          }
        };
        return editor;
      },

      $getRoot() {
        return {
          getChildren() {
            return Array.from(document.getElementById('editor').childNodes)
              .map(child => this._wrapDOMNode(child));
          },
          exportJSON() {
            const content = document.getElementById('editor').innerHTML;
            return {
              type: 'root',
              children: this.getChildren().map(child => child.exportJSON()),
              version: 1,
              content
            };
          },
          _wrapDOMNode(node) {
            return {
              getType() {
                return node.nodeName.toLowerCase();
              },
              getTextContent() {
                return node.textContent || '';
              },
              getChildren() {
                return Array.from(node.childNodes)
                  .map(child => this._wrapDOMNode(child));
              },
              exportJSON() {
                return {
                  type: this.getType(),
                  text: this.getTextContent(),
                  children: this.getChildren().map(child => child.exportJSON())
                };
              }
            };
          }
        };
      },

      $getSelection() {
        const selection = window.getSelection();
        const isRange = selection.type === 'Range';
        
        return {
          anchor: {
            getNode() {
              return {
                getParent() {
                  return selection.anchorNode.parentElement;
                }
              };
            }
          },
          focus: {
            getNode() {
              return {
                getParent() {
                  return selection.focusNode.parentElement;
                }
              };
            }
          },
          hasFormat(format) {
            if (format === 'bold') return document.queryCommandState('bold');
            if (format === 'italic') return document.queryCommandState('italic');
            if (format === 'underline') return document.queryCommandState('underline');
            return false;
          },
          formatText(format) {
            if (format === 'bold') document.execCommand('bold', false, null);
            if (format === 'italic') document.execCommand('italic', false, null);
            if (format === 'underline') document.execCommand('underline', false, null);
          }
        };
      },

      $isRangeSelection(selection) {
        return window.getSelection().type === 'Range';
      },

      $createParagraphNode() {
        const p = document.createElement('p');
        return this._wrapElement(p);
      },

      $createTextNode(text) {
        const textNode = document.createTextNode(text);
        return this._wrapNode(textNode);
      },

      $isElementNode(node) {
        return node && node.nodeType === 1;
      },

      _wrapElement(element) {
        return {
          element,
          append(...children) {
            for (const child of children) {
              element.appendChild(child.element || child);
            }
          },
          replace(newNode) {
            element.parentElement.replaceChild(newNode.element, element);
          }
        };
      },

      _wrapNode(node) {
        return {
          node,
          append(child) {
            node.appendChild(child.node || child);
          }
        };
      }
    };

    window.LexicalPlugins = {
      RichTextPlugin: true,
      HistoryPlugin: true
    };

    window.LexicalList = {
      ListNode: function(listType) {
        const element = document.createElement(listType === 'bullet' ? 'ul' : 'ol');
        return {
          element,
          append(child) {
            element.appendChild(child.element);
          },
          getListType() {
            return listType;
          }
        };
      },
      ListItemNode: function() {
        const element = document.createElement('li');
        return {
          element,
          append(...children) {
            for (const child of children) {
              if (typeof child === 'string') {
                element.textContent += child;
              } else if (child.element) {
                element.appendChild(child.element);
              } else {
                element.appendChild(child);
              }
            }
          }
        };
      }
    };

    window.LexicalRichText = {
      HeadingNode: function(tag) {
        const element = document.createElement(tag);
        return {
          element,
          append(...children) {
            for (const child of children) {
              if (typeof child === 'string') {
                element.textContent += child;
              } else if (child.element) {
                element.appendChild(child.element);
              } else {
                element.appendChild(child);
              }
            }
          },
          getTag() {
            return tag;
          },
          getType() {
            return 'heading';
          }
        };
      },
      QuoteNode: function() {
        const element = document.createElement('blockquote');
        return {
          element,
          append(...children) {
            for (const child of children) {
              if (typeof child === 'string') {
                element.textContent += child;
              } else if (child.element) {
                element.appendChild(child.element);
              } else {
                element.appendChild(child);
              }
            }
          },
          getType() {
            return 'quote';
          }
        };
      }
    };

    window.LexicalSelection = {
      $isAtNodeEnd: function() {
        return false;
      }
    };

    window.LexicalUtils = {
      mergeRegister: function(...listeners) {
        return () => {
          listeners.forEach(listener => listener && typeof listener === 'function' && listener());
        };
      }
    };

    // Initialize the editor now that Lexical is loaded
    initEditor();
  `;

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case "ready":
          // Inject Lexical scripts when WebView is ready
          // @ts-ignore
          webViewRef.current?.injectJavaScript(lexicalScript);
          break;
        case "initialized":
          setIsEditorReady(true);
          break;
        case "contentChange":
          setEditorContent(message.content);
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  };

  // Reset the WebView if needed
  const resetEditor = () => {
    setWebViewKey((prevKey) => prevKey + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lexical Rich Text Editor</Text>

      <View style={styles.editorContainer}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: HTML_CONTENT }}
          style={styles.webview}
          onMessage={handleMessage}
          scalesPageToFit={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          {...createOptimizedWebViewProps({}, "editor")}
        />
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.button} onPress={resetEditor}>
          <Text style={styles.buttonText}>Reset Editor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentViewer}>
        <Text style={styles.contentViewerTitle}>Content Preview:</Text>
        <ScrollView style={styles.contentScrollView}>
          {editorContent ? (
            <Text style={styles.contentText}>
              {JSON.stringify(editorContent, null, 2)}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>
              Editor content will appear here...
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  editorContainer: {
    height: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  contentViewer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  contentViewerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  contentScrollView: {
    flex: 1,
  },
  contentText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  placeholderText: {
    color: "#999",
    fontStyle: "italic",
  },
});

export default LexicalRichTextEditor;
