<template>
    <MainTitle :title="store.loc('place') + ' ' + vuerouter.params.id" :callback="confirm"
        :text="place.id ? store.loc('save') : store.loc('add')">
    </MainTitle>

    <el-form :model="place" ref="formRef" label-width="6rem" :rules="rules" v-if="isLoaded">

        <el-form-item prop="title" :label="store.loc('name')">
            <el-input :placeholder="store.loc('title')" v-model="place.name" class="text-input"></el-input>
        </el-form-item>

        <el-form-item prop="location" :label="store.loc('location')">
            <el-space>
                <el-input-number :placeholder="store.loc('lat')" :controls="false" v-model="place.location.y" />
                <el-input-number :placeholder="store.loc('lon')" :controls="false" v-model="place.location.x" />
            </el-space>
        </el-form-item>

        <el-form-item prop="wikidata" :label="store.loc('wikidata')">
            <el-input :placeholder="store.loc('wikidata')" v-model="place.wikidata" class="text-input"></el-input>
        </el-form-item>

        <el-form-item prop="note" :label="store.loc('note')">
            <el-input :placeholder="store.loc('note')" v-model="place.note" class="text-input"></el-input>
        </el-form-item>

    </el-form>
</template>


<script setup lang="ts">
import { onBeforeMount, ref, reactive } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';

let place = ref({} as IPlace);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const isLoaded = ref(false);

const rules = {
    name: [
        {
            required: true,
            message: store.loc('fieldnonempty'),
            trigger: 'blur',
        },
        { min: 3, message: store.loc('fieldnonempty'), trigger: 'blur' },
    ],
};

const confirm = () => {
    console.log("ok");
};

onBeforeMount(async () => {
    if (id) {
        const { data } = await store.getData('places', id);
        if (data) {
            const datum = data.shift();
            if (!datum?.location) {
                datum.location = { x: 0, y: 0 };
            }
            place.value = datum;
        }
        isLoaded.value = true;
    }
});

</script>
