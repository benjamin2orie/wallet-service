

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
    dbString: process.env.DB_STRING,
  },
  appUrl:{
    address:process.env.APP_URL,
  }

});
