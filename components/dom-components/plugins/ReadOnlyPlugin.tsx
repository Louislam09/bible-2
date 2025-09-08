import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

function ReadOnlyPlugin({ isReadOnly }: { isReadOnly: boolean }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.setEditable(!isReadOnly);
    }, [editor, isReadOnly]);

    return null;
}

export default ReadOnlyPlugin;