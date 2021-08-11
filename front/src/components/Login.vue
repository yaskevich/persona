<template>

  <el-form label-width="120px" ref="formRef" :model="user" :inline="true" :rules="rules">
    <el-form-item prop="email">
      <el-input placeholder="E-mail" v-model="user.email"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" :placeholder="loc('pswd')" v-model="user.password" autocomplete="off"></el-input>
    </el-form-item>
    <el-button type="primary" @click="confirm">{{loc('login')}}</el-button>
    <div class="error">{{error}}</div>
  </el-form>

</template>

<script lang="ts">

  import { defineComponent, ref, reactive, ComponentPublicInstance } from 'vue';
  import { ElForm } from 'element-plus';
  import store from '../store';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      let user = reactive({ email: '', password: '' });
      const error = ref('');

      // const resetForm = () => {
      //   formRef.value?.resetFields();
      // };
      const confirm = async () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            // console.log('ok send', user);
            // return false;
            error.value = await store.doLogin(user);
            // if(!error.value) {
            //     // formRef.value?.resetFields();
            // }
          } else {
            console.log('not valid');
            return false;
          }
        });
      };

      const rules = {
        email: [
          { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
          { type: 'email', message: store.loc('fieldemail'), trigger: ['blur', 'change'] },
        ],
        password: [
          { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
          { min: 18, message: store.loc('pswdmore'), trigger: 'blur' },
        ],
      };

      return {
        formRef,
        confirm,
        user,
        rules,
        error,
        loc: store.loc,
      };
    },
  });

</script>

<style scoped>

  .error {
    color: red;
  }

</style>
