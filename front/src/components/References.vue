<template>
  <el-dialog :title="loc('edit')" v-model="dialogVisible" @opened="onDialogOpened" width="30%">

    <el-row type="flex" justify="center">
      <el-space>

        <el-radio-group v-model="bib.reftype">
          <el-radio-button label="0">{{ loc('info') }}</el-radio-button>
          <el-radio-button label="1">{{ loc('heading') }}</el-radio-button>
          <el-radio-button label="2">{{ loc('fin') }}</el-radio-button>
        </el-radio-group>

      </el-space>
    </el-row>

    <el-row type="flex" justify="center">

      <el-select v-model="bib.authors" v-if="bib.reftype == 1" multiple filterable reserve-keyword
        :placeholder="loc('authors')">
        <el-option v-for="item in authors" :key="item.id" :label="store.getLabel(item)" :value="item.id">
        </el-option>
      </el-select>

    </el-row>

    <div v-if="bib.reftype == 2">

      <el-row type="flex" justify="center">{{ loc('pages') }}</el-row>

      <el-row type="flex" justify="center">
        <el-tag :key="entry" v-for="entry in pages" closable :disable-transitions="false" @close="removePage(entry)">
          {{ entry }}
        </el-tag>

        <el-input class="input-new-page" v-if="pageInputVisible" v-model="page" ref="pageInputRef" size="small"
          @keyup.enter="confirmPageInput" @blur="confirmPageInput">
        </el-input>

        <el-button v-else class="button-new-tag" size="small" @click="showPageInput">+
          {{ loc('add').toLowerCase() }}</el-button>

        <!-- <el-space> -->
        <!-- <el-input v-model="bib.text"><template #prepend>From</template></el-input>
<el-input v-model="bib.text"><template #prepend>To</template></el-input> -->
        <!-- <el-input v-model="bib.text"></el-input>
                <el-button type="primary" icon="el-icon-plus"></el-button> -->
        <!-- </el-space> -->
      </el-row>
    </div>

    <el-row type="flex" justify="center">

      <span v-if="bib.reftype == 0">{{ loc('record') }}</span>
      <span v-if="bib.reftype == 1">{{ loc('title') }}</span>
      <span v-if="bib.reftype == 2">{{ loc('ttldsc') }}</span>

    </el-row>

    <el-input v-model="bib.title" ref="titleInputRef"></el-input>

    <div v-if="bib.reftype == 2" style="margin-top:1rem;">
      <el-row type="flex" justify="center">{{ loc('cit') }}</el-row>
      <el-input v-model="bib.content" type="textarea"></el-input>
      <el-row type="flex" justify="center">
        <el-button size="small" @click="fixQuotes" style="margin-top:2px;">{{
    loc('quotmarks') }}</el-button>
      </el-row>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false;">{{ loc('cancel') }}</el-button>
        <el-button type="primary" v-if="bib.title || pages.length" @click="handleClose">{{ loc('save')
          }}</el-button>
      </span>
    </template>

  </el-dialog>

  <el-row type="flex" justify="center" v-if="!isEmbedded">
    <h3>{{ loc('bib') }}</h3>
  </el-row>

  <el-tree ref="treeRef" :data="refs" node-key="id" :props="{ label: 'title', disabled: 'children' }" default-expand-all
    :expand-on-click-node="false" :empty-text="loc('loading')" :show-checkbox="isEmbedded" :highlight-current="true"
    :check-on-click-node="true" :check-strictly="true">
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <el-dropdown v-if="!isEmbedded">
          <span>
            {{ getNodeLabel(node) }}
            <el-icon v-if="node?.data?.content"><el-icon-chat-dot-square /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="buildDialog(node, data, 1)">{{ loc('addsibling') }}</el-dropdown-item>
              <el-dropdown-item v-if="data.reftype != 2" @click="buildDialog(node, data, 2)">{{ loc('addchild')
                }}</el-dropdown-item>
              <el-dropdown-item @click="buildDialog(node, data)">{{ loc('edit') }}</el-dropdown-item>
              <el-dropdown-item v-if="!data?.children?.length" @click="removeNode(node, data)"><strong>{{ loc('delit')
                  }}</strong></el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-text v-else>
          {{ getNodeLabel(node) }}
          <el-icon v-if="node?.data?.content"><el-icon-chat-dot-square /></el-icon>
        </el-text>
      </span>
    </template>
  </el-tree>
</template>


<script setup lang="ts">

import { ref, reactive, onBeforeMount, toRaw, nextTick } from 'vue';
import store from '../store';
import { ElTree, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage, ElTooltip } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node'

interface Props {
  isEmbedded?: boolean,
  checks?: Array<number>,
}

const props = withDefaults(defineProps<Props>(), {
  isEmbedded: false,
  checks: () => [],
})

const scheme = { title: '', content: '', id: null, reftype: 0, pages: [], authors: [], parent: null };
const bib = reactive({} as IBib);
Object.assign(bib, scheme);
const dialogVisible = ref(false);
const refs: TNested = reactive([]);
const authors = ref([] as Array<IPerson>);
const pageInputVisible = ref(false);
const page = ref('');
const pages = ref([] as IBib["pages"]);
const action = ref(0);
let nodeRef = {} as Node;
let dataRef = {} as ITree;
const titleInputRef = ref<HTMLInputElement>();
const pageInputRef = ref<HTMLInputElement>();
const treeRef = ref<InstanceType<typeof ElTree>>();
const loc = store.loc;

onBeforeMount(async () => {
  const result = await store.getData('refs');
  if ('data' in result) {
    const bibData = result.data as Array<IBib>;
    const nested = store.nest(bibData.sort((a: IBib, b: IBib) => a.id.toString().localeCompare(b.id.toString())));
    // console.log("nest", nested);
    refs.push(...nested);
  }

  const personsData = await store.getData('persons');
  authors.value = personsData.data;
});

const buildDialog = (node: Node, data: ITree, actionType = 0) => {
  // console.log('node', node);
  nodeRef = node;
  dataRef = data;
  Object.assign(bib, actionType ? scheme : toRaw(data));
  action.value = actionType;
  pages.value = bib.pages?.length ? [...bib.pages] : [];
  nextTick(() => {
    dialogVisible.value = true;
    // console.log("bib on show", bib);
  });
};

const getNodeLabel = (node: Node) => {
  let result = '';
  if (node?.data?.pages?.length) {
    result += loc('pdot') + ' ' + node?.data?.pages?.join(', ') + (node.label && ' • ');
  }
  const prefix = (result.length + 1) || 0;
  // console.log(prefix, node.label);
  const suffix = node.data.content && 3;
  const len = prefix + node.label.length + suffix;
  const divWidth = (treeRef.value as any)?.$el.clientWidth / 9;
  result += len > divWidth ? node.label.slice(0, divWidth - prefix - suffix).trim() + '...' : node.label
  return result;
}

const handleClose = async () => {
  dialogVisible.value = false;

  // console.log('bib', bib);
  if (bib.reftype == 0) {
    // console.log('check 0');
    bib.authors = [];
    bib.content = '';
    bib.pages = [];
  } else if (bib.reftype == 1) {
    // console.log('check 1');
    bib.content = '';
    bib.pages = [];
  } else {
    bib.pages = pages.value.sort();
  }

  const datum = toRaw(bib) as keyable;
  // delete datum['children'];

  if (datum.id) {
    // console.log("UPDATE NODE", datum);
    for (let prop in datum) {
      nodeRef.data[prop] = datum[prop];
    }
    const result = await store.postData('refs', datum);
    if (!('data' in result && 'id' in result.data)) {
      console.log('error!');
    }
    // console.log(result);
  } else {
    // take id from server
    // console.log(action.value);
    // console.log("adding", (action.value == 2 ? "child": "neighbor"));
    const parent_id = nodeRef?.parent?.data?.id || null;

    if (action.value == 2) {
      // add child
      datum.parent = dataRef.id;
    } else {
      datum.parent = parent_id;
    }

    const result = await store.postData('refs', datum);
    // console.log(result);
    if ('data' in result && 'id' in result.data) {
      // console.log("id", result.data.id);
      datum.id = result.data.id;
      // datum.children = [];
      treeRef.value?.append({ ...datum }, datum.parent);
      //  if (action.value == 2) { // add child
      //    console.log("dataref", dataRef);
      //    dataRef?.children ? dataRef.children.push({...datum}) : dataRef.children = [{...datum}];
      //  } else { // add neighbor
      //    if (parent_id) {
      //      console.log("to parent");
      //      nodeRef.parent.data.children.push({...datum});
      //    } else {
      //      console.log("to root");
      //      refs.push({...datum});
      //    }
      // }
    } else {
      console.log('error!');
    }
  }
};

const showPageInput = () => {
  pageInputVisible.value = true;
  nextTick(() => {
    pageInputRef.value?.focus();
  });
};

const removePage = (entry: string) => {
  pages.value.splice(pages.value.indexOf(entry), 1);
};

const confirmPageInput = () => {
  if (page.value) {
    pages.value.push(page.value);
  }
  pageInputVisible.value = false;
  page.value = '';
};

const removeNode = async (node: Node, data: ITree) => {
  // console.log("delete!");
  if (data?.children?.length) {
    console.log('cannot delete non-empty node!');
    ElMessage({
      message: store.loc('warndelleaf'),
      type: 'warning',
      showClose: true,
      center: true,
    });
  } else {
    const result = await store.deleteById('refs', data.id);
    if ('data' in result && 'id' in result.data) {
      treeRef.value?.remove(node);
      // const parent = node.parent;
      // const children = parent.data.children || parent.data;
      // const index = children.findIndex(d => d.id === data.id);
      // children.splice(index, 1);
    }
  }
};

const renderNode = (h: Function, x: any) => {
  // console.log(x.data);
  // Because of "Non-function value encountered for default slot" warning, I wrapped everything in slot with a function
  // However, it might be not a proper way of handling slots
  let label = '';
  const labelStack = [];

  if (x.node?.data?.pages?.length) {
    label = store.loc('pdot') + ' ' + x.node?.data?.pages?.join(', ');
  }

  if (label && x.data.title) {
    label += ' • ';
  }

  const prefixLength = (x.node?.data?.authors?.length || 0) + x.node.level + label.length;

  let maxLabelLength = 50 - prefixLength;

  const labelArray = x.data.title.length > maxLabelLength ? [label + x.data.title, h(ElTooltip, { content: x.data.title }, () => [h('i', { class: 'el-icon-more indent', style: "color:#F56C6C" })])] : [label + x.data.title];

  labelStack.push(...labelArray);

  if (x.node?.data?.content) {
    labelStack.push(
      h(ElTooltip, { content: x.node.data.content }, () => [h('i', { class: 'el-icon-s-comment indent', style: "color:#409EFF" })])
    );
  }

  if (x.node?.data?.authors?.length) {
    labelStack.unshift(...Array(x.node.data.authors.length).fill(h('i', { class: 'el-icon-user-solid' })));
  }

  const spans = [h('span', { class: 'label' }, [labelStack])];

  if (!props.isEmbedded) {
    const dropitems = [
      h(ElDropdownItem, { onClick: () => buildDialog(x.node, x.data) }, () => store.loc('edit')),
      h(ElDropdownItem, { onClick: () => buildDialog(x.node, x.data, 1) }, () => store.loc('addsibling')),
    ];

    if (x.data.reftype != 2) {
      dropitems.push(
        h(ElDropdownItem, { onClick: () => buildDialog(x.node, x.data, 2) }, () => store.loc('addchild'))
      );
    }

    // if (!x.node?.data?.children?.length) {
    // if (!x.data?.children?.length) {
    dropitems.push(
      h(ElDropdownItem, { onClick: () => removeNode(x.node, x.data), divided: true }, () => [
        h('strong', store.loc('delit')),
      ])
    );
    // }

    const dropdown = h(ElDropdown, null, {
      default: () => [h('i', { class: 'el-icon-s-tools' }, 'Tools')],
      dropdown: () => [h(ElDropdownMenu, () => dropitems)],
    });
    spans.push(dropdown);
  }

  // if (!x.data?.children?.length) {
  //   spans.push(h('i',  {class: "el-icon-delete-solid"}));
  // }

  return h('span', { class: 'custom-tree-node' }, spans);
};

const fixQuotes = () => bib.content = store.curlify(bib.content);
const onDialogOpened = () => titleInputRef.value?.focus();
const getCheckedItems = () => treeRef.value!.getCheckedKeys();
const setCheckedItems = (keys: Array<number>) => treeRef.value!.setCheckedKeys(keys);

defineExpose({ getCheckedItems, setCheckedItems });

</script>

<style>
/* .custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
} */

.el-tag+.el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-page {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.indent {
  margin-left: 0.25rem;
}
</style>
