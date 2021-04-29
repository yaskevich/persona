<template>
<el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
  <el-form-item prop="title">
    <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
  </el-form-item>

  <el-form-item prop="published">
    <el-input placeholder="Год" v-model.number="form.published" class="text-input"></el-input>
  </el-form-item>

<el-form-item>
  <el-select
      v-model="form.works"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Произведение"

      :remote-method="getWorks"
      :loading="loading">
      <el-option
        v-for="item in worksAll"
        :key="item.id"
        :label="item.title"
        :value="item.id">
      </el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
  <el-select
      v-model="form.editors"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Редакторы"
      :remote-method="getEditors"
      :loading="loading">
      <el-option
        v-for="item in editorsAll"
        :key="item.id"
        :label="item.value"
        :value="item.id">
      </el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
  <!-- <el-select
      v-model="form.selectedAuthors"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Авторы"
      :remote-method="getAuthors"
      :loading="loading">
      <el-option
        v-for="item in authors"
        :key="item.id"
        :label="item.value"
        :value="item.id">
      </el-option>
    </el-select>  -->
  </el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>

</el-form>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";
import router from "../router";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    // const form  = reactive({ title: '', published: '', works: [], editors: [], selectedAuthors: []});
    const form  = reactive({ title: '', published: '', editors: [], works: [], });
    const worksAll = ref([]);
    let persons = [];
    const loading = ref(false);
    const editorsAll = ref([]);
    // const authors = ref([]);

    onBeforeMount(async() => {
      const personsData = await store.getData("persons");
      persons = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      editorsAll.value  = persons;
      // authors.value  = persons;

      const worksData = await store.getData("works");
      worksAll.value  = worksData.data;
    });
    const getWorks = async(query) => {
      console.log(query);
      const re  = new RegExp(query, "i");
      loading.value = true;

      const worksData = await store.getData("works");
      worksAll.value = worksData.data.filter(x => re.test(x.title));
      loading.value = false;
    };

    const getEditors = (query) => {
      console.log(query);
      const re  = new RegExp(query, "i");
      loading.value = true;
      editorsAll.value = persons.filter(x => re.test(x.value));
      loading.value = false;
    };

    // const getAuthors = (query) => {
    //   console.log(query);
    //   const re  = new RegExp(query, "i");
    //   loading.value = true;
    //   authors.value = persons.filter(x => re.test(x.value));
    //   loading.value = false;
    // };

    const resetForm = () => {
      formRef.value?.resetFields();
    };

    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if (valid) {
          // console.log("form", form);
          const result = await store.postData("books", form);
          console.log(result);
          if(!("data" in result && "id" in result.data)) {
            console.log("error!");
          } else {
            router.push("/books")
          }
        }  else{
          return false;
        }
      });
    };

    const  rules = {
      title: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      published: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, type: 'integer', trigger: 'blur' }
      ],
    };

    return {
      // getAuthors,
      // authors,
      editorsAll,
      getEditors,
      getWorks,
      loading,
      resetForm,
      confirm,
      formRef,
      rules,
      form,
      worksAll
    };
  },
});
</script>
