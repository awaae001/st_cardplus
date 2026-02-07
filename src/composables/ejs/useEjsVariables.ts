import { ref, computed } from 'vue';
import * as yaml from 'js-yaml';
import type { VariableNode, EditorError } from '@/types/ejs-editor';

export function useEjsVariables() {
  const yamlInput = ref('');
  const variableTree = ref<VariableNode[]>([]);
  const variableEditMode = ref<'yaml' | 'tree'>('yaml');
  const errors = ref<EditorError[]>([]);

  const currentStageVariables = computed(() => {
    return variableTree.value;
  });

  const flatVariables = computed(() => {
    const result: { id: string; readablePath: string; alias: string }[] = [];
    function traverse(nodes: VariableNode[], parentPath: string = '') {
      for (const node of nodes) {
        const currentReadablePath = parentPath ? `${parentPath}.${node.key}` : node.key;
        if (node.children && node.children.length > 0) {
          traverse(node.children, currentReadablePath);
        } else {
          result.push({
            id: node.path,
            readablePath: currentReadablePath,
            alias: node.key,
          });
        }
      }
    }
    traverse(currentStageVariables.value);
    return result;
  });

  function parseYamlInput(yamlText: string): VariableNode[] {
    try {
      errors.value = errors.value.filter((e) => e.type !== 'yaml');
      const parsed = yaml.load(yamlText) as any;
      return parseObjectToVariableTree(parsed);
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
      return [];
    }
  }

  function parseObjectToVariableTree(obj: any, parentPath: string = ''): VariableNode[] {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const node: VariableNode = {
        key,
        value: null,
        path: currentPath,
      };

      if (Array.isArray(value) && value.length <= 2) {
        node.value = value[0];
        node.description = value[1] || '';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        node.children = parseObjectToVariableTree(value, currentPath);
      } else {
        node.value = value;
      }
      return node;
    });
  }

  function variableTreeToPlainObject(nodes: VariableNode[]): any {
    const obj: any = {};
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        obj[node.key] = variableTreeToPlainObject(node.children);
      } else {
        if (node.description) {
          obj[node.key] = [node.value, node.description];
        } else {
          obj[node.key] = node.value;
        }
      }
    }
    return obj;
  }

  function customYamlGenerate(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';

    for (const [key, value] of Object.entries(obj)) {
      result += `${spaces}${key}:`;

      if (Array.isArray(value) && value.length <= 2) {
        result += ` [${value[0]}`;
        if (value[1]) {
          result += `, ${value[1]}`;
        }
        result += `]\n`;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `\n${customYamlGenerate(value, indent + 1)}`;
      } else {
        result += ` ${value}\n`;
      }
    }

    return result;
  }

  function generateYamlFromTree() {
    try {
      const plainObject = variableTreeToPlainObject(variableTree.value);
      const yamlString = customYamlGenerate(plainObject);
      yamlInput.value = yamlString;
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `YAML生成错误: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  }

  function importYamlVariables() {
    if (!yamlInput.value.trim()) {
      variableTree.value = [];
      return;
    }
    variableTree.value = parseYamlInput(yamlInput.value);
  }

  function addNode(parentId: string | null = null) {
    const newNode: VariableNode = {
      key: '新节点',
      value: '新值',
      path: `new_${Date.now()}_${Math.random()}`,
      description: '',
    };

    if (!parentId) {
      variableTree.value = [...variableTree.value, newNode];
    } else {
      const addRec = (nodes: VariableNode[]): VariableNode[] => {
        return nodes.map((node) => {
          if (node.path === parentId) {
            const newChildren = node.children ? [...node.children, newNode] : [newNode];
            return { ...node, children: newChildren };
          }
          if (node.children) {
            return { ...node, children: addRec(node.children) };
          }
          return node;
        });
      };
      variableTree.value = addRec(variableTree.value);
    }
    generateYamlFromTree();
  }

  function removeNode(path: string) {
    const removeRec = (nodes: VariableNode[]): VariableNode[] => {
      return nodes
        .filter((node) => node.path !== path)
        .map((node) => {
          if (node.children) {
            return { ...node, children: removeRec(node.children) };
          }
          return node;
        });
    };
    variableTree.value = removeRec(variableTree.value);
    generateYamlFromTree();
  }

  function updateNodeValue(path: string, newKey: string, newValue: any, newDescription?: string) {
    const updateRec = (nodes: VariableNode[]): VariableNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return { ...node, key: newKey, value: newValue, description: newDescription };
        }
        if (node.children) {
          return { ...node, children: updateRec(node.children) };
        }
        return node;
      });
    };
    variableTree.value = updateRec(variableTree.value);
    generateYamlFromTree();
  }

  function findFirstLeafVariable(nodes: VariableNode[]): VariableNode | null {
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        if (node.value !== null && node.value !== undefined) {
          return node;
        }
      } else {
        const found = findFirstLeafVariable(node.children);
        if (found) return found;
      }
    }
    return null;
  }

  function getReadablePath(
    node: VariableNode,
    nodes: VariableNode[] = variableTree.value,
    parentPath: string = ''
  ): string | null {
    for (const n of nodes) {
      const currentPath = parentPath ? `${parentPath}.${n.key}` : n.key;
      if (n.path === node.path) {
        return currentPath;
      }
      if (n.children) {
        const foundPath = getReadablePath(node, n.children, currentPath);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  }

  return {
    yamlInput,
    variableTree,
    variableEditMode,
    errors,
    currentStageVariables,
    flatVariables,
    importYamlVariables,
    addNode,
    removeNode,
    updateNodeValue,
    findFirstLeafVariable,
    getReadablePath,
    generateYamlFromTree,
  };
}
