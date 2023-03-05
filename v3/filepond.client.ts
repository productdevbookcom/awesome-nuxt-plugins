// import VueFilePond from 'vue-filepond';
// import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
// // @ts-ignore No types yet
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
// import 'filepond/dist/filepond.min.css';
// const FilePond = VueFilePond(
//     FilePondPluginFileValidateType,
//     FilePondPluginImagePreview
// );

import { Component } from 'vue'

import vueFilePond from 'vue-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginImageEdit from 'filepond-plugin-image-edit'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageCrop from 'filepond-plugin-image-crop'
import FilePondPluginFileEncode from 'filepond-plugin-file-encode'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'
import 'filepond-plugin-image-edit/dist/filepond-plugin-image-edit.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
const FilePond = vueFilePond(
  FilePondPluginFileEncode,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit,
) as Component

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FilePond', FilePond)
})
