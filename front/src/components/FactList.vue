<template>

  <MainTitle title="События" :callback="confirm"></MainTitle>
  <el-row type="flex" justify="center">
    <el-switch style="display: block;"
               v-model="sortMode"
               active-color="black"
               inactive-color="gray"
               active-text="По дате"
               inactive-text="По созданию"
               @change="loadFacts">
    </el-switch>
  </el-row>

  <el-row v-for="(value, key) in facts" :gutter="20" :key="key">

    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        <span :title="value.stamp">{{value.datedesc}}</span>
      </div>
    </el-col>

    <el-col :span="16">
      <div class="grid-content bg-purple">
        {{value.title}}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/fact/' + value.id">
          <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

  </el-row>

</template>

<script lang="ts">

  import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance, h } from 'vue';
  import { ElForm } from 'element-plus';
  import router from '../router';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const sortMode = ref(false);
      const facts = ref([]);

      const sortBy = (attr: String) => {
        return attr === 'id'
          ? (a, b) => {
              return b[attr] - a[attr];
            }
          : (a, b) => {
              return new Date(b[attr]) - new Date(a[attr]);
            };
      };

      const loadFacts = async () => {
        const attr = sortMode.value ? 'stamp' : 'id';
        const result = await store.getData('facts');
        // console.log(result);
        if ('data' in result && !('error' in result.data)) {
          if (Object.keys(result.data).length) {
            facts.value = result.data.sort(sortBy(attr));
          } else {
            console.log('table is empty');
          }
        }
      };

      onBeforeMount(async () => {
        await loadFacts();
      });

      const confirm = () => {
        router.push('/fact');
      };

      return {
        confirm,
        formRef,
        facts,
        sortMode,
        loadFacts,
      };
    },

    components: {
      MainTitle,
    },
  });

</script>
