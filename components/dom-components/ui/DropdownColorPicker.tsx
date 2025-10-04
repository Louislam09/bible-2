/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react";

import ColorPicker from "./ColorPicker";
import DropDown from "./DropDown";
import { icons } from "lucide-react-native";

type Props = {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName: string;
  buttonIcon?: keyof typeof icons;
  buttonLabel?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color: string;
  iconColor: string;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
};

export default function DropdownColorPicker({
  disabled = false,
  stopCloseOnClickSelf = false,
  color,
  onChange,
  iconColor,
  ...rest
}: Props) {
  return (
    <DropDown
      {...rest}
      color={color}
      iconColor={iconColor}
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}
    >
      <ColorPicker color="#000000" onChange={onChange} />
    </DropDown>
  );
}
