<template>

  <MainTitle title="Издания" :callback="confirm"></MainTitle>

  <el-row v-for="(value, key) in books" :gutter="20" :key="key">
    <el-col :span="16">
      <div class="grid-content bg-purple">
        {{value.title}}
        <span v-for="(id, index) in value.editors" :key="index" style="font-style:italic;font-size: .7rem;">
          <span v-if="index">,</span> {{persons.filter(x=>x.id === id).map(x=>x.value).shift() }}
        </span>

      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        {{value.published}}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/book/' + value.id">
          <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

  </el-row>

</template>

<script lang="ts">

  import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
  import { ElForm } from 'element-plus';
  import router from '../router';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const books = reactive([]);
      const persons = ref([]);

      onBeforeMount(async () => {
        const result = await store.getData('books');
        console.log(result);
        if ('data' in result && !('error' in result.data)) {
          if (Object.keys(result.data).length) {
            books.push(...result.data.sort((a, b) => b.id - a.id));
          } else {
            console.log('table is empty');
          }
        }

        const personsData = await store.getData('persons');
        persons.value = personsData.data.map(x => ({ ...x, value: x.firstname + ' ' + x.lastname }));
        console.log(persons);
      });

      const confirm = () => {
        router.push('/book/');
      };

      return {
        confirm,
        formRef,
        books,
        persons,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
