const express = require('express');
const axios = require('axios');

const app = express();

const PORT = 9876;
const WND_SIZE = 10;
const qualifiedIds = ['e', 'p', 'f', 'r'];
let currWnd = new Set();
let prevWnd = new Set();


app.use(express.json());

const getNums = async(id)=>{
    
    try{

        let reqId;
        switch(id){
            case 'e':
                reqId = 'even';
                break;
            case 'p':     
                reqId = 'primes';
                break;
            case 'f':
                reqId = 'fibo';
                break;
            case 'r':
                reqId = 'rand';
                break;
            default:
                return [];
        }

        // console.log( "reqId: ", reqId);

        const response = await Promise.race([
            await axios.get(`http://20.244.56.144/evaluation-service/${reqId}`, {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjAzNjM2LCJpYXQiOjE3NDM2MDMzMzYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjE5MmJkMjQ1LTYxYjUtNDc1Yy1hNmE0LTMyNzQ5NzBmM2ZlNyIsInN1YiI6IjIyMDU0MTczQGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1NDE3M0BraWl0LmFjLmluIiwibmFtZSI6InNpZGRoYXJ0aCBzZW5ndXB0YSIsInJvbGxObyI6IjIyMDU0MTczIiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiMTkyYmQyNDUtNjFiNS00NzVjLWE2YTQtMzI3NDk3MGYzZmU3IiwiY2xpZW50U2VjcmV0IjoidnJIVHJWSEVucFFad0huZyJ9.EayXgSGx6-NLtVHcKIOMl0ilXK4UZ8O6t3_BAsWJiTk`
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 500)
            ),
        ]);
        return response.data.numbers || [];
    }
    catch(e){
        console.error("API Error:", e.response?.status, e.response?.data);
        return [];
    }
}


const updateWindow = (newNums) => {
    prevWnd = new Set(currWnd); 
    newNums.forEach((num) => currWnd.add(num));

    while (currWnd.size > WND_SIZE) {
        const last = currWnd.values().next().value; 
        currWnd.delete(last);
    }
};

app.get('/numbers/:id', async (req, res) => {
    
    const id = req.params.id;

    if(!qualifiedIds.includes(id)){
        return res.status(400).json({error: 'Invalid id'});
    }

    const newNums = await getNums(id);
    updateWnd(newNums);

    const wndArr = Array.from(currWnd);
    const avg = (wndArr.length) ? (wndArr.reduce((acc, num) => acc + num, 0) / wndArr.length) : (0);

    return res.json({
        WindowPrevState: Array.from(prevWnd),
        WindowCurrState: wndArr,
        numbers: newNums,
        avg: avg,
    });

});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

