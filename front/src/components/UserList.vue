<template>
  <MainTitle title="Пользователи" :callback="confirm"></MainTitle>

  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true">
    <el-form-item prop="firstname">
      <el-input placeholder="Имя" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname">
      <el-input placeholder="Фамилия" v-model="form.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="email">
      <el-input placeholder="Эл. почта" v-model="form.email" class="text-input"></el-input>
    </el-form-item>

    <el-form-item>
      <el-radio-group v-model="form.sex">
        <el-radio label="1">Мужчина</el-radio>
        <el-radio label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-button icon="el-icon-delete" circle @click="resetForm"></el-button>
    <!-- <el-button type="primary" @click="confirm">Добавить</el-button> -->
  </el-form>
<div style="margin-top:2rem;"></div>
  <el-row v-for="(value, key) in users"  :gutter="20" :key="key">
    <el-col :span="4"><div class="grid-content bg-purple"><i :class="value.sex === 1 ? 'el-icon-male' : 'el-icon-female'"></i> {{value.firstname}}</div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple">{{value.lastname}}</div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple-light">{{options.filter(x => x.value === value.privs)[0]["label"].split('(')[0]}}</div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple">
      <router-link :to="'/user/' + value.id">
      <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
    </router-link>
    </div>
    </el-col>
    <el-col :span="4">
      <div v-if="me.id === value.id" class="grid-content">
        <i class="el-icon-check"></i>
      </div>
      <div v-else>
        <div v-if="value.activated" class="grid-content bg-purple-light"><el-button type="danger" @click="switchUserStatus(value)">Отключить</el-button></div>
        <div v-else class="grid-content bg-purple-light"><el-button @click="switchUserStatus(value)">Активировать</el-button></div>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { ElForm, ElMessageBox,   } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";
import MainTitle from './MainTitle.vue';

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const form  = reactive({ firstname: '', lastname: '', email: '', sex : '2', privs: 5 });
    const users = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("users");
      // if (response.data && Object.keys(response.data).length) {
      if("data" in result) {
        users.push(...result.data.sort((a, b) => b.id - a.id));
      }
    });

    const switchUserStatus = async(user) => {
      console.log(user);
      user.activated  = !user.activated;
      const result = await store.postData("users", user);
      console.log(result);
    };

    const resetForm = () => {
      formRef.value?.resetFields();
    };

    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if (valid) {
          // do
          console.log("ok send", form);
          // return false;
          const result = await store.initUser(form);
          console.log(result);
          if("data" in result && "message" in result.data) {
            ElMessageBox({
                  message: result.data.message,
                  title: `Пароль для пользователя ${form.firstname} ${form.lastname} `,
                  type: "success",
                  showClose: true,
                  center: true
                });
          }
          users.unshift({...form});
          formRef.value?.resetFields();
        }  else{
          console.log("form not valid");
          return false;
        }
      });
    };

    const  rules = {
      firstname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      lastname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
       email: [
           { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
         { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] }
       ]
    };

    return {
      switchUserStatus,
      resetForm,
      confirm,
      formRef,
      rules,
      form,
      users,
      options: store.state.options,
      me: store.state.user,
    };
  },
  components: {
    MainTitle,
  }
});
</script>
