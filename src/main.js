import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './App.vue'
import router from './routers'
import Dialog from 'primevue/dialog';

import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';   
import FileUpload from 'primevue/fileupload';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext'; 
import RadioButton from 'primevue/radiobutton';
import RadioButtonGroup from 'primevue/radiobuttongroup';
import InputNumber from 'primevue/inputnumber';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import './style.css';
 // Assuming your router is here
 import Button from "primevue/button"
 import Textarea from 'primevue/textarea';

const app = createApp(App)
const pinia = createPinia()
app.component('Button', Button);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.component('Toolbar', Toolbar);
app.component('FileUpload', FileUpload);
app.component('Select', Select);
app.component('Textarea', Textarea);
app.component('RadioButton', RadioButton);
app.component('RadioButtonGroup', RadioButtonGroup);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Toast', Toast);
app.use(pinia)
app.use(router)
app.use(ToastService);
// 2. Tell your app to use PrimeVue
// (If you are using PrimeVue v4 with themes, you would pass the theme config here too)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})

app.mount('#app')