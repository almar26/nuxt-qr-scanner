<template>
    <div class="d-flex align-center justify-center" style="height: 100vh">
      <v-card width="450" class="pt-2 mx-auto card-border" outlined>
  
        <h1 class="text-center my-5">Sign In</h1>
        
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit()" class="mx-15 text-center">
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="E-mail"
            prepend-inner-icon="mdi-email"
            outlined
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            label="Password"
            type="password"
            prepend-inner-icon="mdi-lock"
            outlined
            required
          ></v-text-field>
          <v-btn :disabled="!valid" color="primary" block type="submit">
            Sign In
          </v-btn>
          <div class="text-center py-5">or</div>
           <v-btn  color="red" block @click="loginWithGoogle">
           <v-icon left>mdi-google</v-icon> Sign In With Google
          </v-btn>
        </v-form>

  
        <v-card-actions class="mb-10 text-center">
          <v-spacer></v-spacer>
          <NuxtLink to="/auth/register" class="nuxt-link">Create an account</NuxtLink>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
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
        email: "",
        password: "",
        emailRules: [
          (v) => !!v || "E-mail is required",
          (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
        ],
        passwordRules: [(v) => !!v || "Password is required"],
      };
    },
    methods: {
      submit() {
        if (this.$refs.form.validate()) {
          this.isLoading = true
          // console.log("Successfully Login");
          // this.$router.push("/");
          this.login(this.email, this.password)
        }
      },
  
      login(email, password) {
        this.$auth
          .loginWith('local', {
            data: {
              identifier: email,
              password: password,
            },
          })
          .then((res) => {
            console.log('User Profile', res.data.user)
            console.log('User token', res.data.jwt)
          })
          .catch((error) => {
            console.log(error)
            if (error.response.data) {
              console.log(error.response.data.error.message)
              alert(error.response.data.error.message)
              this.isLoading = false
              this.isSignInDisabled = false
            }
          })
      },

      async loginWithGoogle() {
        try {
          await this.$auth.loginWith('google')
          .then(response => {
            console.log("Success: ", response)
          })
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
    color: rgba(0, 0, 0, 0.9);
    margin: 8px 0;
  }
  .hr-sect::before,
  .hr-sect::after {
    content: "";
    flex-grow: 1;
    background: rgba(0, 0, 0, 0.15);
    height: 1px;
    font-size: 0;
    line-height: 0;
    margin: 0 8px;
  }
  </style>