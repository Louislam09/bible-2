// import React, { createContext, ReactNode, useContext, useState } from "react";

// interface ModalContextType {
//   searchWordOnDic: string;
//   setSearchWordOnDic: (word: string) => void;
//   isSheetClosed: boolean;
//   handleSheetChange: (index: number) => void;
// }

// const ModalContext = createContext<ModalContextType | undefined>(undefined);

// export const ModalProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [searchWordOnDic, setSearchWordOnDic] = useState("");
//   const [isSheetClosed, setSheetClosed] = useState(true);

//   const handleSheetChange = (index: number) => {
//     setSheetClosed(index <= 0);
//   };

//   const value = {
//     searchWordOnDic,
//     setSearchWordOnDic,
//     isSheetClosed,
//     handleSheetChange,
//   };

//   return (
//     <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
//   );
// };

// export const useModal = () => {
//   const context = useContext(ModalContext);
//   if (context === undefined) {
//     throw new Error("useModal must be used within a ModalProvider");
//   }
//   return context;
// };
