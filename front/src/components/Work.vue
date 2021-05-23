<template>
  <div>Произведение</div>
  <el-form :model="work" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="title">
      <el-input placeholder="Название" v-model="work.title" class="text-input"></el-input>
    </el-form-item>
    <el-form-item prop="genre">
      <el-input placeholder="Тип" v-model="work.genre" class="text-input"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="setDefaultAuthor" v-if="persons.length && mainperson">Автор – {{persons.filter(x=>x.id === mainperson)[0].value}}</el-button>
    <el-select
        v-model="work.authors"
        filterable
        multiple
        placeholder="Персоны"
        >
        <el-option
          v-for="item in persons"
          :key="item.id"
          :label="item.value"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <!-- <el-button type="primary" @click="resetForm">Очистить</el-button> -->
    <el-space wrap>
    <el-button type="primary" @click="confirm">Сохранить</el-button>
    <el-button type="danger" @click="deleteWork" v-if="work.id">Удалить</el-button>
    </el-space>
  </el-form>
</template>

<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';
import router from "../router";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

    const work  = ref({});
    const works = reactive([]);
    const mainperson = ref();
    const persons = ref([]);
    const vuerouter = useRoute();
    const id = vuerouter.params.id;

    onBeforeMount(async() => {
      console.log("router id", id);
      if (id) {
        const result = await store.getData("works", id);
        if("data" in result) {
          work.value = result.data[0];
          console.log("this work", work.value);
        }
      }

      const resultWorks = await store.getData("works");
      if("data" in resultWorks) {
        works.push(...resultWorks.data);
      }

      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const settingsData = await store.getData("settings");
      mainperson.value = settingsData.data[0].persona;
    });

    // const resetForm = () => {
    //   formRef.value?.resetFields();
    // };

    const setDefaultAuthor = () => {
      work.value.authors = [mainperson.value];
    };

    const confirm = () => {
      formRef.value?.validate(async(valid) => {
        if (valid) {
          const result = await store.postData("works", work.value);
          console.log(result);
          if(!("data" in result && "id" in result.data)) {
            console.log("error!");
          } else {
            // console.log("go to /works");
            router.push("/works")
          }
        }  else{
          return false;
        }
      });
    };

    const deleteWork = async () => {
      // console.log(work.value.id);
      const result = await store.deleteById("works", work.value.id);
      if("data" in result && "id" in result.data){
        router.push("/works")
      }
    };

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
      // resetForm,
      setDefaultAuthor,
      confirm,
      formRef,
      rules,
      work,
      works,
      persons,
      mainperson,
      deleteWork,
    };
  },
});

</script>
