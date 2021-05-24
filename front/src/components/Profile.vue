<template>

   <el-space direction="vertical">
  <div v-if="rights">
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

    <el-form-item prop="sex">
      <el-radio-group v-model="form.sex">
        <el-radio :label="1">Мужчина</el-radio>
        <el-radio :label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-alert v-if="infoAlert"
    :title="infoAlert"
    :center="true"
    type="error"
    effect="dark">
  </el-alert>
    <el-button v-else type="primary" @click="confirm">{{isRegistered?"Сохранить": "Отправить заявку"}}</el-button>


  </el-form>
</template>
<script lang="ts">
import { ElForm, ElMessageBox,   } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance, h } from 'vue';
import store from "../store";

export default defineComponent({
  name: "Profile",
  setup() {

    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const users = ref([]);
    const form = reactive({});
    const isRegistered = ref(Boolean(Object.keys(store.state.user).length));
    let rights;
    const infoAlert = ref('');

    if (isRegistered.value) {
        Object.assign (form, store.state.user);
        rights = store.state.options.filter (x => x.value === form.privs)[0]["label"];
    }

    onBeforeMount(async() => {
      // console.log(store.state.user);
      if (isRegistered.value) {
        const result = await store.getData("users");
        if("data" in result) {
          console.log(result.data);
            users.value = result.data;
        }
      }
    });

    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if(valid) {
          if(isRegistered.value){
            const result = await store.postData("users", form);
            if("data" in result && "id" in result.data) {
              Object.assign (store.state.user, form);
            }
          } else {
            const result = await store.initUser(form);
            if("data" in result) {
              if ("error" in result.data) {
              infoAlert.value = result.data.error;
            } else if ("message" in result.data) {
              ElMessageBox({
                    message: h('div', null, [
                      h('p', null, [h('span', null, 'После одобрения заявки модератором Вы получите доступ к интерфейсу редактирования по паролю')]),
                      h('p', null, [h('b', { style: 'color: teal' }, result.data.message)]),
                    ]),
                    title: "Заявка отправлена",
                    type: "success",
                    showClose: true,
                    center: true
                  });
              formRef.value?.resetFields();
            }
          }
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
         { type: 'email', message: 'Введите корректный адрес электронной почты', trigger: ['blur', 'change'] }
       ],
       sex: [
           { required: true, message: 'Выберите пол', trigger: 'change' }
       ]
    };

    return { users, form, rules, confirm, rights, formRef, isRegistered, infoAlert, };
  }
});
</script>
