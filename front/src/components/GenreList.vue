<template>

  <MainTitle title="Жанры" :callback="confirm"></MainTitle>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true">
    <el-form-item prop="title">
      <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
    </el-form-item>
  </el-form>
  <el-row v-for="(value, key) in genres" :gutter="20" :key="key">
    <el-col :span="24">
      <div class="grid-content bg-purple">
        {{value.title}}
      </div>
    </el-col>
  </el-row>

</template>

<script lang="ts">

  import { defineComponent, reactive, ref, onBeforeMount, ComponentPublicInstance } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const genres = reactive([]);
      const form  = reactive({ title: '' });
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

      onBeforeMount(async () => {
        const result = await store.getData('genres');
        if ('data' in result) {
          genres.push(...result.data);
        }
      });

      const confirm = () => {
        formRef.value?.validate(async(valid) => {
          if (valid) {
            console.log("form", form);
            const result = await store.postData("genres", form);
            console.log(result);
            if(!("data" in result && "id" in result.data)) {
              console.log("error!");
            } else {
              console.log("ok");
              genres.unshift({...form});
              // form.title = '';
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
      };

      return {
        genres,
        confirm,
        form,
        rules,
        formRef,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
