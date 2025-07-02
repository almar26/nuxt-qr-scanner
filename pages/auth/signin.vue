<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-card width="450" class="mx-auto card-border" outlined>

      <!-- <h1 class="text-center my-5">Sign In</h1> -->
      <v-img src="../logo.png" max-height="150" contain></v-img>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit()" class="mx-15 text-center">

        <v-text-field v-model="username" :rules="usernameRules" label="Username" prepend-inner-icon="mdi-account"
          outlined required></v-text-field>
        <v-text-field v-model="password" :rules="passwordRules" label="Password" type="password"
          prepend-inner-icon="mdi-lock" outlined required></v-text-field>
        <v-btn :disabled="!valid" :loading="isLoading" color="primary" block type="submit">
          Sign In
        </v-btn>
         <div class="hr-sect my-5">or sign in with</div>
        <v-btn color="red" block @click="loginWithGoogle">
          <v-icon left>mdi-google</v-icon> Sign In With Google
        </v-btn>
      </v-form>


      <v-card-actions class="mb-10 text-center">
        <v-spacer></v-spacer>
        <NuxtLink to="/auth/register" class="nuxt-link">Create an account</NuxtLink>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      top
    >
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          small
          icon
          v-bind="attrs"
          @click="snackbar = false"
        ><v-icon small>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  layout: "auth",
  middleware: 'auth',
  auth: 'guest',
  data() {
    return {
      valid: true,
      isLoading: false,
      email: "",
      username: "",
      password: "",
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      usernameRules: [(v) => !!v || "Username is required"],
      passwordRules: [(v) => !!v || "Password is required"],
      snackbar: false,
      snackbarColor: "",
      snackbarText: ""
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.isLoading = true;
        this.valid = false
        this.$auth.loginWith('local', {
          data: {
            identifier: this.username,
            password: this.password,
          }
        })
          .then(res => {
            console.log("User Profile: ", res.data.user)
            this.isLoading = false;
          })
          .catch(error => {
            console.log('Error')

            if (error.response.data) {
              console.log(error.response.data.error.message)
              //alert(error.response.data.error.message)
              this.snackbarColor = "red";
              this.snackbarText = error.response.data.error.message;
              this.snackbar = true;
              this.valid = true;
              this.isLoading = false;
            }
          })
      }
    },


    async loginWithGoogle() {
      try {
        await this.$auth.loginWith('google')
      } catch (error) {
        console.error("Google login failed: ", error)
      }
    }
  },
};
</script>
<style scoped>
.nuxt-link {
  text-decoration: none;
  padding-top: 5px;
}

.card-border {
  border-radius: 20px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.hr-sect {
  display: flex;
  flex-basis: 100%;
  align-items: center;
  /* color: rgba(0, 0, 0, 0.9); */
  color: rgba(161, 161, 161, 0.9);
  margin: 8px 0;
}

.hr-sect::before,
.hr-sect::after {
  content: "";
  flex-grow: 1;
  /* background: rgba(0, 0, 0, 0.15); */ 
  background: rgba(255, 255, 255, 0.15);
  height: 1px;
  font-size: 0;
  line-height: 0;
  margin: 0 5px;
}
</style>