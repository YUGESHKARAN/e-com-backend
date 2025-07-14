const express = require('express');
const app = express();

const port = 3000;  
const bodyParser = require('body-parser');
const cors = require('cors');

// Middleware
app.use(
  cors({
    // origin: ["https://blog-frontend-teal-ten.vercel.app","http://localhost:5173","https://mongodb-rag-rho.vercel.app"],// Match your frontend domain
    origin: ["https://classy-gift-gallery.vercel.app","http://localhost:5173"],// Match your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connectToDatabase = require("./db");

connectToDatabase()

app.get('/',(req,res)=>{

    try{
    res.send('Hello World!');

    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

const productRoute = require("./routes/productRoutes") // product routes
const userRoute = require("./routes/userRoutes")      // user routes
const orderRoutes = require("./routes/orderRoutes")

app.use('/products',productRoute);
app.use('/users',userRoute);
app.use('/orders',orderRoutes);


app.listen(port, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log(`Server is running on http://localhost:${port}`);   
});



// {
//   "product_name":"wallet",
//   "description":"custom wallet",
//   "category":"wallet",
//   "price": 550,
//   "discount": 50,
//   "product_images":[],
//   "in_stock":true,
//   "banner": false,
//   "demo_video":""

// }