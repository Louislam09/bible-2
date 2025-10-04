/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Icon from "@/components/Icon";
import type { JSX } from "react";

// import {isDOMNode} from 'lexical';
import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// @ts-ignore
import { createPortal } from "react-dom";

type DropDownContextType = {
  registerItem: (ref: React.RefObject<HTMLButtonElement>) => void;
};

const DropDownContext = React.createContext<DropDownContextType | null>(null);

const dropDownPadding = 4;

export function DropDownItem({
  children,
  className,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const dropDownContext = React.useContext(DropDownContext);

  if (dropDownContext === null) {
    throw new Error("DropDownItem must be used within a DropDown");
  }

  const { registerItem } = dropDownContext;

  useEffect(() => {
    if (ref && ref.current) {
      // @ts-ignore
      registerItem(ref);
    }
  }, [ref, registerItem]);

  return (
    <button
      className={className}
      onClick={onClick}
      ref={ref}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function DropDownItems({
  children,
  dropDownRef,
  onClose,
}: {
  children: React.ReactNode;
  dropDownRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  const [items, setItems] = useState<React.RefObject<HTMLButtonElement>[]>();
  const [highlightedItem, setHighlightedItem] =
    useState<React.RefObject<HTMLButtonElement>>();

  const registerItem = useCallback(
    (itemRef: React.RefObject<HTMLButtonElement>) => {
      setItems((prev) => (prev ? [...prev, itemRef] : [itemRef]));
    },
    [setItems]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!items) {
      return;
    }

    const key = event.key;

    if (["Escape", "ArrowUp", "ArrowDown", "Tab"].includes(key)) {
      event.preventDefault();
    }

    if (key === "Escape" || key === "Tab") {
      onClose();
    } else if (key === "ArrowUp") {
      setHighlightedItem((prev) => {
        if (!prev) {
          return items[0];
        }
        const index = items.indexOf(prev) - 1;
        return items[index === -1 ? items.length - 1 : index];
      });
    } else if (key === "ArrowDown") {
      setHighlightedItem((prev) => {
        if (!prev) {
          return items[0];
        }
        return items[items.indexOf(prev) + 1];
      });
    }
  };

  const contextValue = useMemo(
    () => ({
      registerItem,
    }),
    [registerItem]
  );

  useEffect(() => {
    if (items && !highlightedItem) {
      setHighlightedItem(items[0]);
    }

    if (highlightedItem && highlightedItem.current) {
      highlightedItem.current.focus();
    }
  }, [items, highlightedItem]);

  return (
    <DropDownContext.Provider value={contextValue}>
      <div className="dropdown" ref={dropDownRef} onKeyDown={handleKeyDown}>
        {children}
      </div>
    </DropDownContext.Provider>
  );
}

export default function DropDown({
  disabled = false,
  buttonLabel,
  buttonAriaLabel,
  buttonClassName,
  buttonIcon,
  children,
  stopCloseOnClickSelf,
  color,
  iconColor,
}: {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName: string;
  buttonIcon?: string;
  buttonLabel?: string;
  children: ReactNode;
  stopCloseOnClickSelf?: boolean;
  color?: string;
  iconColor?: string;
}): JSX.Element {
  const dropDownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);

  const handleClose = () => {
    setShowDropDown(false);
    if (buttonRef && buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  useEffect(() => {
    const button = buttonRef.current;
    const dropDown = dropDownRef.current;

    if (showDropDown && button !== null && dropDown !== null) {
      const buttonRect = button.getBoundingClientRect();
      const dropDownRect = dropDown.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate space available below and above the button
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Decide whether to place dropdown above or below
      const dropDownHeight = dropDownRect.height || 200; // fallback height
      const shouldPlaceAbove =
        spaceBelow < dropDownHeight && spaceAbove > dropDownHeight;

      // Calculate vertical position
      let top;
      if (shouldPlaceAbove) {
        top = buttonRect.top - dropDownHeight - dropDownPadding;
      } else {
        top = buttonRect.bottom + dropDownPadding;
      }

      // Calculate horizontal position (align with button, but stay in viewport)
      let left = buttonRect.left;
      const dropDownWidth = dropDownRect.width || 250; // fallback width

      // Adjust if dropdown would go off-screen to the right
      if (left + dropDownWidth > viewportWidth - 20) {
        left = viewportWidth - dropDownWidth - 20;
      }

      // Adjust if dropdown would go off-screen to the left
      if (left < 20) {
        left = 20;
      }

      // Apply positioning
      dropDown.style.top = `${Math.max(10, top)}px`;
      dropDown.style.left = `${left}px`;

      // Add a class to indicate if positioned above (for styling arrows, etc.)
      if (shouldPlaceAbove) {
        dropDown.classList.add("dropdown-above");
      } else {
        dropDown.classList.remove("dropdown-above");
      }
    }
  }, [dropDownRef, buttonRef, showDropDown]);

  useEffect(() => {
    const button = buttonRef.current;

    if (button !== null && showDropDown) {
      const handle = (event: MouseEvent) => {
        const target = event.target;
        // if (!isDOMNode(target)) {
        //   return;
        // }
        if (stopCloseOnClickSelf) {
          // @ts-ignore
          if (dropDownRef.current && dropDownRef.current.contains(target)) {
            return;
          }
        }
        // @ts-ignore
        if (!button.contains(target)) {
          setShowDropDown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropDownRef, buttonRef, showDropDown, stopCloseOnClickSelf]);

  useEffect(() => {
    const handleButtonPositionUpdate = () => {
      if (showDropDown) {
        const button = buttonRef.current;
        const dropDown = dropDownRef.current;
        if (button !== null && dropDown !== null) {
          const buttonRect = button.getBoundingClientRect();
          const dropDownRect = dropDown.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Recalculate positioning on scroll (same logic as main positioning)
          const spaceBelow = viewportHeight - buttonRect.bottom;
          const spaceAbove = buttonRect.top;
          const dropDownHeight = dropDownRect.height || 200;
          const shouldPlaceAbove =
            spaceBelow < dropDownHeight && spaceAbove > dropDownHeight;

          let newTop;
          if (shouldPlaceAbove) {
            newTop = buttonRect.top - dropDownHeight - dropDownPadding;
          } else {
            newTop = buttonRect.bottom + dropDownPadding;
          }

          dropDown.style.top = `${Math.max(10, newTop)}px`;

          // Update class for above/below styling
          if (shouldPlaceAbove) {
            dropDown.classList.add("dropdown-above");
          } else {
            dropDown.classList.remove("dropdown-above");
          }
        }
      }
    };

    document.addEventListener("scroll", handleButtonPositionUpdate);
    document.addEventListener("resize", handleButtonPositionUpdate); // Also handle window resize

    return () => {
      document.removeEventListener("scroll", handleButtonPositionUpdate);
      document.removeEventListener("resize", handleButtonPositionUpdate);
    };
  }, [buttonRef, dropDownRef, showDropDown]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={buttonAriaLabel || buttonLabel}
        className={buttonClassName}
        onClick={() => setShowDropDown(!showDropDown)}
        ref={buttonRef}
      >
        <Icon name={buttonIcon as any} size={24} color={iconColor || "white"} />
        <div
          className="w-6 h-1 mt-1 border !border-black"
          style={{ backgroundColor: color }}
        />
      </button>

      {showDropDown &&
        createPortal(
          <DropDownItems dropDownRef={dropDownRef} onClose={handleClose}>
            {children}
          </DropDownItems>,
          document.body
        )}
    </>
  );
}
