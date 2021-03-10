<template>
<el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
  <el-form-item prop="title">
    <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
  </el-form-item>

  <el-form-item prop="genre">
    <el-input placeholder="Год" v-model="form.year" class="text-input"></el-input>
  </el-form-item>

<el-form-item>
  <el-select
      v-model="selectedWorks"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Произведение"
      :remote-method="getWorks"
      :loading="loading">
      <el-option
        v-for="item in works"
        :key="item.id"
        :label="item.title"
        :value="item.title">
      </el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
  <el-select
      v-model="selectedEditors"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Редакторы"
      :remote-method="getEditors"
      :loading="loading">
      <el-option
        v-for="item in editors"
        :key="item.id"
        :label="item.value"
        :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
  <el-select
      v-model="selectedEditors"
      multiple
      filterable
      remote
      reserve-keyword
      placeholder="Авторы"
      :remote-method="getEditors"
      :loading="loading">
      <el-option
        v-for="item in editors"
        :key="item.id"
        :label="item.value"
        :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>

</el-form>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import axios from 'axios';

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const works = ref([]);
    let persons = [];
    const loading = ref(false);
    const selectedWorks = ref([]);
    const selectedEditors = ref([]);
    const editors = ref([]);

    onBeforeMount(async() => {
      axios.get('/api/get/persons')
      .then((response) => {
        console.log(response.data);
        persons = response.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
        console.log(persons);
        editors.value  = persons;
      })
      axios.get('/api/get/works').then((response) => {
        // console.log(response.data);
        works.value  = response.data;
      })
    });
    const getWorks = (query) => {
      console.log(query);
      const re  = new RegExp(query, "i");
      loading.value = true;
      axios.get('/api/get/works').then((response) => {
        // console.log(response.data);
        // works.value  = response.data;
        works.value = response.data.filter(x => re.test(x.title));
      })
      loading.value = false;
    };

    const getEditors = (query) => {
      console.log(query);
      const re  = new RegExp(query, "i");
      loading.value = true;
      editors.value = persons.filter(x => re.test(x.value));

      loading.value = false;
    };

    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate((valid) => {
        if (valid) {
          // do
          console.log("here");
          // return false;

          // axios.post('/api/work/add', form)
          //   .then(function (response) {
          //     console.log(response);
          //     works.unshift({...form});
          //     formRef.value?.resetFields();
          //   })
          //   .catch(function (error) {
          //     console.log(error);
          //   });

        }  else{
          return false;
        }
      });
    };
    const form  = reactive({ title: '', genre: ''});
    const  rules = {
      title: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      genre: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
    };

    return {
      editors,
      selectedEditors,
      getEditors,
      selectedWorks,
      getWorks,
      loading,
      resetForm,
      confirm,
      formRef,
      rules,
      form,
      works
    };
  },
});
</script>
