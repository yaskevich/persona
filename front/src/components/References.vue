<template>
  <el-dialog
  title="Редактировать"
  v-model="dialogVisible"
  @opened="onDialogOpened"
  width="30%">

  <el-row type="flex" justify="center">
    <el-space>

      <el-radio-group v-model="bib.reftype">
        <el-radio-button label="0">Сведения</el-radio-button>
        <el-radio-button label="1">Заглавие</el-radio-button>
        <el-radio-button label="2">Финаль</el-radio-button>
      </el-radio-group>

    </el-space>
  </el-row>

    <el-row type="flex" justify="center">

      <el-select
        v-model="bib.authors"
        v-if="bib.reftype==1"
        multiple
        filterable
        reserve-keyword
        placeholder="Авторы"
        >
        <el-option
          v-for="item in authors"
          :key="item.id"
          :label="item.value"
          :value="item.id">
        </el-option>
      </el-select>

    </el-row>

    <div v-if="bib.reftype==2">

      <el-row type="flex" justify="center">Страницы</el-row>

      <el-row type="flex" justify="center">
      <el-tag
        :key="entry"
        v-for="entry in pages"
        closable
        :disable-transitions="false"
        @close="removePage(entry)">
      {{entry}}
      </el-tag>

      <el-input
        class="input-new-page"
        v-if="pageInputVisible"
        v-model="page"
        ref="pageInputRef"
        size="mini"
        @keyup.enter="confirmPageInput"
        @blur="confirmPageInput">
      </el-input>

      <el-button v-else class="button-new-tag" size="small" @click="showPageInput">+ добавить</el-button>


      <!-- <el-space> -->
        <!-- <el-input v-model="bib.text"><template #prepend>С</template></el-input>
        <el-input v-model="bib.text"><template #prepend>По</template></el-input> -->
        <!-- <el-input v-model="bib.text"></el-input>
        <el-button type="primary" icon="el-icon-plus"></el-button> -->
      <!-- </el-space> -->
    </el-row>
    </div>

    <el-row type="flex" justify="center">

      <span v-if="bib.reftype==0">Запись</span>
      <span v-if="bib.reftype==1">Название</span>
      <span v-if="bib.reftype==2">Название-описание</span>

    </el-row>

    <el-input v-model="bib.title" ref="titleInputRef"></el-input>

    <div v-if="bib.reftype==2" style="margin-top:1rem;">
      <el-row type="flex" justify="center">Цитата</el-row>
      <el-input v-model="bib.content" type="textarea"></el-input>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false;">Отмена</el-button>
        <el-button type="primary" v-if="bib.title||pages.length" @click="handleClose(true)">Сохранить</el-button>
      </span>
    </template>

  </el-dialog>

  <el-row type="flex" justify="center" v-if="!isEmbedded">
    <h3>Библиографические записи</h3>
  </el-row>

  <el-tree
    ref="treeRef"
    :data="refs"
    node-key="id"
    :props="{ label: 'title', disabled: 'children'}"
    default-expand-all
    :expand-on-click-node="false"
    style="max-width:500px;"
    empty-text="..."
    :show-checkbox="isEmbedded"
    :check-on-click-node="true"
    :check-strictly="true"
    :render-content="renderNode"
    >
    <!-- <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span v-html="( node?.data?.pages?.length ? 'С. ' + node?.data?.pages?.join(', ') + ' • ' : '' ) + node.label + ( node?.data?.content ? '&nbsp;<i class=el-icon-s-comment></i>' : '' )"></span>
         <span v-if="!isEmbedded">
           <el-dropdown >
             <i class="el-icon-s-tools"></i>
             <template #dropdown>
               <el-dropdown-menu>
                 <el-dropdown-item @click="buildDialog(node, data, 1)">Добавить соседний пункт</el-dropdown-item>
                 <el-dropdown-item v-if="data.reftype != 2" @click="buildDialog(node, data, 2)">Добавить вложенный пункт</el-dropdown-item>
                 <el-dropdown-item @click="buildDialog(node, data)">Редактировать</el-dropdown-item>
                 <el-dropdown-item v-if="!data?.children?.length" @click="removeItem(node, data)"><strong>Удалить этот пункт</strong></el-dropdown-item>
               </el-dropdown-menu>
             </template>
           </el-dropdown>
         </span>
       </span>
     </template> -->
  </el-tree>
</template>


<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, toRaw, nextTick } from 'vue';
import store from "../store";
import { ElDropdown,  ElDropdownMenu, ElDropdownItem, ElMessage,  } from 'element-plus';

export default defineComponent({
  name: "References",
  props: {
    isEmbedded: Boolean,
    checks: Array,
  },
  setup(props) {
    const scheme  = { title: "", content: "", id: null, reftype: 0, pages: [], authors: [], parent: null };
    const bib = reactive({});
    Object.assign(bib, scheme);
    const dialogVisible  = ref(false);
    const refs = reactive([]);
    const authors = ref([]);
    const pageInputVisible = ref(false);
    const page = ref('');
    const pages = ref([]);
    const action  = ref(0);
    let nodeRef = {};
    let dataRef = {};
    const titleInputRef = ref(null);
    const pageInputRef  = ref(null);
    const treeRef  = ref(null);

    onBeforeMount(async() => {
      const result = await store.getData("refs");
      if("data" in result) {
        const nested = store.nest(result.data.sort((a, b) => a.id.toString().localeCompare(b.id.toString())));
        // console.log("nest", nested);
        refs.push(...nested);
      }

      const personsData = await store.getData("persons");
      authors.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
    });

    const buildDialog = (node, data, actionType) => {
      console.log("node", node);
      nodeRef = node;
      dataRef = data;
      Object.assign(bib, (actionType ? scheme: toRaw(data)));
      action.value = actionType;
      pages.value  = bib.pages?.length ? [...bib.pages] : [];
      nextTick(() => {
        dialogVisible.value = true;
        // console.log("bib on show", bib);
      })

    };

    const handleClose = async(e) => {
      console.log("close", e);
      dialogVisible.value = false;

      console.log("bib", bib);
      if (bib.reftype == 0) {
        console.log("check 0");
        bib.authors = null;
        bib.content = null;
        bib.pages = [];
      } else if (bib.reftype == 1) {
        console.log("check 1");
        bib.content = null;
        bib.pages = [];
      } else {
        bib.pages = pages.value;
      }

      const datum = toRaw(bib);
      // delete datum['children'];

      if (datum.id) {
        // console.log("UPDATE NODE", datum);
        for (let prop in datum) {
          nodeRef.data[prop] = datum[prop];
        }
        const result = await store.postData("refs", datum);
        if(!("data" in result && "id" in result.data)) {
          console.log("error!");
        }
        // console.log(result);
      } else {
        // take id from server
        // console.log(action.value);
        // console.log("adding", (action.value == 2 ? "child": "neighbor"));
        const parent_id = nodeRef?.parent?.data?.id || null;

        if (action.value == 2) { // add child
          datum.parent = dataRef.id;
        } else {
          datum.parent = parent_id;
        }

        const result = await store.postData("refs", datum);
        // console.log(result);
        if("data" in result && "id" in result.data) {
          // console.log("id", result.data.id);
          datum.id = result.data.id;
          // datum.children = [];
          treeRef.value.append({...datum}, datum.parent);
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
          console.log("error!");
        }
      }
    };

    const showPageInput = () => {
        pageInputVisible.value = true;
        nextTick(() => {
            pageInputRef.value.focus();
        })
    };

    const removePage = (entry) => {
      pages.value.splice(pages.value.indexOf(entry), 1);
    };

    const confirmPageInput = () => {
        if (page.value) {
          pages.value.push(page.value);
        }
        pageInputVisible.value = false;
        page.value = '';
    };

    const removeNode = async(node, data) => {
      // console.log("delete!");
      if(data?.children?.length) {
        console.log("cannot delete non-empty node!");
        ElMessage({
              message: "Нельзя удалить пункт с вложенными элементами",
              type: "warning",
              showClose: true,
              center: true
            });
      } else {
        const result = await store.deleteById("refs", data.id);
        if("data" in result && "id" in result.data){
          treeRef.value.remove(node);
          // const parent = node.parent;
          // const children = parent.data.children || parent.data;
          // const index = children.findIndex(d => d.id === data.id);
          // children.splice(index, 1);
        }
      }
    };

    const renderNode = (h, x) => {
      // console.log(x.data);
      // Because of "Non-function value encountered for default slot" warning, I wrapped everything in slot with a function
      // However, it might be not a proper way of handling slots
      let label  = '';
      const labelStack = [];

      if (x.node?.data?.pages?.length){
        label = 'С. ' + x.node?.data?.pages?.join(', ');
      }

      if (label && x.data.title){
        label += ' • ';
      }

      label += x.data.title;

      labelStack.push(label);

      if (x.node?.data?.content) {
        labelStack.push (h('i',  {class: "el-icon-s-comment indent"}));
      }

      if (x.node?.data?.authors?.length){
        labelStack.unshift(
          ...Array(x.node.data.authors.length).fill(h('i',  {class: "el-icon-user-solid"}))
        );
      }

      const spans  = [h('span', { class: "label" ,  }, [labelStack])];

      if (!props.isEmbedded) {

        const dropitems = [
          h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data)}, () => 'Редактировать'),
          h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data, 1)}, () => 'Добавить соседний пункт')
        ];

        if (x.data.reftype != 2) {
          dropitems.push(h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data, 2)}, () => 'Добавить вложенный пункт'))
        }

        // if (!x.node?.data?.children?.length) {
        // if (!x.data?.children?.length) {
        dropitems.push(h(ElDropdownItem, { onClick: () => removeNode(x.node, x.data), divided:true }, () => [h('strong', 'Удалить этот пункт')]))
        // }

        const dropdown =  h(ElDropdown, null, {
          default:  () =>  [ h('i',  {class: "el-icon-s-tools"}) ],
          dropdown: () =>  [ h(ElDropdownMenu,  () => dropitems ) ]
        });
        spans.push(dropdown)
      }

      // if (!x.data?.children?.length) {
      //   spans.push(h('i',  {class: "el-icon-delete-solid"}));
      // }

      return h('span', { class: "custom-tree-node" ,  }, spans)

    };

    const onDialogOpened = () => {
      titleInputRef.value.focus();
    };

    const getCheckedItems = () => {
      return treeRef.value.getCheckedKeys();
    };

    const setCheckedItems = (keys) => {
      return treeRef.value.setCheckedKeys(keys);
    };

    return {
      setCheckedItems,
      getCheckedItems,
      treeRef,
      onDialogOpened,
      titleInputRef,
      pageInputRef,
      renderNode,
      dialogVisible,
      confirmPageInput,
      removePage,
      page,
      pages,
      pageInputVisible,
      showPageInput,
      buildDialog,
      bib,
      handleClose,
      refs,
      authors,
    };
  }
});
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
  .el-tag + .el-tag {
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
 .indent{
   margin-left: .25rem;
 }
</style>
