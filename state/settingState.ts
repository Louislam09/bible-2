import { observable } from "@legendapp/state";

export const settingState$ = observable({
  isAnimationDisabled: false,
  requiresSettingsReloadAfterSync: false,
});
