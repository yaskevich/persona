<template>
    <MainTitle :title="store.loc('place') + ' ' + vuerouter.params.id" :callback="confirm"
        :text="place.id ? store.loc('save') : store.loc('add')">
    </MainTitle>

    <el-form :model="place" ref="formRef" label-width="6rem" :rules="rules" v-if="isLoaded">

        <el-form-item prop="name" :label="store.loc('name')">
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

        <el-form-item>
            <el-popconfirm v-if="place?.id" :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
                :cancelButtonText="store.loc('no')" @confirm="deletePlace">

                <template #reference>
                    <el-button type="danger">{{ store.loc('remove') }}</el-button>
                </template>
            </el-popconfirm>
        </el-form-item>

    </el-form>
</template>


<script setup lang="ts">
import { ElForm, ElNotification } from 'element-plus';
import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';
import { h } from 'vue';

const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
const place = ref({} as IPlace);
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
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            const { data } = await store.postData('places', place.value);
            if (data?.id) {
                if (!place?.value?.id) {
                    router.push('/place/' + data.id);
                }
                place.value.id = data.id;
            } else {
                console.log('error!');
            }
        } else {
            return false;
        }
    });
};

const deletePlace = async () => {
    const { data } = await store.deleteById('places', place.value.id);
    console.log("data", data);
    if (data?.id) {
        router.push('/places');
    } else if (Number.isInteger(data.error)) {
        ElNotification({
            title: store.loc('remprob'),
            message: h('i', { style: 'color: teal' }, `${store.loc('facts')}: ${data.error}`),
            type: 'warning',
        })
    }
};

onBeforeMount(async () => {
    if (id) {
        const { data } = await store.getData('places', id);
        if (data) {
            place.value = data.shift();
        }
    }
    if (!place.value?.location) {
        place.value.location = { x: 0, y: 0 };
    }

    isLoaded.value = true;
});

</script>
