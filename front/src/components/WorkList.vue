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
    <el-col :span="12"><div class="grid-content bg-purple">
      {{value.title}}
    </div></el-col>
    <el-col :span="12"><div class="grid-content bg-purple-light">
      {{value.genre}}
    </div></el-col>
  </el-row>
</template>

<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

    const works = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("works");
      if("data" in result) {
        works.push(...result.data);
      }
    });


    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if (valid) {
          const result = await store.postData("works", form);
          console.log(result);
          if("data" in result && "id" in result.data) {
            works.unshift({...form});
            formRef.value?.resetFields();
          }
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

<style>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
