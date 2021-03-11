<template>
  <div>
    Пользователи
  </div>
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

  <el-form-item>
    <el-select v-model="form.privs" placeholder="Select" value-key>
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>
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
    const form  = reactive({ firstname: '', lastname: '', email: '', sex : '2', privs: 1 });
    const users = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("users");
      // if (response.data && Object.keys(response.data).length) {
      if("data" in result) {
        users.push(...result.data);
        form.privs = 5;
      }
    });

    const options = [{
          value: 1,
          label: 'Администратор (жрец)'
        }, {
          value: 3,
          label: 'Модератор (воин)'
        }, {
          value: 5,
          label: 'Редактор (крестьянин)'
        }
      ];

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
      options,
      resetForm,
      confirm,
      formRef,
      rules,
      form,
      users
    };
  },
});
</script>
<style scoped>
.text-input{
  width: 10rem;
  margin-right:1rem;
}
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
   /* min-height: 36px; */
 }
 .row-bg {
   padding: 10px 0;
   background-color: #f9fafc;
 }
 .full-width{
   display: block;
   width: 100%;
 }
</style>
