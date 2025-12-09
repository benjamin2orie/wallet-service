

export default () => ({
  port: parseInt(process.env.PORT || '3008', 10) || 3008,

  paystack: {
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackPublicteKey: process.env.PAYSTACK_PUBLIC_KEY,

  },

  google:{
    googleClientId:process.env.GOOGLE_CLIENT_ID,
    googleClientSecret:process.env.GOOGLE_CLIENT_SECRET,
    googleCallBackUrl:process.env.GOOGLE_CALLBACK_URL
  },

  jwt:{
    jwtSecret:process.env.JWT_SECRET,
  },

  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  appUrl:{
    address:process.env.APP_URL,
  }

});
