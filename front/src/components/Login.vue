<template>
  <el-form label-width="120px" ref="formRef" :model="user" :inline="true" :rules="rules">
    <el-form-item prop="email">
      <el-input placeholder="E-mail" v-model="user.email"></el-input>
    </el-form-item>
    <el-form-item prop="pwd">
      <el-input type="password" placeholder="Пароль" v-model="user.pwd" autocomplete="off"></el-input>
    </el-form-item>
    <el-button type="primary" @click="confirm">Войти</el-button>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();
    let user = reactive({email: '', pwd: ''});

    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate((valid) => {

        if (valid) {
          // do
          console.log("ok send", user);
          // return false;

          axios.post('/api/user/login', form)
            .then(function (response) {
              // formRef.value?.resetFields();
              console.log("login result", response);
            })
            .catch(function (error) {
              console.log(error);
            });

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
      pwd: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 18, message: 'Не менее 18 символов', trigger: 'blur' }
      ],
    };


    return { formRef, confirm, user, rules };
  },
});
</script>
