
<!-- <template>
    <div class="card flex flex-col justify-center">
        <FloatLabel>
            <InputText id="username" v-model="username" />
            <label for="username">Username</label>
        </FloatLabel>
        <FloatLabel>
            <InputText id="password" v-model="password" type="password" />
            <label for="password">Password</label>
        </FloatLabel>
        <Button label="Submit" @click="handleLogin" />
    </div>
</template> -->

<!-- <script setup>
import { ref } from 'vue';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useUserStore } from '../stores/user';
const username = ref(null);
const password = ref(null);
const userStore = useUserStore();
function handleLogin() {
    userStore.login(username.value, password.value);
    if (userStore.isLoggedIn) {
        // Redirect to dashboard or home page
        router.push('/dashboard');
    } else {
        // Show error message
        alert('Invalid username or password');
    }
}
</script> -->

<template>



            
            
          

    <div class="card flex justify-center items-center min-h-screen">
        
        <form @submit.prevent="handleLogin" class="flex flex-col  gap-4 ">
            <div class="flex flex-col gap-1">
                <InputText v-model="username" name="username" type="text" placeholder="Username" fluid />
            </div>
            <div class="flex flex-col gap-1">
                <InputText v-model="password" name="password" type="password" placeholder="Password" fluid />
            </div>
            <Button type="submit" label="Submit"  />
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
const userStore = useUserStore();
const router = useRouter();
const username = ref('');
const password = ref('');

function handleLogin() {
    userStore.login(username.value, password.value);
    if (userStore.isLoggedIn) {
        // Redirect to transcation page
        router.push('/transcation');
    } else {
        // Show error message
        alert('Invalid username or password');
    }
}
</script>
        