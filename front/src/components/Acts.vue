<template>
  <el-dialog :title="dialogData.caption" v-model="dialogData.visible" width="30%" :before-close="handleClose"
    @opened="onDialogOpened">
    <!-- <span>This is a message</span> -->
    <el-input ref="dialogInputRef" placeholder="" v-model="dialogData.text"
      @keyup.enter="onDialogClose(Boolean(dialogData.text))">
    </el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onDialogClose()">{{ loc('cancel') }}</el-button>
        <el-button type="primary" v-if="dialogData.text" @click="onDialogClose(true)">{{ loc('save') }}</el-button>
      </span>
    </template>
  </el-dialog>

  <el-row type="flex" justify="center">
    <h3>{{ loc('facttypes') }}</h3>
  </el-row>

  <el-tree :data="acts" node-key="id" :empty-text="loc('loading')" :props="{ label: 'title', }" default-expand-all
    :highlight-current="true" :allow-drop="allowDrop" @node-drop="handleDrop" draggable :expand-on-click-node="false">
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <el-dropdown>
          <span>
            {{ node.label }}
          </span>
          <!-- <el-icon>
                <el-icon-tools />
              </el-icon> -->
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="addItem(node, data)">{{ loc('addsibling') }}</el-dropdown-item>
              <el-dropdown-item @click="addItem(node, data, true)">{{ loc('addchild') }}</el-dropdown-item>
              <el-dropdown-item @click="renameItem(node, data)">{{ loc('rename') }}</el-dropdown-item>
              <el-dropdown-item v-if="!data?.children?.length" @click="removeItem(node, data)"><strong>{{ loc('delit')
              }}</strong></el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </span>

    </template>
  </el-tree>

  <el-row>
    <el-alert v-if="!allowDrop()" :title="loc('warnactsmove')" type="info">
    </el-alert>
  </el-row>
</template>

<script setup lang="ts">

import { ref, reactive, onBeforeMount } from 'vue';
import { ElForm } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node'
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode'
import type {
  AllowDropType,
  NodeDropType,
} from 'element-plus/es/components/tree/src/tree.type'
import store from '../store';

const form = reactive({ title: '', year: '', selectedWorks: [], selectedEditors: [], selectedAuthors: [] });
const dialogData = reactive({ visible: false, text: '', caption: '', func: () => { }, id: 0 });
const dialogInputRef = ref<HTMLInputElement>();
const acts: TNested = reactive([]);

onBeforeMount(async () => {
  const result = await store.getData('acts');
  if ('data' in result) {
    const actsData = result.data as Array<IAct>;
    const nested = store.nest(actsData.sort((a, b) => b.id - a.id));
    // console.log("nest", nested);
    acts.push(...nested);
  }
});

// const handleDragStart = (node, ev) => {
//     console.log('drag start', node);
// };
// const handleDragEnter = (draggingNode, dropNode, ev) => {
//     console.log('tree drag enter: ', dropNode.label);
// };
// const handleDragLeave = (draggingNode, dropNode, ev) => {
//     console.log('tree drag leave: ', dropNode.label);
// };
// const handleDragOver = (draggingNode, dropNode, ev) => {
//     console.log('tree drag over: ', dropNode.label);
// };
// const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
//     console.log('tree drag end: ', dropNode && dropNode.label, dropType);
// };
const handleDrop = async (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  // console.log('tree drop: ', dropNode.label, dropNode.data.id);
  // console.log("dropType", dropType);
  // console.log("dropNode", dropNode);
  // console.log("draggingNode", draggingNode.label, draggingNode.data.id);
  // console.log(`${draggingNode.label}  ${draggingNode.data.id} ${dropType} ${dropNode.label} ${dropNode.data.id}`);

  const parent_id = dropType === 'inner' ? dropNode.data.id : dropNode.data.parent;
  const result = await store.postData('acts', {
    id: draggingNode.data.id,
    title: draggingNode.label,
    parent: parent_id,
  });
  // console.log(result);
  if (!('data' in result && 'id' in result.data)) {
    console.log('error!');
  }
};
// const allowDrop = (draggingNode, dropNode, type) => {
//     if (dropNode.data.label === 'Level two 3-1') {
//       return type !== 'inner';
//     } else {
//       return true;
//     }
// };
// const allowDrag = (draggingNode) => {
// return draggingNode.data.label.indexOf('Level three 3-1-1') === -1;
// return true;
// };

const addItem = (node: Node, datum: ITree, childmode?: boolean) => {
  // console.log(node, datum);
  dialogData.visible = true;
  dialogData.caption = store.loc(childmode ? 'addchild' : 'addsibling');
  dialogData.id = datum.id;
  dialogData.func = async function () {
    // console.log('!!', node, datum);
    const parent_id = node?.parent?.data?.id || null;
    // console.log('parent', node?.parent?.data?.id, parent_id);
    // console.log('acts', { title: dialogData.text, parent: parent_id });
    const result = await store.postData('acts', {
      title: dialogData.text,
      parent: childmode ? datum.id : parent_id,
    });
    // console.log(result);
    if (!('data' in result && 'id' in result.data)) {
      console.log('error!');
    } else {
      const newChild = { id: result.data.id, title: dialogData.text, children: [] } as ITree;
      if (childmode) {
        // console.log('childmode');
        if (!datum.children) {
          datum.children = [];
        }
        datum.children.push(newChild);
      } else {
        if (parent_id) {
          // console.log('push1');
          node.parent.data.children.push(newChild);
        } else {
          // console.log('push2', newChild);
          acts.push(newChild);
        }
      }
      dialogData.text = '';
    }
  };
};

const renameItem = (node: Node, datum: ITree) => {
  // console.log(node, datum);
  dialogData.visible = true;
  dialogData.caption = store.loc('rename') + ' «' + datum.title + '»';
  dialogData.id = datum.id;
  dialogData.func = async () => {
    const parent = node.parent;
    const children = parent.data.children || parent.data;
    const index = children.findIndex((d: any) => d.id === datum.id);
    children[index].title = dialogData.text;
    const result = await store.postData('acts', { title: dialogData.text, id: datum.id });
    // console.log(result);

    if ('data' in result && 'id' in result.data) {
      dialogData.text = '';
    } else {
      console.log('error!');
    }
  };
};

const removeItem = async (node: Node, datum: ITree) => {
  // console.log(node, datum);
  if (datum?.children?.length) {
    console.log('cannot delete non-empty slot!');
  } else {
    const result = await store.deleteById('acts', datum.id);
    if ('data' in result && 'id' in result.data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d: any) => d.id === datum.id);
      children.splice(index, 1);
    }
  }
};

const onDialogClose = (val?: boolean) => {
  // console.log("close", e);
  dialogData.visible = false;
  if (val === true) {
    dialogData.func();
  }
};

const handleClose = (done: () => void) => {
  onDialogClose();
};


const onDialogOpened = () => {
  dialogInputRef.value?.focus();
};

const allowDrop = () => store?.state?.user?.privs && store.state.user.privs < 5;


const loc = store.loc;

</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
