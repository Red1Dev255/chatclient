import { createApp } from 'vue'
import App from './App.vue'
import 'primeicons/primeicons.css';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css'; 

import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice'
import Tooltip from 'primevue/tooltip'; 


import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Panel from 'primevue/panel';

import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import FloatLabel from 'primevue/floatlabel';


const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(ConfirmationService);
app.use(ToastService);
app.use(DialogService);
app.directive('tooltip', Tooltip);

app.component('Card', Card);
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Message', Message);
app.component('Panel', Panel);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Toast', Toast);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('FloatLabel', FloatLabel);



app.mount('#app');