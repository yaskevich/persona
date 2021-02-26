<template>
  <div>
    Произведения
  </div>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="title">
      <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="genre">
      <el-input placeholder="Тип" v-model="form.genre" class="text-input"></el-input>
    </el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>
  </el-form>

  <el-row v-for="(value, key) in works"  :gutter="20" :key="key">
    {{value.title}} // {{value.genre}}
  </el-row>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();

    const works = reactive([]);

    onBeforeMount(async() => {
      axios.get('/api/person/list').then((response) => {
        console.log(response.data);
        works.push(...response.data);
      })
    })


    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate((valid) => {
        if (valid) {
          // do
          console.log("here");
          // return false;

          axios.post('/api/work/add', form)
            .then(function (response) {
              console.log(response);
              persons.push(form);
            })
            .catch(function (error) {
              console.log(error);
            });

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
