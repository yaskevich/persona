<template>
  <div>
    Произведения
  </div>
  <el-form :model="form" :ref="setFormRef" label-width="100px" :rules="rules">
    <el-input placeholder="Название" v-model="form.title" class="text-input" prop="title"></el-input>
    <el-button type="primary" @click="confirm">Добавить</el-button>
  </el-form>
</template>

<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive } from 'vue';

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();
    const setFormRef = (el: InstanceType<typeof ElForm>) => {
      formRef.value = el;
    };

    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate((valid) => {
        if (valid) {
          // do
        }
      });
    };
    const form  = reactive({ title: ''});
    const  rules = {
      title: [
        { required: true, message: 'Please input Activity name', trigger: 'blur' },
        { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
      ],
    };

    return {
      setFormRef,
      resetForm,
      confirm,
      formRef,
      rules,
      form
    };
  },
});
</script>
