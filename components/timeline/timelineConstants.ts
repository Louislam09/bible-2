import { Dimensions } from "react-native"

export const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  'window'
)

export const smallSize = viewportWidth < 340
export const MAX_WIDTH = 700

export const wp = (percentage: number, maxWidth?: boolean | number) => {
  let value
  if (maxWidth === true) {
    value =
      (percentage * (viewportWidth > MAX_WIDTH ? MAX_WIDTH : viewportWidth)) /
      100
  } else if (typeof maxWidth === 'number') {
    value =
      (percentage * (viewportWidth > maxWidth ? maxWidth : viewportWidth)) / 100
  } else {
    value = (percentage * viewportWidth) / 100
  }

  return Math.round(value)
}

export const wpUI = (percentage: number, maxWidth?: boolean | number) => {
  'worklet'

  let value
  if (maxWidth === true) {
    value =
      (percentage * (viewportWidth > MAX_WIDTH ? MAX_WIDTH : viewportWidth)) /
      100
  } else if (typeof maxWidth === 'number') {
    value =
      (percentage * (viewportWidth > maxWidth ? maxWidth : viewportWidth)) / 100
  } else {
    value = (percentage * viewportWidth) / 100
  }

  return Math.round(value)
}

export const hp = (percentage: number, maxHeight?: number) => {
  let value = (percentage * viewportHeight) / 100
  if (maxHeight) {
    value = value > maxHeight ? maxHeight : value
  }
  value = (percentage * viewportHeight) / 100
  return Math.round(value)
}

export const cleanParams = () => ({
  type: undefined,
  title: undefined,
  code: undefined,
  strongType: undefined,
  phonetique: undefined,
  definition: undefined,
  translatedBy: undefined,
  content: undefined,
  version: undefined,
  verses: undefined,
})

export const removeBreakLines = (str: string = '') => str.replace(/\n/g, '')

export const maxWidth = (width: number, maxW = MAX_WIDTH) =>
  width > maxW ? maxW : width

export const offsetTop = 50
export const rows = 24
export const rowHeight = 30
export const rowGap = 10
export const scrollViewHeight = offsetTop + rows * (rowHeight + rowGap)
export const rowToPx = (row: number) => offsetTop + row * (rowHeight + rowGap)
export const offset = wp(40)

export const mapRange = (
  current: number,
  [fromMin, fromMax]: [number, number],
  [toMin, toMax]: [number, number]
) => toMin + ((toMax - toMin) * (current - fromMin)) / (fromMax - fromMin)

export const calculateLabel = (start: number, end: number) => {
  const absStart = Math.abs(start)
  const absEnd = Math.abs(end)
  const range = Math.abs(start - end)

  if (start >= 3000 && end >= 3000) {
    return ('Después del milenio')
  }

  if (start >= 2010 && end >= 2010) {
    return ('Futuro')
  }

  if (end === 2020) {
    return `${absStart}${('-Futuro')}`
  }

  if (end === 1844) {
    return ('457 a.C. a 1844')
  }

  if (start === end) {
    return `${absStart}${start < 0 ? (' a.C') : ''}`
  }

  if (start < 0 && end < 0) {
    return `${absStart}-${absEnd} ${('a.C')}${
      range > 50 ? ` (${range})` : ''
    }`
  }

  if (start > 0 && end > 0) {
    return `${absStart}-${absEnd}${range > 50 ? ` (${range})` : ''}`
  }

  if (start < 0 && end > 0) {
    return `${absStart} ${('a.C')} ${('a')} ${end}${
      range > 50 ? ` (${range})` : ''
    }`
  }

  return start
}
