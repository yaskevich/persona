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

  Библиография
  <el-tree
    :data="refs"
    node-key="id"
    :props="{ label: 'title', }"
    default-expand-all
    :expand-on-click-node="false"
    style="max-width:500px;"
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
                 <el-dropdown-item @click="addItem(node, data, true)">Добавить вложенный пункт</el-dropdown-item>
                 <el-dropdown-item @click="renameItem(node, data)">Редактировать</el-dropdown-item>
                 <!-- <el-dropdown-item v-if="!data?.children?.length" @click="removeItem(node, data)"><strong>Удалить этот пункт</strong></el-dropdown-item> -->
               </el-dropdown-menu>
             </template>
           </el-dropdown>
         </span>
       </span>
     </template>
  </el-tree>
</template>


<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const form  = reactive({ title: '', year: '', selectedWorks: [], selectedEditors: [], selectedAuthors: [] });
    const dialogData = reactive({ visible: false, text: "", caption: "", func: null, id: 0 });
    const dialogInputRef = ref(null);
    const refs = reactive([]);

    // const refs =  [
    //           {
    //              title: 'Полное собрание сочинений', id: 1,
    //              children: [
    //                { title: 'Том 8', id: 2, children: [
    //                  { title: 'Часть 1', id: 6,  children: [
    //                    { title: 'М.: СЛОВО/SLOVO, 2004 г.', id: 13, children: [
    //                       { title: 'C. 115', id: 14 }
    //                    ] }
    //                  ]
    //                }
    //                ]
    //                },
    //              ]
    //           },
    //           {
    //              title: 'Уч. зап. Тартус. гос. ун-та. Труды по рус. и слав. фил. IX. Литературоведение.', id: 4,
    //              children: [
    //                { title: 'Вып. 184', id: 6, children: [{ title: 'C. 284', id: 24 }] }
    //              ]
    //           },
    //
    //         ];

    // const loading = ref(false);


    onBeforeMount(async() => {
      const result = await store.getData("refs");
      if("data" in result) {
        const nested = store.nest(result.data)
        // console.log("nest", nested);
        refs.push(...nested);
      }
    });

    const addItem = (node, datum, childmode) => {
      console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = `Добавить ${childmode? 'вложенный' : 'соседний'} пункт`;
      dialogData.id = datum.id;
      dialogData.func = async function() {
        console.log("!!", node, datum);
        const parent_id = node?.parent?.data?.id || null;
        console.log("parent", node?.parent?.data?.id, parent_id);
        console.log(("refs", { "title":  dialogData.text, "parent": parent_id }));
        const result = await store.postData("refs", { "title":  dialogData.text, "parent": childmode? datum.id : parent_id });
        console.log(result);
        if(!("data" in result && "id" in result.data)) {
          console.log("error!");
        } else {
          const newChild = { id: result.data.id, title: dialogData.text, children: [] };
          if(childmode){
            console.log("childmode");
            if(!datum.children) {
              datum.children = [];
            }
            datum.children.push(newChild);
          } else{
            if(parent_id) {
              console.log("push1");
              node.parent.data.children.push(newChild);
            } else{
              console.log("push2", newChild);
              refs.push(newChild);
            }
          }
          dialogData.text = "";
        }
      };
    };

    const renameItem = (node, datum) => {
      // console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = `Переименовать «${datum.title}»`;
      dialogData.id = datum.id;
      dialogData.func = async() =>  {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === datum.id);
        children[index].title = dialogData.text;
        const result = await store.postData("refs", { "title": dialogData.text, "id": datum.id, });
        console.log(result);

        if(("data" in result && "id" in result.data)) {
          dialogData.text = "";
        } else {
          console.log("error!");
        }
      };
    };

    const removeItem = async(node, datum) => {
      // console.log(node, datum);
      if(datum.children.length) {
        console.log("cannot delete non-empty slot!");
      } else {
        const result = await store.deleteById("refs", datum.id);
        if("data" in result && "id" in result.data){
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === datum.id);
          children.splice(index, 1);
        }
      }
    };

    const handleClose = (e) => {
      // console.log("close", e);
      dialogData.visible = false;
      if (e === true) {
        dialogData.func();
      }
    };

    const onDialogOpened = () => {
      dialogInputRef.value.focus();
    };

    return {
      onDialogOpened,
      formRef,
      form,
      addItem,
      renameItem,
      removeItem,
      dialogData,
      handleClose,
      dialogInputRef,
      refs,
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
</style>
