<template>

   <el-space direction="vertical">
  <div>
{{form.firstname}} {{form.lastname}} ● {{rights}}
  </div>
</el-space>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="firstname" label="Имя">
      <el-input placeholder="Имя" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname" label="Фамилия">
      <el-input placeholder="Фамилия" v-model="form.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="email" label="Эл. почта">
      <el-input placeholder="Эл. почта" v-model="form.email" class="text-input"></el-input>
    </el-form-item>

    <el-form-item>
      <el-radio-group v-model="form.sex">
        <el-radio :label="1">Мужчина</el-radio>
        <el-radio :label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-button type="primary" @click="confirm">Сохранить</el-button>


  </el-form>
</template>
<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";

export default defineComponent({
  name: "Profile",
  setup() {

    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const users = ref([]);
    const form = reactive({});
    Object.assign (form, store.state.user);
    const rights = store.state.options.filter (x => x.value === form.privs)[0]["label"];

    onBeforeMount(async() => {
      // console.log(store.state.user);
      const result = await store.getData("users");
      if("data" in result) {
        console.log(result.data);
          users.value = result.data;
      }
    });

    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if(valid) {
          // console.log("user form", form);
          const result = await store.postData("users", form);
          console.log(result);
          if("data" in result && "id" in result.data) {
            Object.assign (store.state.user, form);
          }
        } else{
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

    return { users, form, rules, confirm, rights, formRef, };
  }
});
</script>
