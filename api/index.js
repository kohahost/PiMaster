import express from 'express';
import { request } from 'undici';
import { URLSearchParams } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// <<< PATH DIUBAH untuk menyesuaikan dengan struktur folder /api
app.use(express.static(path.join(__dirname, '../public'))); 
app.use(express.json());

app.post('/api/submit', async (req, res) => {
    const { xdr } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    console.log(`[${timestamp}] Request Baru Masuk!`);
    console.log(`  IP: ${clientIp}`);
    console.log(`  XDR Diterima: ${xdr || 'Tidak ada XDR'}`);

    if (!xdr) {
        const errorMessage = "Bad request: XDR is empty";
        console.error(`[${timestamp}] ERROR: ${errorMessage} dari IP ${clientIp}`);
        return res.status(400).json({ error: errorMessage });
    }

    const formData = new URLSearchParams();
    formData.append("tx", xdr);

    try {
        const horizonSubmitURL = "http://4.194.35.14:31401/transactions"; 
        
        console.log(`[${timestamp}] Meneruskan request ke: ${horizonSubmitURL}`);

        const response = await request(horizonSubmitURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const result = await response.body.json();

        console.log(`[${timestamp}] Hasil Submit ke Horizon:`);
        console.log(`  Status HTTP: ${response.statusCode}`);
        console.log(`  IP Asal: ${clientIp}`);
        console.log('  Respon:', JSON.stringify(result, null, 2));

        return res.status(response.statusCode).json(result);

    } catch (err) {
        const errorMessage = "Gagal koneksi ke Horizon";
        console.error(`[${timestamp}] ERROR Koneksi ke Horizon:`);
        console.error(`  IP Asal: ${clientIp}`);
        console.error(`  Pesan Error: ${err.message}`);

        return res.status(502).json({
            error: errorMessage,
            message: err.message
        });
    }
});

// <<< HAPUS BAGIAN app.listen() INI
/*
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
*/

// <<< TAMBAHKAN BARIS INI untuk mengekspor aplikasi
export default app;
