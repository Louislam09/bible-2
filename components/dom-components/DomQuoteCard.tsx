"use dom";
import "../../global.css";

import React, { useMemo } from "react";
import { useThemeVariables } from "@/hooks/useThemeVariables";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import DomSwipeTutor from "./DomSwipeTutor";

interface DomQuoteCardProps {
    theme: TTheme;
    templateHtml: string;
    reference: string;
    quoteText: string;
    widthPercent?: number; // default 90
    showTutor?: boolean;
}

const DomQuoteCard: React.FC<DomQuoteCardProps> = ({
    theme,
    templateHtml,
    reference,
    quoteText,
    widthPercent = 90,
    showTutor = false,
}) => {
    useThemeVariables(theme);

    const html = useMemo(() => {
        return (templateHtml || "")
            .replace(/{{ref}}/g, reference || "")
            .replace(/{{text}}/g, getVerseTextRaw(quoteText || ""));
    }, [templateHtml, reference, quoteText]);

    return (
        <div className="w-full h-full relative px-2" style={{ overflow: "hidden" }}>
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: html }} />
            {showTutor && <DomSwipeTutor show={true} bottomOffset={100} />}
        </div>
    );
};

export default DomQuoteCard;
