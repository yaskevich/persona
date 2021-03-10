<template>
  <el-form label-width="120px" ref="formRef" :model="user" :inline="true" :rules="rules">
    <el-form-item prop="email">
      <el-input placeholder="E-mail" v-model="user.email"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" placeholder="Пароль" v-model="user.password" autocomplete="off"></el-input>
    </el-form-item>
    <el-button type="primary" @click="confirm">Войти</el-button>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    let user = reactive({email: '', password: ''});

    // const resetForm = () => {
    //   formRef.value?.resetFields();
    // };
    const confirm = async () => {
      formRef.value?.validate(async(valid) => {

        if (valid) {
          // do
          console.log("ok send", user);
          // return false;
          const err  = await store.doLogin(user);
          if(!err) {
              // formRef.value?.resetFields();
          }
          console.log(store.state);
        }  else{
          console.log("not valid");
          return false;
        }
      });
    };


    const  rules = {
      email: [
          { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] }
      ],
      password: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 18, message: 'Не менее 18 символов', trigger: 'blur' }
      ],
    };


    return { formRef, confirm, user, rules };
  },
});
</script>
