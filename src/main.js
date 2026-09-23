import 'dotenv/config';
import './common/db/mongoose.js';
import app from './app.js';

app.listen(3000,()=>{
    console.log('Server running on port 3000...');
})


