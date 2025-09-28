/**
 * 智能正则表达式生成器
 * 基于用户的文本选择自动生成正则表达式和替换字符串
 */

import { ref, computed, unref, type MaybeRef } from 'vue'

export interface TextSelection {
  type: 'anchor' | 'variable' | 'start' | 'end'
  text: string
  startIndex: number
  endIndex: number
}

export interface RegexGenerationResult {
  regex: string
  replaceString: string
  groupCount: number
  isValid: boolean
}

export function useSmartRegexGenerator(originalText: MaybeRef<string>) {
  const selections = ref<TextSelection[]>([])

  /**
   * 转义正则表达式中的特殊字符
   */
  const escapeRegexSpecialChars = (text: string): string => {
    // 转义特殊字符但保留空白模式
    return text
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+')
      .replace(/\n/g, '\\s*\\n\\s*')
  }

  /**
   * 生成正则表达式
   */
  const generateRegex = computed((): RegexGenerationResult => {
    if (selections.value.length === 0) {
      return {
        regex: '',
        replaceString: '',
        groupCount: 0,
        isValid: false
      }
    }

    try {
      let regexPattern = ''
      let replaceString = ''
      let lastIndex = 0
      let groupIndex = 1

      // 按位置排序选择
      const sortedSelections = [...selections.value].sort((a, b) => a.startIndex - b.startIndex)

      const currentText = unref(originalText)

      // 找到起始符和终止符的位置
      const startSelection = sortedSelections.find(sel => sel.type === 'start')
      const endSelection = sortedSelections.find(sel => sel.type === 'end')

      // 确定实际的处理范围
      const actualStartIndex = startSelection ? startSelection.startIndex : 0
      const actualEndIndex = endSelection ? endSelection.endIndex : currentText.length

      // 先处理起始符（如果存在）
      if (startSelection) {
        regexPattern = '^' + escapeRegexSpecialChars(startSelection.text)
        replaceString += startSelection.text
        lastIndex = startSelection.endIndex
      } else {
        lastIndex = actualStartIndex
      }

      sortedSelections.forEach((selection) => {
        // 跳过起始符和终止符以及范围外的选择
        if (selection.type === 'start' || selection.type === 'end' ||
            selection.startIndex < actualStartIndex || selection.endIndex > actualEndIndex) {
          return
        }

        // 添加选择之前的文本（仅在处理范围内）
        const beforeText = currentText.substring(lastIndex, selection.startIndex)
        if (beforeText) {
          const escapedBefore = escapeRegexSpecialChars(beforeText)
          regexPattern += escapedBefore
          replaceString += beforeText
        }

        // 处理选择的部分
        if (selection.type === 'anchor') {
          // 锚点文本应该精确匹配
          const escapedAnchor = escapeRegexSpecialChars(selection.text)
          regexPattern += escapedAnchor
          replaceString += selection.text
        } else if (selection.type === 'variable') {
          // 变量文本应该被捕获
          regexPattern += '(.*?)'
          replaceString += `$${groupIndex}`
          groupIndex++
        }

        lastIndex = selection.endIndex
      })

      // 处理终止符之前的剩余文本
      if (endSelection) {
        // 如果有终止符，添加到终止符开始位置的文本
        if (lastIndex < endSelection.startIndex) {
          const remainingText = currentText.substring(lastIndex, endSelection.startIndex)
          if (remainingText) {
            const escapedRemaining = escapeRegexSpecialChars(remainingText)
            regexPattern += escapedRemaining
            replaceString += remainingText
          }
        }
        // 然后添加终止符本身
        const escapedEnd = escapeRegexSpecialChars(endSelection.text)
        regexPattern += escapedEnd
        replaceString += endSelection.text
      } else if (!startSelection) {
        // 如果既没有终止符也没有起始符，添加剩余文本
        const remainingText = currentText.substring(lastIndex)
        if (remainingText) {
          const escapedRemaining = escapeRegexSpecialChars(remainingText)
          regexPattern += escapedRemaining
          replaceString += remainingText
        }
      }

      // 检查是否有end类型的选择，如果有就添加$结束符
      const hasEndSelection = sortedSelections.some(sel => sel.type === 'end')
      if (hasEndSelection && !regexPattern.endsWith('$')) {
        regexPattern += '$'
      }

      // 构建完整的正则表达式
      const fullRegex = `/${regexPattern}/s`

      // 验证生成的正则表达式是否有效
      let isValid = true
      try {
        new RegExp(regexPattern, 's')
      } catch {
        isValid = false
      }

      return {
        regex: fullRegex,
        replaceString,
        groupCount: groupIndex - 1,
        isValid
      }
    } catch (error) {
      console.error('Error generating regex:', error)
      return {
        regex: '',
        replaceString: '',
        groupCount: 0,
        isValid: false
      }
    }
  })

  /**
   * 添加选择
   */
  const addSelection = (selection: TextSelection) => {
    // 检查start和end类型只能各有一个
    if (selection.type === 'start') {
      const existingStart = selections.value.find(sel => sel.type === 'start')
      if (existingStart) {
        throw new Error('只能选择一个起始位置')
      }
    }

    if (selection.type === 'end') {
      const existingEnd = selections.value.find(sel => sel.type === 'end')
      if (existingEnd) {
        throw new Error('只能选择一个终止位置')
      }
    }

    // 检查是否有重叠
    const hasOverlap = selections.value.some(sel =>
      (selection.startIndex >= sel.startIndex && selection.startIndex < sel.endIndex) ||
      (selection.endIndex > sel.startIndex && selection.endIndex <= sel.endIndex) ||
      (selection.startIndex <= sel.startIndex && selection.endIndex >= sel.endIndex)
    )

    if (hasOverlap) {
      throw new Error('选择区域不能重叠')
    }

    selections.value.push(selection)
    selections.value.sort((a, b) => a.startIndex - b.startIndex)
  }

  /**
   * 移除选择
   */
  const removeSelection = (index: number) => {
    if (index >= 0 && index < selections.value.length) {
      selections.value.splice(index, 1)
    }
  }

  /**
   * 清除所有选择
   */
  const clearSelections = () => {
    selections.value = []
  }

  /**
   * 预览替换结果
   */
  const previewReplace = computed(() => {
    const result = generateRegex.value
    const currentText = unref(originalText)
    if (!result.isValid || !result.regex) {
      return currentText
    }

    try {
      // 移除首尾的斜杠和标志
      const regexMatch = result.regex.match(/^\/(.*)\/([gimsy]*)$/)
      if (!regexMatch) return currentText

      const pattern = regexMatch[1]
      const flags = regexMatch[2]
      const regex = new RegExp(pattern, flags)

      return currentText.replace(regex, result.replaceString)
    } catch {
      return currentText
    }
  })

  /**
   * 获取选择的统计信息
   */
  const selectionStats = computed(() => {
    const anchors = selections.value.filter(s => s.type === 'anchor').length
    const variables = selections.value.filter(s => s.type === 'variable').length
    const starts = selections.value.filter(s => s.type === 'start').length
    const ends = selections.value.filter(s => s.type === 'end').length
    return { anchors, variables, starts, ends, total: selections.value.length }
  })

  /**
   * 验证选择是否合理
   */
  const validateSelections = computed(() => {
    const issues: string[] = []

    if (selections.value.length === 0) {
      issues.push('没有选择任何文本区域')
    }

    const hasStart = selectionStats.value.starts > 0
    const hasEnd = selectionStats.value.ends > 0

    if (selectionStats.value.variables === 0 && selectionStats.value.anchors > 0 && !hasStart && !hasEnd) {
      issues.push('建议至少选择一个变量区域以便进行替换')
    }

    // 检查起始符和终止符的位置关系
    const startSelection = selections.value.find(sel => sel.type === 'start')
    const endSelection = selections.value.find(sel => sel.type === 'end')

    if (startSelection && endSelection && startSelection.startIndex >= endSelection.endIndex) {
      issues.push('起始符必须在终止符之前')
    }

    // 如果有起始符或终止符，检查其他选择是否在合理范围内
    if (hasStart || hasEnd) {
      const startIndex = startSelection?.startIndex ?? 0
      const endIndex = endSelection?.endIndex ?? unref(originalText).length

      const invalidSelections = selections.value.filter(sel =>
        sel.type !== 'start' && sel.type !== 'end' &&
        (sel.startIndex < startIndex || sel.endIndex > endIndex)
      )

      if (invalidSelections.length > 0) {
        issues.push('存在选择超出了起始符和终止符的范围')
      }
    }

    // 检查选择覆盖率（考虑起始符和终止符的限制）
    const currentText = unref(originalText)
    const actualStartIndex = startSelection?.startIndex ?? 0
    const actualEndIndex = endSelection?.endIndex ?? currentText.length
    const effectiveTextLength = actualEndIndex - actualStartIndex

    const totalSelectedLength = selections.value
      .filter(sel => sel.startIndex >= actualStartIndex && sel.endIndex <= actualEndIndex)
      .reduce((sum, sel) => sum + (sel.endIndex - sel.startIndex), 0)

    const coverageRatio = effectiveTextLength > 0 ? totalSelectedLength / effectiveTextLength : 0

    if (coverageRatio < 0.2 && !hasStart && !hasEnd) {
      issues.push('选择覆盖的文本较少，可能无法准确匹配')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  })

  return {
    selections,
    generateRegex,
    addSelection,
    removeSelection,
    clearSelections,
    previewReplace,
    selectionStats,
    validateSelections
  }
}