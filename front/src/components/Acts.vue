<template>
  <el-dialog
  :title="dialogData.caption"
  v-model="dialogData.visible"
  width="30%"
  :before-close="handleClose"
  @opened="onDialogOpened">
    <!-- <span>This is a message</span> -->
    <el-input
          ref="dialogInputRef"
          placeholder=""
          v-model="dialogData.text"
          @keyup.enter="handleClose(Boolean(dialogData.text))"
          >
       </el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Отмена</el-button>
        <el-button type="primary" v-if="dialogData.text" @click="handleClose(true)">Сохранить</el-button>
      </span>
    </template>
  </el-dialog>

  Типы событий
  <el-tree
    :data="data"
    node-key="id"
    default-expand-all
    @node-drag-start="handleDragStart"
    @node-drag-enter="handleDragEnter"
    @node-drag-leave="handleDragLeave"
    @node-drag-over="handleDragOver"
    @node-drag-end="handleDragEnd"
    @node-drop="handleDrop"
    draggable
    :allow-drop="allowDrop"
    :allow-drag="allowDrag"
    :expand-on-click-node="false"
    style="max-width:350px;"
    >
    <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span>{{ node.label }}</span>
         <span>
           <el-dropdown >
             <i class="el-icon-s-tools"></i>
             <template #dropdown>
               <el-dropdown-menu>
                 <el-dropdown-item @click="addItem(node, data)">Добавить соседний пункт</el-dropdown-item>
                 <el-dropdown-item @click="addChild(node, data)">Добавить вложенный пункт</el-dropdown-item>
                 <el-dropdown-item @click="renameItem(node, data)">Переименовать</el-dropdown-item>
                 <el-dropdown-item v-if="!data.children" @click="removeItem(node, data)"><strong>Удалить данный пункт</strong></el-dropdown-item>
               </el-dropdown-menu>
             </template>
           </el-dropdown>
         </span>
       </span>
     </template>
  </el-tree>
  <el-button type="primary" @click="confirm">Сохранить</el-button>
</template>


<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const form  = reactive({ title: '', year: '', selectedWorks: [], selectedEditors: [], selectedAuthors: []});
    const dialogData = reactive({ visible: false, text: "", caption: "", func: null, id: 0 });
    const dialogInputRef = ref(null);
    // const works = ref([]);
    // let persons = [];
    // const loading = ref(false);
    // const editors = ref([]);
    // const authors = ref([]);

    onBeforeMount(async() => {
      // const personsData = await store.getData("persons");
      // persons = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      // editors.value  = persons;
      // authors.value  = persons;
      //
      // const worksData = await store.getData("works");
      // works.value  = worksData.data;
    });


    // const getWorks = async(query) => {
    //   console.log(query);
    //   const re  = new RegExp(query, "i");
    //   loading.value = true;
    //
    //   const worksData = await store.getData("works");
    //   works.value = worksData.data.filter(x => re.test(x.title));
    //   loading.value = false;
    // };


    const handleDragStart = (node, ev) => {
        console.log('drag start', node);
    };

    const handleDragEnter = (draggingNode, dropNode, ev) => {
        console.log('tree drag enter: ', dropNode.label);
    };
    const handleDragLeave = (draggingNode, dropNode, ev) => {
        console.log('tree drag leave: ', dropNode.label);
    };
    const handleDragOver = (draggingNode, dropNode, ev) => {
        console.log('tree drag over: ', dropNode.label);
    };
    const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
        console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    };
    const handleDrop = (draggingNode, dropNode, dropType, ev) => {
        console.log('tree drop: ', dropNode.label, dropType);
    };
    const allowDrop = (draggingNode, dropNode, type) => {
        if (dropNode.data.label === 'Level two 3-1') {
          return type !== 'inner';
        } else {
          return true;
        }
    };
    const allowDrag = (draggingNode) => {
        return draggingNode.data.label.indexOf('Level three 3-1-1') === -1;
    };
    const confirm =() => {
      console.log("data", data);
      console.log(JSON.stringify(data));
    };

    let data = reactive([
      {
         label: 'Корреспонденция', id: 1,
         children: [
           { label: 'Исходящая', id: 2 },
           { label: 'Входящая', id: 3 }
         ]
      },
      {
         label: 'Личная жизнь', id: 4,
         children: [
           { label: 'Путешествия', id: 5 },
           { label: 'Семья', id: 6 }
         ]
      },
    ]);

    const addItem = (node, datum) => {
      console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = "Добавить соседний пункт";
      dialogData.id = node.id;
      dialogData.func = function() {
        const newChild = { id: id++, label: dialogData.text, children: [] };
        if (!datum.children) {
          datum.children = [];
        }
        if(node?.parent?.data?.children) {
          node.parent.data.children.push(newChild);
        } else {
          data.push(newChild);
        }
      };
    };

    let id = 1000;

    const addChild = (node, datum) => {
      // console.log(node, datum);
      dialogData.visible = true;
      dialogData.id = node.id;
      dialogData.caption = "Добавить вложенный пункт";
      dialogData.func = function() {
        const newChild = { id: id++, label: dialogData.text, children: [] };
        if (!datum.children) {
          datum.children = [];
        }
        datum.children.push(newChild);
      };
    };

    const renameItem = (node, datum) => {
      // console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = `Переименовать пункт «${datum.label}»`;
      dialogData.id = node.id;
      dialogData.func = function() {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === datum.id);
        children[index].label = dialogData.text;
      };
    };

    const removeItem = (node, datum) => {
      // console.log(node, datum);
      if(datum.children) {
        console.log("cannot delete non-empty slot!");
      } else {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === datum.id);
        children.splice(index, 1);
      }
    };

    const handleClose = (e) => {
      // console.log("close", e);
      dialogData.visible = false;
      if (e === true) {
        dialogData.func();
        dialogData.text = "";
      }
    };

    const onDialogOpened = () => {
      dialogInputRef.value.focus();
    }

    return {
      onDialogOpened,
      confirm,
      handleDragStart,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDragEnd,
      handleDrop,
      allowDrop,
      allowDrag,
      data,
      defaultProps: {
          children: 'children',
          label: 'label'
        },
      formRef,
      form,
      addItem,
      addChild,
      renameItem,
      removeItem,
      dialogData,
      handleClose,
      dialogInputRef,
    };
  },
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
</style>
