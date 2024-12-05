<template>
    <h5>{{ work?.title }}</h5>
    <el-button @click="saveText" type="warning">{{ store.loc('save') }}</el-button>
    <div class="editorboard">
        <editor-content :editor="customEditor" class="editor" />
        <div class="counter" v-if="customEditor">
            {{ customEditor.storage.characterCount.characters() }} characters /
            {{ customEditor.storage.characterCount.words() }} words
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount, ref, reactive } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { useRoute } from 'vue-router';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Image from '@tiptap/extension-image';
import Dropcursor from '@tiptap/extension-dropcursor';
import CharacterCount from '@tiptap/extension-character-count';
import Gapcursor from '@tiptap/extension-gapcursor';
import store from '../store';

const vuerouter = useRoute();
const work = ref({} as IWork);
const html = ref('');
const id = String(vuerouter.params.id);

const saveText = async () => {
    const textContent = customEditor.getText()?.trim();
    if (textContent) {
        const htmlContent = customEditor.getHTML();
        // console.log(htmlContent);
        const result = await store.postData('text', { ...work.value, text: htmlContent });
        console.log(result?.data);
    }
};


const customEditor = new Editor({
    content: '',
    autofocus: 'start',
    editable: true,
    extensions: [
        Document,
        Paragraph,
        Text,
        Color,
        Placeholder.configure({
            placeholder: 'Put a text here...',
        }),
        Blockquote.extend({
            content: 'paragraph*',
        }).configure({
            HTMLAttributes: {
                class: 'quote',
            },
        }),
        Bold.configure({
            HTMLAttributes: {
                class: 'em',
            },
        }),
        Image,
        Dropcursor,
        CharacterCount.configure(),
        Gapcursor,
    ],
    // onUpdate({ editor }) {
    //   // The content has changed.
    //   console.log("TT changed!");
    // },
    onCreate({ editor }) {
        // The editor is ready.
        // console.log("TT ready", editor, props);
        // if (props.content) {
        //   editor.commands.setContent(props.content, false);
        // }
    },
    // onDestroy() {
    //   // The editor is being destroyed.
    //   console.log("TT bye");
    // },
});

onBeforeUnmount(() => {
    // console.log("TT component unmount");
    customEditor.destroy();
});

onBeforeMount(async () => {
    // console.log('router id', id);
    if (id) {
        const { data } = await store.getData('works', id);
        if (data) {
            work.value = data[0];
            // console.log('this work', work.value);
        }
        if (work?.value?.hash) {
            const result = await store.getData('text', work.value.hash);
            customEditor.commands.setContent(result.data);
        }
    }
});


</script>


<style scoped lang="scss">
:deep(.ProseMirror) {
    min-height: 200px;
    padding: 0.75em;
    color: rgba(47, 42, 42, 0.95);
    font-size: .9rem;

    &:focus {
        outline: none;
    }

    /*  > * + * {
    margin-top: 0.75em;
  }
*/
    margin-bottom: 0.5em;

    img {
        display: block;
        /*
    max-width: 90%;
    max-height: 200px;
    padding: 10px;*/
        max-width: min(100%, 25rem);
        height: auto;
        border-radius: 0.5rem;
    }

    :deep(img.ProseMirror-selectednode) {
        outline: 3px solid #68cef8;
    }

    /*
  img {
    max-width: 90%;
    max-height: 200px;
    padding: 10px;


  }
  */
    p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #adb5bd;
        pointer-events: none;
        height: 0;
    }

    p {
        margin: auto;
    }
}

:deep(div.even > div.ProseMirror) {
    /* border: 5px dashed orange; */
    // background-color: rgba(255, 166, 0, 0.125);

    &.ProseMirror-focused {
        background-color: white;
        border: 5px dashed #18a058;
    }

    /* background-color: #feebdd; */
}

:deep(div.odd > div.ProseMirror) {
    // background-color: rgba(124, 124, 177, 0.189);

    &.ProseMirror-focused {
        background-color: white;
        border: 5px dashed #1060c9;
        // rgb(124, 124, 177);
    }
}

:deep(.editorboard) {
    display: inline-block;
    text-align: left;
    min-width: 100%;
    margin-top: 0.5em;
}

.selectable {
    border: 3px solid gray;
    cursor: grab;
    transition: all 0.2s ease-in-out;

    &:hover {
        transform: scale(1.2);
        position: relative;
        z-index: 1000;
    }
}

.counter {
    color: #868e96;
    margin-top: -1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    text-align: center;
}

button {
    margin-right: 1px;
}

:deep(.csl-entry) {
    padding: 0.5rem;
    background: rgba(171, 196, 207, 0.745);
    border-radius: 3px;
    margin-bottom: 1rem;
}

.modal-caption {
    border: none;
    margin-top: -15px;
    font-size: 0.75rem;
}
</style>