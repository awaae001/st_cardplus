<template>
  <div class="template-editor">
    <div v-if="initError" class="error-container">
      <el-alert 
        title="编辑器初始化失败" 
        :description="initError" 
        type="error"
        :closable="false"
        class="mb-4"
      />
      <el-button @click="retryInit" type="primary">重新初始化</el-button>
    </div>
    <div v-else class="editor-container" ref="editorContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, onErrorCaptured } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import { ElAlert, ElButton } from 'element-plus'

const store = useEjsEditorStore()
const editorContainer = ref<HTMLElement>()
const editorView = ref<EditorView>()
const isUpdatingFromStore = ref(false)
const isUpdatingFromEditor = ref(false)
const isEditorLocked = ref(false) // 编辑器锁定状态，防止并发更新
const debounceTimer = ref<NodeJS.Timeout | null>(null)
const initError = ref<string>('')
const updateQueue = ref<string[]>([]) // 更新队列
const isProcessingQueue = ref(false) // 队列处理状态
const lastSuccessfulUpdate = ref('') // 最后一次成功更新的内容
const errorRecoveryCount = ref(0) // 错误恢复计数
const maxRecoveryAttempts = 3 // 最大恢复尝试次数

// 错误捕获
onErrorCaptured((err, _instance, info) => {
  console.error('TemplateEditor 组件错误:', err, info)
  initError.value = `组件错误: ${err.message}`
  return false // 阻止错误向上传播
})

// 初始化编辑器的函数
async function initializeEditor() {
  try {
    initError.value = ''
    
    await nextTick()

    if (!editorContainer.value) {
      throw new Error('编辑器容器未找到')
    }

    // 创建编辑器状态
    const startState = EditorState.create({
      doc: store.ejsTemplate || '',
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        keymap.of([
          {
            key: 'Ctrl-s',
            preventDefault: true,
            run: () => {
              console.log('保存快捷键触发')
              return true
            }
          },
          {
            key: 'Ctrl-g',
            preventDefault: true,
            run: () => {
              store.generateEjsTemplate()
              return true
            }
          },
          {
            key: 'F5',
            preventDefault: true,
            run: () => {
              store.generateEjsTemplate()
              return true
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isUpdatingFromStore.value && !isEditorLocked.value && !isProcessingQueue.value) {
            if (debounceTimer.value) clearTimeout(debounceTimer.value)
            
            debounceTimer.value = setTimeout(() => {
              try {
                // 严格检查所有状态，确保安全更新
                if (!isUpdatingFromStore.value && !isEditorLocked.value && !isProcessingQueue.value && editorView.value) {
                  isUpdatingFromEditor.value = true
                  const newValue = update.state.doc.toString()
                  if (newValue !== store.ejsTemplate) {
                    store.ejsTemplate = newValue
                    store.previewCode = newValue
                  }
                }
              } catch (error) {
                console.error('编辑器内容同步失败:', error)
              } finally {
                isUpdatingFromEditor.value = false
              }
            }, 300) // 增加防抖延迟，避免频繁更新
          }
        })
      ]
    })

    // 创建编辑器视图
    editorView.value = new EditorView({
      state: startState,
      parent: editorContainer.value
    })
    
    console.log('CodeMirror 编辑器初始化成功')
    lastSuccessfulUpdate.value = store.ejsTemplate || ''
    errorRecoveryCount.value = 0
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误'
    console.error('CodeMirror 初始化失败:', error)
    initError.value = `初始化失败: ${errorMsg}`
  }
}

// 重试初始化
function retryInit() {
  isEditorLocked.value = true
  isUpdatingFromStore.value = true
  
  if (editorView.value) {
    editorView.value.destroy()
    editorView.value = undefined
  }
  
  initializeEditor()
  
  setTimeout(() => {
    isUpdatingFromStore.value = false
    isEditorLocked.value = false
  }, 100)
}

onMounted(() => {
  initializeEditor()
})

onUnmounted(() => {
  // 停止所有异步操作
  isEditorLocked.value = true
  isProcessingQueue.value = true
  updateQueue.value = []
  
  if (editorView.value) {
    editorView.value.destroy()
  }
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})

// 队列化处理编辑器更新，避免并发冲突
async function processUpdateQueue() {
  if (isProcessingQueue.value || updateQueue.value.length === 0) {
    return
  }
  
  isProcessingQueue.value = true
  
  try {
    // 取最后一个更新值，避免处理过期的更新
    const newValue = updateQueue.value.pop()
    updateQueue.value = [] // 清空队列
    
    if (newValue !== undefined && editorView.value && !isUpdatingFromEditor.value) {
      const currentDoc = editorView.value.state.doc.toString()
      
      if (newValue !== currentDoc) {
        isUpdatingFromStore.value = true
        
        try {
          // 直接使用 dispatch 来处理更新，让 CodeMirror 内部处理状态
          // 这样可以从根本上避免因状态过时而导致的 RangeError
          editorView.value.dispatch({
            changes: {
              from: 0,
              to: editorView.value.state.doc.length,
              insert: newValue || ''
            }
          })
          lastSuccessfulUpdate.value = newValue || ''
          errorRecoveryCount.value = 0 // 重置错误计数
        } catch (error) {
          console.error('CodeMirror 状态更新失败:', error)
          errorRecoveryCount.value++
          
          if (errorRecoveryCount.value <= maxRecoveryAttempts) {
            console.log(`第 ${errorRecoveryCount.value} 次尝试恢复编辑器状态`)
            // 更新失败，尝试安全重建
            await safeRecreateEditor(newValue || '')
          } else {
            console.error('编辑器恢复失败次数过多，停止尝试')
            initError.value = '编辑器状态恢复失败，请刷新页面重试'
          }
        } finally {
          isUpdatingFromStore.value = false
        }
      }
    }
  } catch (error) {
    console.error('处理更新队列失败:', error)
  } finally {
    isProcessingQueue.value = false
    
    // 如果队列中还有待处理的更新，继续处理
    if (updateQueue.value.length > 0) {
      setTimeout(processUpdateQueue, 50)
    }
  }
}

// 监听 store 中的模板变化，加入更新队列
watch(
  () => store.ejsTemplate,
  (newValue) => {
    // 如果编辑器被锁定或正在从编辑器更新，跳过
    if (isEditorLocked.value || isUpdatingFromEditor.value) {
      return
    }
    
    // 将更新加入队列
    updateQueue.value.push(newValue || '')
    
    // 异步处理队列，避免阻塞
    nextTick(() => {
      processUpdateQueue()
    })
  },
  { flush: 'post' } // 使用 post 模式，在DOM更新后执行
)

// 安全地重新创建编辑器
async function safeRecreateEditor(content: string) {
  if (isEditorLocked.value) {
    console.warn('编辑器已被锁定，跳过重建')
    return // 已经在重建中，避免重复操作
  }
  
  console.log('开始安全重建编辑器，内容长度:', content.length)
  
  isEditorLocked.value = true
  isUpdatingFromStore.value = true
  isProcessingQueue.value = true
  
  // 清空更新队列，避免在重建期间的冲突
  updateQueue.value = []
  
  try {
    await nextTick() // 等待当前更新周期完成
    recreateEditor(content)
    lastSuccessfulUpdate.value = content
    console.log('编辑器重建成功')
  } catch (error) {
    console.error('安全重建编辑器失败:', error)
    errorRecoveryCount.value++
    initError.value = `重建失败 (${errorRecoveryCount.value}/${maxRecoveryAttempts}): ${error instanceof Error ? error.message : '未知错误'}`
    
    // 如果重建失败且有上次成功的内容，尝试回退
    if (lastSuccessfulUpdate.value && lastSuccessfulUpdate.value !== content) {
      console.log('尝试回退到上次成功的内容')
      setTimeout(() => {
        try {
          recreateEditor(lastSuccessfulUpdate.value)
        } catch (rollbackError) {
          console.error('回退失败:', rollbackError)
        }
      }, 500)
    }
  }
}

// 重新创建编辑器的函数
function recreateEditor(content: string) {
  if (!editorContainer.value) {
    isEditorLocked.value = false
    isUpdatingFromStore.value = false
    return
  }
  
  try {
    // 销毁旧编辑器
    if (editorView.value) {
      editorView.value.destroy()
      editorView.value = undefined
    }
    
    // 创建新的编辑器状态
    const startState = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        keymap.of([
          {
            key: 'Ctrl-s',
            preventDefault: true,
            run: () => {
              console.log('保存快捷键触发')
              return true
            }
          },
          {
            key: 'Ctrl-g',
            preventDefault: true,
            run: () => {
              store.generateEjsTemplate()
              return true
            }
          },
          {
            key: 'F5',
            preventDefault: true,
            run: () => {
              store.generateEjsTemplate()
              return true
            }
          }
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isUpdatingFromStore.value && !isEditorLocked.value && !isProcessingQueue.value) {
            if (debounceTimer.value) clearTimeout(debounceTimer.value)
            
            debounceTimer.value = setTimeout(() => {
              try {
                // 严格检查所有状态，确保安全更新
                if (!isUpdatingFromStore.value && !isEditorLocked.value && !isProcessingQueue.value && editorView.value) {
                  isUpdatingFromEditor.value = true
                  const newValue = update.state.doc.toString()
                  if (newValue !== store.ejsTemplate) {
                    store.ejsTemplate = newValue
                    store.previewCode = newValue
                  }
                }
              } catch (error) {
                console.error('编辑器内容同步失败:', error)
              } finally {
                isUpdatingFromEditor.value = false
              }
            }, 300) // 增加防抖延迟，避免频繁更新
          }
        })
      ]
    })

    // 创建新的编辑器视图
    editorView.value = new EditorView({
      state: startState,
      parent: editorContainer.value
    })
    
    console.log('CodeMirror 编辑器重新创建成功')
    lastSuccessfulUpdate.value = content
    errorRecoveryCount.value = 0 // 重置错误计数
  } catch (error) {
    console.error('重新创建 CodeMirror 编辑器失败:', error)
  } finally {
    // 重新创建完成后解锁编辑器
    setTimeout(() => {
      isUpdatingFromStore.value = false
      isEditorLocked.value = false
      isProcessingQueue.value = false
      // 处理可能积累的更新
      if (updateQueue.value.length > 0) {
        setTimeout(processUpdateQueue, 100)
      }
    }, 150)
  }
}
</script>

<style scoped>
.template-editor {
  flex: 1;
  position: relative;
  min-height: 0;
}

.editor-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.error-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--el-bg-color);
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

/* CodeMirror 样式优化 */
:deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
}

:deep(.cm-focused) {
  outline: none;
}

:deep(.cm-scroller) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>