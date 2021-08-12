<template>

  <MainTitle :title="loc('work') + ' ' + $route.params.id " :callback="confirm" :text="work.id ? loc('save'): loc('add')"></MainTitle>

  <el-form :model="work" ref="formRef" label-width="100px" :rules="rules">

    <el-form-item prop="title" :label="loc('title')">
      <el-input :placeholder="loc('title')" v-model="work.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="genre" :label="loc('genre')">
      <el-select v-model="work.genre" filterable :placeholder="loc('genre')">
        <el-option v-for="item in genres"
                   :key="item.id"
                   :label="item.title"
                   :value="item.id">
        </el-option>
      </el-select>
      {{work.genrename}}
    </el-form-item>

    <el-form-item :label="loc('authors')">
      <el-space wrap>
        <el-select v-model="work.authors" filterable multiple :placeholder="loc('authors')">
          <el-option v-for="item in persons"
                     :key="item.id"
                     :label="item.value"
                     :value="item.id">
          </el-option>
        </el-select>

        <el-button type="primary"
                   @click="setDefaultAuthor"
                   v-if="persons.length && mainperson">{{loc('author')}} – {{persons.filter(x=>x.id === mainperson)[0].value}}</el-button>
      </el-space>
    </el-form-item>

    <!-- <el-button type="primary" @click="resetForm">{{loc('reset')}}</el-button> -->
    <el-form-item>
      <el-button type="primary" @click="confirm">{{loc('save')}}</el-button>
    </el-form-item>

    <el-form-item>
      <el-popconfirm v-if="work?.id"
                     :title="loc('confirmdel')"
                     :confirmButtonText="loc('yes')"
                     :cancelButtonText="loc('no')"
                     @confirm="deleteWork">
        <template #reference>
                  <el-button type="danger">{{loc('remove')}}</el-button>
                  </template>
      </el-popconfirm>
    </el-form-item>

  </el-form>

</template>

<script lang="ts">

  import { ElForm } from 'element-plus';
  import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
  import store from '../store';
  import { useRoute } from 'vue-router';
  import router from '../router';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const work = ref({});
      const works = reactive([]);
      const genres = reactive([]);
      const persons = ref([]);
      const vuerouter = useRoute();
      const id = vuerouter.params.id;

      onBeforeMount(async () => {
        // console.log('router id', id);
        if (id) {
          const { data } = await store.getData('works', id);
          if (data) {
            work.value = data[0];
            // console.log('this work', work.value);
          }
        }

        const resultWorks = await store.getData('works');
        if ('data' in resultWorks) {
          works.push(...resultWorks.data);
        }

        const personsData = await store.getData('persons');
        persons.value = personsData.data.map(x => ({ ...x, value: x.firstname + ' ' + x.lastname }));
        // console.log(persons);

        const genresData = await store.getData('genres');
        if ('data' in genresData) {
          genres.push(...genresData.data);
        }
      });

      // const resetForm = () => {
      //   formRef.value?.resetFields();
      // };

      const setDefaultAuthor = () => {
        work.value.authors = [store.state.user.settings.persona];
      };

      const confirm = () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            const result = await store.postData('works', work.value);
            /* console.log(result); */
            if ('data' in result && 'id' in result.data) {
              router.push('/works');
            } else {
              console.log('error!');
            }
          } else {
            return false;
          }
        });
      };

      const deleteWork = async () => {
        // console.log(work.value.id);
        const result = await store.deleteById('works', work.value.id);
        if ('data' in result && 'id' in result.data) {
          router.push('/works');
        }
      };

      const rules = {
        title: [
          {
            required: true,
            message: store.loc('fieldnonempty'),
            trigger: 'blur',
          },
          { min: 2, message: store.loc('fieldnonempty'), trigger: 'blur' },
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
        mainperson: store.state.user.settings.persona,
        deleteWork,
        genres,

        loc: store.loc,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
